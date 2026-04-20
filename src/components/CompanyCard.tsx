"use client";

import { useState } from "react";

import type { LLMState } from "./LLMKeyPanel";
import type { Company, DraftEmail, TrackedCompany } from "@/lib/types";

interface Props {
  company: Company;
  roleSlug: string;
  cv: string;
  llm: LLMState | null;
  tracked: TrackedCompany | null;
  onTrack: (company: Company, stage: "queued" | "emailed") => void;
  onUntrack: (company: Company) => void;
}

type DraftState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; draft: DraftEmail }
  | { kind: "error"; detail: string };

export default function CompanyCard({
  company,
  roleSlug,
  cv,
  llm,
  tracked,
  onTrack,
  onUntrack,
}: Props) {
  const [draft, setDraft] = useState<DraftState>({ kind: "idle" });
  const [copied, setCopied] = useState<"none" | "subject" | "body">("none");

  const canDraft = llm !== null && cv.trim().length >= 40;

  async function runDraft() {
    if (!canDraft || !llm) return;
    setDraft({ kind: "loading" });
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, roleSlug, cv, llm }),
      });
      const body = (await res.json()) as DraftEmail & { error?: string };
      if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
      setDraft({ kind: "ready", draft: { subject: body.subject, body: body.body } });
    } catch (err) {
      setDraft({ kind: "error", detail: (err as Error).message });
    }
  }

  function mailtoLink(d: DraftEmail) {
    const to = company.careersEmail ?? "";
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      d.subject,
    )}&body=${encodeURIComponent(d.body)}`;
  }

  async function copy(kind: "subject" | "body", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied("none"), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-white hover:underline"
            >
              {company.name}
            </a>
            {company.industry && (
              <span className="rounded-full bg-[#1a1d27] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#9ca3af]">
                {company.industry}
              </span>
            )}
            {company.size && (
              <span className="text-[11px] text-[#6b7280]">{company.size}</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{company.hqLocation}</p>
          {company.notes && (
            <p className="mt-2 text-xs leading-relaxed text-[#c4c7d0]">{company.notes}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
            {company.careersUrl && (
              <a
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#818cf8] hover:text-white"
              >
                Careers page →
              </a>
            )}
            {company.careersEmail ? (
              <span className="font-mono text-[#22c55e]">{company.careersEmail}</span>
            ) : (
              <span className="text-[#6b7280]">
                No email known — check the careers page
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {tracked ? (
            <button
              type="button"
              onClick={() => onUntrack(company)}
              className="rounded-md border px-2.5 py-1 text-[11px] text-[#9ca3af] hover:text-white"
              style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
              title={`Tracked as ${tracked.stage}`}
            >
              ✓ In pipeline
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onTrack(company, "queued")}
              className="rounded-md border px-2.5 py-1 text-[11px] text-[#9ca3af] hover:text-white"
              style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
            >
              + Track
            </button>
          )}
          <button
            type="button"
            disabled={!canDraft || draft.kind === "loading"}
            onClick={runDraft}
            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
            title={
              !llm
                ? "Paste an AI key above first"
                : cv.trim().length < 40
                  ? "Paste your CV above first"
                  : "Personalised email for this company"
            }
          >
            {draft.kind === "loading" ? "Drafting…" : "Draft email"}
          </button>
        </div>
      </div>

      {draft.kind === "error" && (
        <p className="mt-3 text-xs text-[#ef4444]">✗ {draft.detail}</p>
      )}

      {draft.kind === "ready" && (
        <div className="mt-3 space-y-2 rounded-lg border p-3" style={{ borderColor: "#1e2130" }}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Subject
              </span>
              <button
                type="button"
                onClick={() => copy("subject", draft.draft.subject)}
                className="text-[10px] text-[#818cf8] hover:text-white"
              >
                {copied === "subject" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-0.5 text-sm text-white">{draft.draft.subject}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Body
              </span>
              <button
                type="button"
                onClick={() => copy("body", draft.draft.body)}
                className="text-[10px] text-[#818cf8] hover:text-white"
              >
                {copied === "body" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-[#c4c7d0]">
              {draft.draft.body}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={mailtoLink(draft.draft)}
              onClick={() => onTrack(company, "emailed")}
              className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#22c55e,#15803d)" }}
            >
              {company.careersEmail ? "Open in mail client" : "Compose (add address)"}
            </a>
            <button
              type="button"
              onClick={() => setDraft({ kind: "idle" })}
              className="rounded-md border px-3 py-1.5 text-[11px] text-[#9ca3af] hover:text-white"
              style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
