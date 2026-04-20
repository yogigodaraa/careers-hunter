export interface Company {
  id: string;
  name: string;
  website: string;
  careersUrl?: string | null;
  careersEmail?: string | null;
  hqLocation: string;
  size?: string | null;
  industry?: string | null;
  notes?: string | null;
}

export type PipelineStage =
  | "queued"
  | "emailed"
  | "replied"
  | "interview"
  | "rejected";

export interface TrackedCompany {
  company: Company;
  roleSlug: string;
  stage: PipelineStage;
  addedAt: string;
  lastUpdated: string;
  notes?: string;
}

export interface DraftEmail {
  subject: string;
  body: string;
}

export interface ResearchRequest {
  roleSlug: string;
  country: string;
  region?: string;
  count?: number;
  exclude?: string[];
}

export interface ResearchResponse {
  companies: Company[];
}
