import { complete, extractJson, type LLMConfig } from "./llm";
import { roleBySlug } from "./roles";
import type { Company, DraftEmail } from "./types";

const SYSTEM = `You are drafting a concise, highly personalised cold outreach email for a job candidate applying to a specific company.

Rules:
- Warm but professional tone. No buzzwords, no clichés, no "I am writing to express my interest".
- 140-180 words in the body.
- Reference ONE specific, concrete thing about the company or role to prove research (from "notes" or "industry" — don't invent facts).
- Ask for a short conversation or point them to the candidate's CV/portfolio if provided.
- Do not use em-dashes or emojis.
- Sign off with the candidate's name only (no contact block — the email client adds that).
- Subject line: under 70 characters, specific, no emojis.

Respond with ONLY a JSON object of shape {"subject": string, "body": string}. No prose, no code fences.`;

export async function draftEmail(
  company: Company,
  roleSlug: string,
  cv: string,
  llm: LLMConfig,
): Promise<DraftEmail> {
  const role = roleBySlug(roleSlug);
  const roleTitle = role?.title ?? roleSlug;
  const userPrompt = `Candidate CV / profile:
${cv.trim().slice(0, 6000)}

Target company:
- Name: ${company.name}
- Website: ${company.website}
- HQ: ${company.hqLocation}
- Industry: ${company.industry ?? "Unknown"}
- Size: ${company.size ?? "Unknown"}
- Notes: ${company.notes ?? "None"}

Role candidate is targeting: ${roleTitle}

Write the email now.`;

  const raw = await complete(llm, SYSTEM, userPrompt, { maxTokens: 800, temperature: 0.6 });
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error("LLM response was not valid JSON");
  }
  const obj = parsed as Record<string, unknown>;
  const subject = typeof obj.subject === "string" ? obj.subject.trim() : "";
  const body = typeof obj.body === "string" ? obj.body.trim() : "";
  if (!subject || !body) throw new Error("LLM response missing subject or body");
  return { subject, body };
}
