import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import logoImage from "../assets/images/logo.png";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name is required"),
  businessEmail: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  website: z.string().optional(),
  industry: z.string().min(2, "Industry is required"),
  services: z.string().min(1, "Please select a service"),
  budget: z.string().min(1, "Budget is required"),
  timeline: z.string().min(1, "Timeline is required"),
  projectDetails: z.string().min(10, "Please provide some details (min 10 characters)"),
});

type FormData = z.infer<typeof formSchema>;

const processSteps = [
  {
    title: "We Learn Your Business Inside Out",
    description: "A dedicated strategist studies your brand, your competitors, and your market — so every recommendation is built on real insight, not guesswork.",
  },
  {
    title: "We Design Your Growth Roadmap",
    description: "Using AI-driven data and proven frameworks, we craft a strategy engineered specifically around your goals, audience, and budget.",
  },
  {
    title: "You Receive a Clear, Actionable Plan",
    description: "A complete proposal with transparent pricing, timelines, and next steps — ready for you to move forward with total confidence.",
  },
];

export default function ProposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { businessEmail: prefillEmail },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit proposal");
      }

      setIsSuccess(true);
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError("An error occurred while submitting your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="proposal" className="py-24 bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
            Let's Turn Your Vision Into <span className="text-secondary">Measurable Growth.</span>
          </h2>
          <p className="text-white text-lg font-medium leading-relaxed">
            Tell us about your business and get a custom, AI-powered growth strategy from RaahX — built around your goals, not a template.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Form Card */}
          <div>
            <div className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-heading font-bold text-secondary text-center mb-6">
                Request a FREE Proposal Now!
              </h3>

              {isSuccess ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-primary w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-secondary mb-2">Proposal Received!</h3>
                  <p className="text-gray-600 max-w-sm">
                    Thank you for reaching out. We've sent a confirmation email to your inbox, and our team will be in touch shortly.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</label>
                      <input
                        id="fullName"
                        {...register("fullName")}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                          errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                      {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name *</label>
                      <input
                        id="companyName"
                        {...register("companyName")}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                          errors.companyName ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                      {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="businessEmail" className="text-sm font-medium text-gray-700">Business Email *</label>
                      <input
                        id="businessEmail"
                        type="email"
                        {...register("businessEmail")}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                          errors.businessEmail ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                      {errors.businessEmail && <p className="text-xs text-red-500">{errors.businessEmail.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</label>
                      <input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                          errors.phone ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="website" className="text-sm font-medium text-gray-700">Website (Optional)</label>
                      <input
                        id="website"
                        {...register("website")}
                        placeholder="https://"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all duration-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="industry" className="text-sm font-medium text-gray-700">Industry *</label>
                      <input
                        id="industry"
                        {...register("industry")}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                          errors.industry ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                      {errors.industry && <p className="text-xs text-red-500">{errors.industry.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="services" className="text-sm font-medium text-gray-700">Services Required *</label>
                      <div className="relative">
                        <select
                          id="services"
                          {...register("services")}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white appearance-none",
                            errors.services ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                          )}
                        >
                          <option value="">Select a service</option>
                          <option value="Digital Marketing Services">Digital Marketing Services</option>
                          <option value="Social Media Marketing">Social Media Marketing</option>
                          <option value="SEO Services">SEO Services</option>
                          <option value="Website Development">Website Development</option>
                          <option value="App Development">App Development</option>
                          <option value="Branding Services">Branding Services</option>
                          <option value="Meta Advertising Services">Meta Advertising Services</option>
                          <option value="AI Automation Services">AI Automation Services</option>
                          <option value="Graphic Design Services">Graphic Design Services</option>
                          <option value="Business Strategy & Growth Consulting">Business Strategy & Growth Consulting</option>
                          <option value="Multiple Services">Multiple Services</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                      {errors.services && <p className="text-xs text-red-500">{errors.services.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="timeline" className="text-sm font-medium text-gray-700">Timeline *</label>
                      <div className="relative">
                        <select
                          id="timeline"
                          {...register("timeline")}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white appearance-none",
                            errors.timeline ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                          )}
                        >
                          <option value="">Select timeline</option>
                          <option value="Immediately">Immediately</option>
                          <option value="1-3 Months">1-3 Months</option>
                          <option value="3-6 Months">3-6 Months</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                      {errors.timeline && <p className="text-xs text-red-500">{errors.timeline.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="budget" className="text-sm font-medium text-gray-700">Estimated Budget (PKR) *</label>
                    <input
                      id="budget"
                      {...register("budget")}
                      placeholder="Example: PKR 50,000"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white",
                        errors.budget ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      )}
                    />
                    {errors.budget && <p className="text-xs text-red-500">{errors.budget.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="projectDetails" className="text-sm font-medium text-gray-700">Project Details *</label>
                    <textarea
                      id="projectDetails"
                      {...register("projectDetails")}
                      rows={4}
                      placeholder="Tell us about your goals, current challenges, and what you aim to achieve..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all duration-200 focus:bg-white resize-none",
                        errors.projectDetails ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      )}
                    />
                    {errors.projectDetails && <p className="text-xs text-red-500">{errors.projectDetails.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Get My Custom Proposal"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: What Happens Next + Testimonial */}
          <div className="pt-4 lg:pt-24 space-y-10">
            <div>
              <h3 className="text-2xl font-heading font-bold text-white mb-8">
                Here's What Happens Next
              </h3>
              <div className="space-y-7">
                {processSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                      <Check size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-white text-base mb-1.5">{step.title}</p>
                      <p className="text-sm text-white leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/15 border border-white/25 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-white text-[15px] leading-relaxed italic mb-4">
                "RaahX doesn't just design visuals—they build memorable brands. Every project is driven by creativity, strategy, and AI-powered innovation to help businesses grow with confidence."
              </p>
              <p className="text-secondary text-sm font-bold tracking-wide">— HAPPY CLIENT</p>
            </div>

            <div className="pt-4 overflow-hidden">
              <style>{`
                @keyframes logoFloat {
                  0%, 100% { transform: translateX(-6%); }
                  50% { transform: translateX(6%); }
                }
              `}</style>
              <img
                src={logoImage}
                alt=""
                aria-hidden="true"
                className="w-full h-24 md:h-28 object-contain opacity-45 brightness-0 invert"
                style={{ animation: "logoFloat 5s ease-in-out infinite" }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}