export interface RoleConfig {
  slug: string;
  title: string;
  tagline: string;
  keywords: string[];
  accent: string;
}

export const ROLES: RoleConfig[] = [
  {
    slug: "ai-developer",
    title: "AI Developer",
    tagline:
      "AI / ML engineer, applied scientist, LLM engineer — companies building AI products or hiring for applied ML.",
    keywords: [
      "AI engineer",
      "ML engineer",
      "applied scientist",
      "LLM engineer",
      "data scientist",
      "MLOps engineer",
    ],
    accent: "#8b5cf6",
  },
  {
    slug: "software-engineer",
    title: "Software Engineer",
    tagline:
      "Full-stack, backend, frontend or platform roles at product companies, scale-ups, and startups.",
    keywords: [
      "software engineer",
      "full-stack engineer",
      "backend engineer",
      "frontend engineer",
      "platform engineer",
    ],
    accent: "#3b82f6",
  },
  {
    slug: "cybersecurity",
    title: "Cyber Security",
    tagline:
      "SOC analyst, detection engineer, appsec, pentest, security engineering — defenders and offensive specialists.",
    keywords: [
      "security engineer",
      "SOC analyst",
      "detection engineer",
      "application security engineer",
      "penetration tester",
      "threat hunter",
    ],
    accent: "#22c55e",
  },
  {
    slug: "network-engineer",
    title: "Network Engineer",
    tagline:
      "Graduate / entry-level network roles — NOC, network operations, cloud networking, infrastructure.",
    keywords: [
      "graduate network engineer",
      "junior network engineer",
      "NOC engineer",
      "network operations",
      "cloud network engineer",
    ],
    accent: "#f97316",
  },
];

export function roleBySlug(slug: string): RoleConfig | undefined {
  return ROLES.find((r) => r.slug === slug);
}
