/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import CaseStudies from "./components/CaseStudies";
import Process from "./components/Process";
import Team from "./components/Team";
import ProposalForm from "./components/ProposalForm";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

const FAQPage = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));
const CreatorNetwork = lazy(() => import("./pages/CreatorNetwork"));
const CreatorDetail = lazy(() => import("./pages/CreatorDetail"));
const CreatorJoin = lazy(() => import("./pages/CreatorJoin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

function CanonicalUrl() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      document.head.querySelector("link[rel=\"canonical\"]")?.remove();
      return;
    }

    const pathname = location.pathname === "/"
      ? "/"
      : location.pathname.replace(/\/+$/, "");
    const canonicalUrl = `https://raahx.com${pathname || "/"}`;
    let canonical = document.head.querySelector<HTMLLinkElement>("link[rel=\"canonical\"]");

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;
  }, [location.pathname]);

  return null;
}

function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Process />
      <WhyChooseUs />
      <CaseStudies />
      <Team />
      <ProposalForm />
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background text-gray-900 font-body selection:bg-primary/20 selection:text-primary-dark">
      {!isAdminRoute && <Header />}
      <ScrollToHash />
      <CanonicalUrl />
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
          <Route path="/creator-network" element={<CreatorNetwork />} />
          <Route path="/creator-network/join" element={<CreatorJoin />} />
          <Route path="/creator-network/:id" element={<CreatorDetail />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/proposal" element={<ProposalForm />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp />}
    </div>
  );
}