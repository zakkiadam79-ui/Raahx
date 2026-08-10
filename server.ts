import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_SESSION_COOKIE = "raahx_admin_session";
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;

type AdminSession = {
  expiresAt: number;
};

type LoginAttemptWindow = {
  startedAt: number;
  count: number;
};

// Sessions are intentionally kept on the server. The browser receives only an
// opaque, HTTP-only session cookie and never receives the admin secret.
const adminSessions = new Map<string, AdminSession>();
const loginAttempts = new Map<string, LoginAttemptWindow>();

function readCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const cookieName = cookie.slice(0, separatorIndex).trim();
    if (cookieName !== name) continue;

    const cookieValue = cookie.slice(separatorIndex + 1).trim();
    try {
      return decodeURIComponent(cookieValue);
    } catch {
      return null;
    }
  }

  return null;
}

function setAdminSessionCookie(res: Response, sessionId: string): void {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearAdminSessionCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
}

function getValidAdminSessionId(req: Request): string | null {
  const sessionId = readCookie(req, ADMIN_SESSION_COOKIE);
  if (!sessionId) return null;

  const session = adminSessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionId);
    return null;
  }

  return sessionId;
}

function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  if (!getValidAdminSessionId(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  next();
}

function secretsMatch(submittedSecret: string, configuredSecret: string): boolean {
  // Hashing both values gives timingSafeEqual buffers the same length while
  // avoiding a direct, timing-sensitive string comparison.
  const submittedDigest = createHash("sha256").update(submittedSecret, "utf8").digest();
  const configuredDigest = createHash("sha256").update(configuredSecret, "utf8").digest();
  return timingSafeEqual(submittedDigest, configuredDigest);
}

function canAttemptLogin(clientIp: string): boolean {
  const now = Date.now();
  const currentWindow = loginAttempts.get(clientIp);

  if (!currentWindow || now - currentWindow.startedAt >= LOGIN_RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(clientIp, { startedAt: now, count: 1 });
    return true;
  }

  if (currentWindow.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  currentWindow.count += 1;
  return true;
}

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}


// MongoDB Schema
const proposalSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  companyName: { type: String, required: true },
  businessEmail: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  industry: { type: String, required: true },
  services: { type: String, required: true },
  budget: { type: String, required: true },
  timeline: { type: String, required: true },
  projectDetails: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now }
});

const Proposal = mongoose.model("Proposal", proposalSchema);

// Blog view-count Schema (powers real "Popular Posts" ranking)
const blogViewSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  views: { type: Number, default: 0 },
});

const BlogView = mongoose.model("BlogView", blogViewSchema);

// Newsletter subscriber Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET must be configured before starting in production.");
  }

  if (!adminSecret) {
    console.warn("ADMIN_SECRET is not configured. Admin login is disabled.");
  }

  app.use(express.json());

  // Connect to MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Fail fast if IP is not whitelisted
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error (check IP whitelist in Atlas):", error.message);
    }
  } else {
    console.warn("MONGODB_URI not provided. Running without database connection.");
  }

  // Nodemailer Transporter. SMTP_PASS is read only on the server; it is never
  // bundled into the React/Vite client or returned by an API response.
  const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || "465", 10);
  const configuredSecureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const requestedSecure = configuredSecureValue === undefined
    ? undefined
    : /^(true|1|yes)$/i.test(configuredSecureValue)
    ? true
    : /^(false|0|no)$/i.test(configuredSecureValue)
    ? false
    : undefined;
  // Port 465 is implicit TLS; port 587 is plaintext until STARTTLS.
  // Enforce the matching mode so an accidental env mismatch cannot cause
  // Nodemailer's SSL "wrong version number" error.
  const smtpSecure = smtpPort === 465
    ? true
    : smtpPort === 587
    ? false
    : requestedSecure ?? true;

  if (requestedSecure !== undefined && requestedSecure !== smtpSecure) {
    console.warn(`SMTP_SECURE does not match SMTP_PORT ${smtpPort}; using secure=${smtpSecure}.`);
  }
  const smtpUser = process.env.SMTP_USER || "hello@raahx.com";
  const mailFrom = process.env.MAIL_FROM || "hello@raahx.com";
  const mailTo = process.env.MAIL_TO || "hello@raahx.com";

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: process.env.SMTP_PASS,
    },
  });

  const isSafeEmail = (value: unknown): value is string => (
    typeof value === "string"
    && !/[\r\n]/.test(value)
    && /^\S+@\S+\.\S+$/.test(value)
  );

  const getReplyTo = (value: unknown): string | undefined => (
    isSafeEmail(value) ? value : undefined
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/admin/login", (req, res) => {
    const { secret } = req.body ?? {};

    if (typeof secret !== "string" || secret.length === 0) {
      return res.status(400).json({ error: "A secret is required" });
    }

    if (!adminSecret) {
      return res.status(503).json({ error: "Authentication is unavailable" });
    }

    if (!canAttemptLogin(getClientIp(req))) {
      return res.status(429).json({ error: "Too many login attempts" });
    }

    if (!secretsMatch(secret, adminSecret)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const previousSessionId = getValidAdminSessionId(req);
    if (previousSessionId) {
      adminSessions.delete(previousSessionId);
    }

    const sessionId = randomBytes(32).toString("hex");
    adminSessions.set(sessionId, { expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });
    loginAttempts.delete(getClientIp(req));
    setAdminSessionCookie(res, sessionId);

    return res.status(200).json({ authenticated: true });
  });

  app.get("/api/admin/session", (req, res) => {
    res.status(200).json({ authenticated: Boolean(getValidAdminSessionId(req)) });
  });

  app.post("/api/admin/logout", (req, res) => {
    const sessionId = readCookie(req, ADMIN_SESSION_COOKIE);
    if (sessionId) {
      adminSessions.delete(sessionId);
    }

    clearAdminSessionCookie(res);
    return res.status(200).json({ authenticated: false });
  });

  // Save a newsletter subscriber
  app.post("/api/subscribers", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "A valid email is required" });
      }
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: "Database not connected" });
      }
      await Subscriber.updateOne(
        { email: email.toLowerCase().trim() },
        { $setOnInsert: { email: email.toLowerCase().trim(), subscribedAt: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ message: "Subscribed" });
    } catch (error) {
      console.error("Error saving subscriber:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Manually trigger a "new post" email blast to every subscriber.
  // NOTE: there is no admin login in this project, so this is not wired to
  // an automatic "post published" event (posts are static code, not stored
  // in a CMS). Call this endpoint yourself (e.g. with curl or Postman) after
  // you add a new blog post, with { "title": "...", "slug": "..." } in the body.
  // Before exposing this publicly, add authentication so only you can call it.
  app.post("/api/notify-subscribers", async (req, res) => {
    try {
      const { title, slug } = req.body;
      if (!title || !slug) {
        return res.status(400).json({ error: "title and slug are required" });
      }
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: "Database not connected" });
      }
      const subscribers = await Subscriber.find({});
      if (subscribers.length === 0) {
        return res.status(200).json({ message: "No subscribers to notify", sent: 0 });
      }
      const postUrl = `${process.env.APP_URL || ""}/blog/${slug}`;
      let sent = 0;
      for (const sub of subscribers) {
        try {
          await transporter.sendMail({
            from: `"RaahX" <${mailFrom}>`,
            to: sub.email,
            subject: `New on the RaahX Blog: ${title}`,
            html: `
              <h2>${title}</h2>
              <p>We just published a new article on the RaahX Blog.</p>
              <p><a href="${postUrl}">Read it here</a></p>
              <br/>
              <p>— The RaahX Team</p>
            `,
          });
          sent++;
        } catch (mailErr) {
          console.error(`Failed to notify ${sub.email}:`, mailErr);
        }
      }
      res.status(200).json({ message: "Notifications sent", sent, total: subscribers.length });
    } catch (error) {
      console.error("Error notifying subscribers:", error);
      res.status(500).json({ error: "Failed to notify subscribers" });
    }
  });
  app.post("/api/blog-views/:slug", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({ views: 0, tracked: false });
      }
      const { slug } = req.params;
      const updated = await BlogView.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
      res.status(200).json({ views: updated.views, tracked: true });
    } catch (error) {
      console.error("Error recording blog view:", error);
      res.status(200).json({ views: 0, tracked: false });
    }
  });

  // Fetch the most-viewed blog slugs, sorted highest to lowest (real traffic, not hardcoded)
  app.get("/api/blog-views/popular", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({ posts: [] });
      }
      const limit = parseInt((req.query.limit as string) || "3");
      const topViewed = await BlogView.find({ views: { $gt: 0 } })
        .sort({ views: -1 })
        .limit(limit);
      res.status(200).json({
        posts: topViewed.map((doc) => ({ slug: doc.slug, views: doc.views })),
      });
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      res.status(200).json({ posts: [] });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const data = req.body;
      
      // Save to database
      if (process.env.MONGODB_URI) {
         if (mongoose.connection.readyState === 1) {
           const newProposal = new Proposal(data);
           await newProposal.save();
         } else {
           console.warn("Database is not connected. Skipping database save (check your MongoDB IP whitelist).");
         }
      }

      // Prepare email content
      const adminMailOptions = {
        from: `"RaahX" <${mailFrom}>`,
        replyTo: getReplyTo(data.businessEmail),
        to: mailTo,
        subject: "New Proposal Request - RaahX",
        html: `
          <h2>New Proposal Request</h2>
          <p><strong>Full Name:</strong> ${data.fullName}</p>
          <p><strong>Company Name:</strong> ${data.companyName}</p>
          <p><strong>Email:</strong> ${data.businessEmail}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Website:</strong> ${data.website || "N/A"}</p>
          <p><strong>Industry:</strong> ${data.industry}</p>
          <p><strong>Services:</strong> ${data.services}</p>
          <p><strong>Budget (PKR):</strong> ${data.budget}</p>
          <p><strong>Timeline:</strong> ${data.timeline}</p>
          <p><strong>Project Details:</strong></p>
          <p>${data.projectDetails}</p>
          <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
        `,
      };

      const clientMailOptions = {
        from: `"RaahX" <${mailFrom}>`,
        to: getReplyTo(data.businessEmail),
        subject: "Thank You for Contacting RaahX",
        html: `
          <p>Thank you for contacting RaahX.</p>
          <p>We have received your proposal request.</p>
          <p>Our team will review your requirements and contact you within 24 hours.</p>
          <br/>
          <p>Best regards,</p>
          <p>The RaahX Team</p>
        `,
      };

      // Send emails
      if (process.env.SMTP_PASS) {
         await transporter.sendMail(adminMailOptions);
         await transporter.sendMail(clientMailOptions);
      } else {
         console.warn("SMTP credentials not provided. Skipping emails.");
      }

      res.status(200).json({ message: "Proposal submitted successfully" });
    } catch (error) {
      console.error("Error processing proposal:", error);
      res.status(500).json({ error: "Failed to process proposal" });
    }
  });

  // Keep malformed JSON responses generic instead of exposing parser details.
  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/") && error instanceof SyntaxError) {
      return res.status(400).json({ error: "Malformed request" });
    }

    next(error);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
