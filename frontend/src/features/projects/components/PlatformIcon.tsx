import React from "react";
import { Link as LinkIcon } from "lucide-react";
import {
  FaGithub,
  FaGitlab,
  FaBitbucket,
  FaFigma,
  FaLinkedin,
  FaYoutube,
  FaDribbble,
  FaBehance,
} from "react-icons/fa";
import { SiCanva, SiNetlify, SiVercel } from "react-icons/si";

export const PREDEFINED_PLATFORMS = [
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Figma",
  "Canva",
  "Vercel",
  "Netlify",
  "LinkedIn",
  "YouTube",
  "Dribbble",
  "Behance",
  "Otros",
];

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "" }) => {
  const normalized = platform.toLowerCase().trim();

  switch (normalized) {
    case "github":
      return <FaGithub className={className} />;
    case "gitlab":
      return <FaGitlab className={className} />;
    case "bitbucket":
      return <FaBitbucket className={className} />;
    case "figma":
      return <FaFigma className={className} />;
    case "canva":
      return <SiCanva className={className} />;
    case "vercel":
      return <SiVercel className={className} />;
    case "netlify":
      return <SiNetlify className={className} />;
    case "linkedin":
      return <FaLinkedin className={className} />;
    case "youtube":
      return <FaYoutube className={className} />;
    case "dribbble":
      return <FaDribbble className={className} />;
    case "behance":
      return <FaBehance className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
};
