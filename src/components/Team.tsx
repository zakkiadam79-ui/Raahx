import { useEffect, useState } from "react";
import {
  fetchTeamFromApi,
  getStoredTeamMembers,
  isTeamApiConfigured,
  type TeamRecord,
} from "../services/teamStore";
import type { TeamMember } from "../data/teamData";

function TeamMemberImage({ member }: { member: TeamMember }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [member.image]);

  if (member.image && !imageFailed) {
    return (
      <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-teal-50 group-hover:border-primary/20 transition-colors cursor-pointer">
        <img
          src={member.image}
          alt={member.name}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-teal-50 bg-gray-100 flex items-center justify-center group-hover:border-primary/20 transition-colors cursor-pointer">
      <span className="text-4xl font-bold text-gray-300">
        {member.name.charAt(0)}
      </span>
    </div>
  );
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamRecord[]>(() => getStoredTeamMembers());

  useEffect(() => {
    let isMounted = true;
    const fallbackMembers = getStoredTeamMembers();
    setTeamMembers(fallbackMembers);

    if (!isTeamApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchTeamFromApi()
      .then((remoteMembers) => {
        // Keep the current data visible until the first successful migration
        // has populated the API, rather than flashing an empty Team section.
        if (isMounted && (remoteMembers.length > 0 || fallbackMembers.length === 0)) {
          setTeamMembers(remoteMembers);
        }
      })
      .catch((error) => {
        console.warn("Team API unavailable; using the local Team fallback.", error);
      });

    return () => {
      isMounted = false;
    };
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
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group flex flex-col items-center bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <a
                href={member.linkedin || "#"}
                target={member.linkedin ? "_blank" : "_self"}
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
              >
                <TeamMemberImage member={member} />
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
