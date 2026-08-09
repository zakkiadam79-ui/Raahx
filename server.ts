import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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

  // Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
            from: `"RaahX" <${process.env.SMTP_USER}>`,
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
        from: `"${data.fullName}" <${process.env.SMTP_USER}>`, // Use authenticated user as sender to avoid DMARC issues
        replyTo: data.businessEmail,
        to: process.env.NOTIFICATION_EMAIL || "dngroup786@gmail.com",
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
        from: `"RaahX" <${process.env.SMTP_USER}>`,
        to: data.businessEmail,
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
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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
