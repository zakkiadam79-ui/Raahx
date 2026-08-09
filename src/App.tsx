/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
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
import ServiceDetail from "./pages/ServiceDetail";
import AboutPage from "./pages/AboutPage";
import BlogIndex from "./pages/BlogIndex";
import BlogDetail from "./pages/BlogDetail";
import CaseStudyDetail from "./pages/CaseStudyDetail"; // <-- 1. Import CaseStudyDetail
import AdminLayout from "./pages/admin/AdminLayout"; // <-- Import Admin Panel component

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/case-studies/:slug" element={<CaseStudyDetail />} /> {/* <-- 2. Added Case Study Route */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/proposal" element={<ProposalForm />} />
        <Route path="/admin/*" element={<AdminLayout />} /> {/* <-- Added Admin Route */}
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp />}
    </div>
  );
}