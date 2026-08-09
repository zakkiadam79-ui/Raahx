import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import logoImage from "../assets/images/logo.png";
import { servicesData as staticServices, type ServiceData } from "../data/servicesData";
import {
  fetchServicesFromApi,
  getStoredServices,
  isServiceApiConfigured,
} from "../services/serviceStore";
import { getServiceIcon } from "../utils/getServiceIcon";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [services, setServices] = useState<ServiceData[]>(staticServices);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Keep the header menu synchronized with the same normalized service store
  // used by the public Services section and service detail pages.
  useEffect(() => {
    let isMounted = true;
    setServices(getStoredServices());

    if (!isServiceApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchServicesFromApi()
      .then((remoteServices) => {
        if (isMounted) setServices(remoteServices);
      })
      .catch((error) => {
        console.warn("Services API unavailable; using the local service fallback.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile menu + lock background scroll while it's open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close the desktop Services dropdown on scroll or on click outside it
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setServicesOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center z-50">
          <img src={logoImage} alt="RaahX" className="h-9 md:h-11 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
          >
            About
          </Link>

          {/* Services with click-to-toggle dropdown */}
          <div className="relative" ref={servicesRef}>
            <div className="flex items-center gap-1">
              <Link
                to="/#services"
                onClick={() => setServicesOpen(false)}
                className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Services
              </Link>
              <button
                type="button"
                onClick={() => setServicesOpen((prev) => !prev)}
                aria-label="Toggle services menu"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                <ChevronDown size={14} className={cn("transition-transform", servicesOpen && "rotate-180")} />
              </button>
            </div>

            {servicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-[70]">
                <div
                  className="w-[300px] rounded-2xl border border-gray-100 shadow-2xl p-2 max-h-[420px] overflow-y-auto"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  {services.map((service) => {
                    const Icon = getServiceIcon(service.icon);
                    return (
                      <Link
                        key={service.slug}
                        to={`/services/${service.slug}`}
                        onClick={() => setServicesOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-50/60 transition-colors"
                      >
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/8 text-primary flex items-center justify-center">
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-medium text-secondary leading-snug">
                          {service.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/#case-studies"
            className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Case Studies
          </Link>
          <Link
            to="/#process"
            className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Process
          </Link>
          <Link
            to="/blog"
            className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/#proposal"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors shadow-sm"
          >
            Get Proposal
          </Link>
        </div>

        <button
          className="md:hidden z-50 p-2 -mr-2 text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

    </header>
      {/* Mobile Nav */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#ffffff" }}
      >
        <nav className="flex flex-col gap-6 text-center pb-12">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-heading font-medium text-secondary"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-heading font-medium text-secondary"
          >
            About
          </Link>

          <div>
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/#services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-heading font-medium text-secondary"
              >
                Services
              </Link>
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                aria-label="Toggle services submenu"
                className="text-secondary"
              >
                <ChevronDown size={20} className={cn("transition-transform", mobileServicesOpen && "rotate-180")} />
              </button>
            </div>

            {mobileServicesOpen && (
              <div className="mt-4 flex flex-col gap-3">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileServicesOpen(false);
                    }}
                    className="text-base text-gray-600"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/#case-studies"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-heading font-medium text-secondary"
          >
            Case Studies
          </Link>
          <Link
            to="/#process"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-heading font-medium text-secondary"
          >
            Process
          </Link>
          <Link
            to="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-heading font-medium text-secondary"
          >
            Blog
          </Link>

          <Link
            to="/#proposal"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary rounded-full"
          >
            Get Proposal
          </Link>
        </nav>
      </div>
    </>
  );
}
