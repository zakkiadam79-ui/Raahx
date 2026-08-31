import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  servicesData as staticServices,
  ServiceData,
} from "../data/servicesData";
import {
  fetchServicesFromApi,
  getStoredServices,
  isServiceApiConfigured,
  type ServiceRecord,
} from "../services/serviceStore";
import { getServiceIcon } from "../utils/getServiceIcon";

const cardPattern = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const cardStyles = [
  {
    card: "bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
    iconWrap: "bg-primary/8 text-primary",
    heading: "text-secondary",
    body: "text-body",
  },
  {
    card: "bg-primary border border-primary hover:shadow-xl hover:shadow-primary/20",
    iconWrap: "bg-white/15 text-white",
    heading: "text-white",
    body: "text-white/80",
  },
  {
    card: "bg-secondary border border-secondary hover:shadow-xl hover:shadow-black/10",
    iconWrap: "bg-white/10 text-white",
    heading: "text-white",
    body: "text-white/75",
  },
];

export default function Services() {
  const [services, setServices] = useState<ServiceRecord[]>(staticServices);

  useEffect(() => {
    let isMounted = true;

    // Load locally stored services first.
    // If storage is empty, keep the original static services.
    const storedServices = getStoredServices();

    if (storedServices.length > 0) {
      setServices(storedServices);
    } else {
      setServices(staticServices);
    }

    if (!isServiceApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    // Load services from the production API.
    fetchServicesFromApi()
      .then((remoteServices) => {
        if (!isMounted) return;

        // IMPORTANT:
        // Never replace working services with an empty API response.
        if (remoteServices.length > 0) {
          setServices(remoteServices);
        } else {
          setServices(staticServices);
        }
      })
      .catch((error) => {
        // If the API fails, keep the already-loaded local/static services.
        console.warn(
          "Services API unavailable; using the local service fallback.",
          error,
        );

        if (isMounted) {
          setServices(staticServices);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="services" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">What We Do</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
            Digital Marketing Services Built for Growth
          </h2>

          <p className="text-body leading-relaxed">
            From strategy and search visibility to paid campaigns, social media, websites, and AI automation, RAAHX provides integrated digital marketing services designed to help businesses attract customers, increase conversions, and scale with confidence.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, idx) => {
            const Icon = getServiceIcon(service.icon);
            const style = cardStyles[cardPattern[idx % cardPattern.length]];

            return (
              <Link
                to={`/services/${service.slug}`}
                key={service.slug}
                className={`group p-6 md:p-8 rounded-2xl transition-all duration-300 flex flex-col items-center text-center gap-4 cursor-pointer ${style.card}`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${style.iconWrap}`}
                >
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                <h3
                  className={`font-heading font-semibold text-sm md:text-base ${style.heading}`}
                >
                  {service.name}
                </h3>

                {service.cardDescription && (
                  <p className={`text-xs leading-5 ${style.body}`}>{service.cardDescription}</p>
                )}

                {service.cardCtaLabel && (
                  <span className={`mt-auto inline-flex items-center gap-1 text-xs font-bold ${style.heading}`}>
                    {service.cardCtaLabel} <ArrowRight size={13} />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}