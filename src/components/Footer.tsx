/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from "react";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import logoImage from "../assets/images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 mb-6 group">
              <img src={logoImage} alt="RaahX" className="h-14 md:h-20 w-auto object-contain grayscale invert mix-blend-screen" />
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering brands with data-driven strategies, creative excellence, and innovative technology. Your path, powered by innovation.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/18sn1Jj7ZT/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/raahxofficial" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@raahxoffical" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors">
                {/* Custom TikTok Icon SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-heading font-semibold mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="/services/digital-marketing" className="hover:text-primary transition-colors">Digital Marketing</a></li>
              <li><a href="/services/social-media-marketing" className="hover:text-primary transition-colors">Social Media Marketing</a></li>
              <li><a href="/services/seo-services" className="hover:text-primary transition-colors">SEO Services</a></li>
              <li><a href="/services/website-development" className="hover:text-primary transition-colors">Website Development</a></li>
              <li><a href="/services/branding" className="hover:text-primary transition-colors">Branding</a></li>
              <li><a href="/services/meta-advertising" className="hover:text-primary transition-colors">Meta Advertising</a></li>
              <li><a href="/services/ai-automation" className="hover:text-primary transition-colors">AI Automation</a></li>
              <li><a href="/services/graphic-design" className="hover:text-primary transition-colors">Graphic Design</a></li>
              <li><a href="/services/business-strategy" className="hover:text-primary transition-colors">Business Strategy</a></li>
              <li><a href="/services/app-development" className="hover:text-primary transition-colors">App Development</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-heading font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/#case-studies" className="hover:text-primary transition-colors">Case Studies</a></li>
              <li><a href="/#process" className="hover:text-primary transition-colors">Our Process</a></li>
              <li><a href="/#team" className="hover:text-primary transition-colors">Team</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-heading font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+923184569997" className="hover:text-white transition-colors">+92 318 4569997</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:itsqasim.work@gmail.com" className="hover:text-white transition-colors">itsqasim.work@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <a 
                  href="https://www.google.com/maps/place/Bedadi+Interchange/@34.4430976,73.2453826,15z/data=!4m10!1m2!2m1!1sNear+bedadi+interchange+CPEC+District+Manshera!3m6!1s0x38de1773d4cb4e1b:0x2290a075386b78bb!8m2!3d34.4430976!4d73.2616689!15sCi5OZWFyIGJlZGFkaSBpbnRlcmNoYW5nZSBDUEVDIERpc3RyaWN0IE1hbnNlaHJhWjAiLm5lYXIgYmVkYWRpIGludGVyY2hhbmdlIGNwZWMgZGlzdHJpY3QgbWFuc2VocmGSAQZicmlkZ2WaASNDaFpEU1VoTk1HOW5TMFZKUTBGblNVTm9lWFJIYWs5QkVBReABAPoBBAgAEDY!16s%2Fg%2F11nc9xz37x?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Near Bedadi Interchange, Mansehra
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {} 2025 RaahX. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}