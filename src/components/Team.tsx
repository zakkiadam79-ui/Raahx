import { useEffect, useState } from "react";
import qasimImage from "../assets/images/Qasim.png";
import dawoodImage from "../assets/images/dawood.png";
import shabanImage from "../assets/images/MrShaban.jpeg";
import sarahImage from "../assets/images/Sarah-Khan.jpeg";
import mahazImage from "../assets/images/mahaz.jpeg";
import ashirImage from "../assets/images/ashir.jpeg";

const initialTeam = [
  {
    name: "M Qasim",
    role: "CEO & Founder",
    image: qasimImage,
    linkedin: "https://www.linkedin.com/in/muhammad-qasim-738902249",
  },
  {
    name: "Dawood Jalil",
    role: "Head of Marketing",
    image: dawoodImage,
  },
  {
    name: "M Shaban",
    role: "Full Stack Developer",
    image: shabanImage,
    linkedin: "https://www.linkedin.com/in/muhammad-shaban-0048b5344",
  },
  {
    name: "Mahaz Sattar",
    role: "Software Engineer",
    image: mahazImage,
    linkedin: "https://www.linkedin.com/in/mahaz-sattar-b4934b375",
  },
  {
    name: "Ashir Ali Shah",
    role: "SEO Specialist",
    image: ashirImage,
  },
  {
    name: "Sarah Khan",
    role: "Creative Director",
    image: sarahImage,
  },
];

export default function Team() {
  const [teamMembers, setTeamMembers] = useState(initialTeam);

  useEffect(() => {
    const saved = localStorage.getItem("raahx_team_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setTeamMembers(parsed);
      }
    }
  }, []);

  return (
    <section id="team" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-600">
            The creative minds and technical experts driving your brand forward.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <a
                href={member.linkedin || "#"}
                target={member.linkedin ? "_blank" : "_self"}
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
              >
                {member.image ? (
                  <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-teal-50 group-hover:border-primary/20 transition-colors cursor-pointer">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-teal-50 bg-gray-100 flex items-center justify-center group-hover:border-primary/20 transition-colors cursor-pointer">
                    <span className="text-4xl font-bold text-gray-300">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </a>
              <h3 className="text-lg font-heading font-semibold text-secondary mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-primary font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}