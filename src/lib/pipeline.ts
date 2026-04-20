import type { Company, PipelineStage, TrackedCompany } from "./types";

const LS_KEY = "careers-hunter.pipeline.v1";

export function loadPipeline(): TrackedCompany[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrackedCompany[]) : [];
  } catch {
    return [];
  }
}

export function savePipeline(items: TrackedCompany[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function addToPipeline(
  items: TrackedCompany[],
  company: Company,
  roleSlug: string,
  stage: PipelineStage = "queued",
): TrackedCompany[] {
  const existing = items.find(
    (t) => t.company.name === company.name && t.roleSlug === roleSlug,
  );
  if (existing) return items;
  const now = new Date().toISOString();
  return [
    ...items,
    { company, roleSlug, stage, addedAt: now, lastUpdated: now },
  ];
}

export function updateStage(
  items: TrackedCompany[],
  companyName: string,
  roleSlug: string,
  stage: PipelineStage,
): TrackedCompany[] {
  const now = new Date().toISOString();
  return items.map((t) =>
    t.company.name === companyName && t.roleSlug === roleSlug
      ? { ...t, stage, lastUpdated: now }
      : t,
  );
}

export function removeFromPipeline(
  items: TrackedCompany[],
  companyName: string,
  roleSlug: string,
): TrackedCompany[] {
  return items.filter(
    (t) => !(t.company.name === companyName && t.roleSlug === roleSlug),
  );
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  queued: "Queued",
  emailed: "Emailed",
  replied: "Replied",
  interview: "Interview",
  rejected: "Rejected",
};

export const STAGE_ORDER: PipelineStage[] = [
  "queued",
  "emailed",
  "replied",
  "interview",
  "rejected",
];
