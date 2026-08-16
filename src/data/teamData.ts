import qasimImage from "../assets/images/Qasim.png";
import dawoodImage from "../assets/images/dawood.png";
import shabanImage from "../assets/images/MrShaban.jpeg";
import sarahImage from "../assets/images/Sarah-Khan.jpeg";
import mahazImage from "../assets/images/mahaz.jpeg";
import ashirImage from "../assets/images/ashir.jpeg";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  [key: string]: unknown;
}

// These are the existing public team members. Their order and content are
// intentionally kept unchanged so the public section remains familiar.
export const defaultTeamMembers: TeamMember[] = [
  {
    id: "m-qasim",
    name: "M Qasim",
    role: "CEO & Founder",
    image: qasimImage,
    linkedin: "https://www.linkedin.com/in/muhammad-qasim-738902249",
  },
  {
    id: "dawood-jalil",
    name: "Dawood Jalil",
    role: "Head of Marketing",
    image: dawoodImage,
  },
  {
    id: "m-shaban",
    name: "M Shaban",
    role: "Full Stack Developer",
    image: shabanImage,
    linkedin: "https://www.linkedin.com/in/muhammad-shaban-0048b5344",
  },
  {
    id: "mahaz-sattar",
    name: "Mahaz Sattar",
    role: "Software Engineer",
    image: mahazImage,
    linkedin: "https://www.linkedin.com/in/mahaz-sattar-b4934b375",
  },
  {
    id: "ashir-ali-shah",
    name: "Ashir Ali Shah",
    role: "SEO Specialist",
    image: ashirImage,
  },
  {
    id: "sarah-khan",
    name: "Sarah Khan",
    role: "Creative Director",
    image: sarahImage,
  },
];
