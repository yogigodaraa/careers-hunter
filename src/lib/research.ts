import { complete, extractJson, type LLMConfig } from "./llm";
import { roleBySlug } from "./roles";
import type { Company, ResearchRequest } from "./types";

const SYSTEM = `You are a job-market research assistant helping a candidate target real companies.

Rules you MUST follow:
1. Only list real, verifiable companies you are confident actually exist with operations in the target location.
2. NEVER invent a careers email. If you don't know the email, set "careersEmail" to null.
3. Always provide a real website URL. If unsure of the careers page, set "careersUrl" to null (the UI will link to the main site).
4. Prefer a mix of mid-size / large employers and well-known local scale-ups for diversity.
5. "notes" must be a concrete 1-2 sentence reason this company is worth approaching for the role — what they do, why they'd hire for it.
6. Respond with ONLY a JSON array of company objects. No prose, no code fences, no commentary.

Shape (every field required, nullable fields may be null):
{
  "name": "string",
  "website": "https://...",
  "careersUrl": "https://.../careers" or null,
  "careersEmail": "string@domain" or null,
  "hqLocation": "City, Region, Country",
  "size": "50-200 employees" or null,
  "industry": "Fintech" or null,
  "notes": "string"
}`;

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function sanitise(raw: unknown): Company[] {
  if (!Array.isArray(raw)) return [];
  const out: Company[] = [];
  for (const c of raw) {
    if (!c || typeof c !== "object") continue;
    const x = c as Record<string, unknown>;
    const name = typeof x.name === "string" ? x.name.trim() : "";
    const website = typeof x.website === "string" ? x.website.trim() : "";
    if (!name || !website) continue;
    out.push({
      id: uid(),
      name,
      website,
      careersUrl: typeof x.careersUrl === "string" ? x.careersUrl.trim() : null,
      careersEmail: typeof x.careersEmail === "string" ? x.careersEmail.trim() : null,
      hqLocation: typeof x.hqLocation === "string" ? x.hqLocation : "Unknown",
      size: typeof x.size === "string" ? x.size : null,
      industry: typeof x.industry === "string" ? x.industry : null,
      notes: typeof x.notes === "string" ? x.notes : null,
    });
  }
  return out;
}

export async function researchCompanies(
  req: ResearchRequest,
  llm: LLMConfig,
): Promise<Company[]> {
  const role = roleBySlug(req.roleSlug);
  if (!role) throw new Error(`Unknown role: ${req.roleSlug}`);
  const count = Math.min(Math.max(req.count ?? 25, 5), 50);
  const location = [req.region, req.country].filter(Boolean).join(", ");
  const exclude =
    req.exclude && req.exclude.length > 0
      ? `\nAlready listed (DO NOT repeat these): ${req.exclude.slice(0, 80).join(", ")}.`
      : "";

  const userPrompt = `Role: ${role.title}
Titles to target: ${role.keywords.join(", ")}
Location: ${location}
Count: ${count} companies${exclude}

Return a JSON array with exactly ${count} company objects in the shape defined in the system prompt.`;

  const raw = await complete(llm, SYSTEM, userPrompt, { maxTokens: 6000, temperature: 0.5 });
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error("LLM response was not valid JSON");
  }
  return sanitise(parsed);
}
