import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { servicesData as staticServices, ServiceData } from "../data/servicesData";
import { getStoredServices } from "../services/serviceStore";
import { getServiceIcon } from "../utils/getServiceIcon";

const cardPattern = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const cardStyles = [
  {
    card: "bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
    iconWrap: "bg-primary/8 text-primary",
    heading: "text-secondary",
  },
  {
    card: "bg-primary border border-primary hover:shadow-xl hover:shadow-primary/20",
    iconWrap: "bg-white/15 text-white",
    heading: "text-white",
  },
  {
    card: "bg-secondary border border-secondary hover:shadow-xl hover:shadow-black/10",
    iconWrap: "bg-white/10 text-white",
    heading: "text-white",
  },
];

export default function Services() {
  const [services, setServices] = useState<ServiceData[]>(staticServices);

  useEffect(() => {
    setServices(getStoredServices());
  }, []);

  return (
    <section id="services" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
            Services
          </h2>
          <p className="text-body">
            Comprehensive digital solutions tailored to scale your brand and maximize ROI.
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
                <h3 className={`font-heading font-semibold text-sm md:text-base ${style.heading}`}>
                  {service.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}