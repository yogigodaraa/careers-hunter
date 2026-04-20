"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import CompanyCard from "./CompanyCard";
import CVPanel, { loadCV } from "./CVPanel";
import FilterBar, { type FilterState } from "./FilterBar";
import LLMKeyPanel, { type LLMState } from "./LLMKeyPanel";

import {
  addToPipeline,
  loadPipeline,
  removeFromPipeline,
  savePipeline,
} from "@/lib/pipeline";
import type { RoleConfig } from "@/lib/roles";
import type { Company, PipelineStage, ResearchResponse, TrackedCompany } from "@/lib/types";

interface Props {
  role: RoleConfig;
}

export default function RoleWorkspace({ role }: Props) {
  const [llm, setLlm] = useState<LLMState | null>(null);
  const [cv, setCv] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilter, setLastFilter] = useState<FilterState | null>(null);
  const [pipeline, setPipeline] = useState<TrackedCompany[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCv(loadCV());
    setPipeline(loadPipeline());
  }, []);

  useEffect(() => {
    savePipeline(pipeline);
  }, [pipeline]);

  const canRun = llm !== null;

  const fetchBatch = useCallback(
    async (filter: FilterState, exclude: string[]) => {
      if (!llm) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleSlug: role.slug,
            country: filter.country,
            region: filter.region,
            count: filter.count,
            exclude,
            llm,
          }),
        });
        const body = (await res.json()) as ResearchResponse & { error?: string };
        if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
        setCompanies((prev) => {
          const seen = new Set(prev.map((c) => c.name.toLowerCase()));
          const added = body.companies.filter((c) => !seen.has(c.name.toLowerCase()));
          return [...prev, ...added];
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [llm, role.slug],
  );

  const runResearch = useCallback(
    (filter: FilterState) => {
      setLastFilter(filter);
      setCompanies([]);
      void fetchBatch(filter, []);
    },
    [fetchBatch],
  );

  const loadMore = useCallback(() => {
    if (!lastFilter) return;
    const exclude = companies.map((c) => c.name);
    void fetchBatch(lastFilter, exclude);
  }, [companies, fetchBatch, lastFilter]);

  const roleTracked = useMemo(
    () => pipeline.filter((t) => t.roleSlug === role.slug),
    [pipeline, role.slug],
  );

  const trackByName = useCallback(
    (name: string) => roleTracked.find((t) => t.company.name === name) ?? null,
    [roleTracked],
  );

  const track = useCallback(
    (company: Company, stage: PipelineStage) => {
      setPipeline((prev) => {
        const existing = prev.find(
          (t) => t.company.name === company.name && t.roleSlug === role.slug,
        );
        if (existing) {
          const now = new Date().toISOString();
          return prev.map((t) =>
            t === existing ? { ...t, stage, lastUpdated: now } : t,
          );
        }
        return addToPipeline(prev, company, role.slug, stage);
      });
    },
    [role.slug],
  );

  const untrack = useCallback(
    (company: Company) => {
      setPipeline((prev) => removeFromPipeline(prev, company.name, role.slug));
    },
    [role.slug],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
      <header>
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: role.accent }}
          />
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            {role.title}
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#9ca3af]">{role.tagline}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <LLMKeyPanel onChange={setLlm} />
        <CVPanel onChange={setCv} />
      </div>

      <FilterBar
        storageKey={`careers-hunter.filter.${role.slug}`}
        defaults={{ country: "Australia", region: "Western Australia", count: 25 }}
        onRun={runResearch}
        loading={loading}
        canRun={canRun}
        onLoadMore={loadMore}
        loadMoreEnabled={companies.length > 0}
      />

      {error && (
        <div
          className="rounded-xl border p-4 text-sm text-[#ef4444]"
          style={{ backgroundColor: "#2b0b0b", borderColor: "#4c1d1d" }}
        >
          ✗ {error}
        </div>
      )}

      {!llm && (
        <div
          className="rounded-xl border p-4 text-sm text-[#9ca3af]"
          style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
        >
          Paste an AI key above to start researching companies. We call the provider directly;
          nothing is stored on our side.
        </div>
      )}

      {loading && companies.length === 0 && (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
        >
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
          <p className="text-sm text-[#9ca3af]">
            Asking the model for companies hiring {role.title.toLowerCase()}s in{" "}
            {lastFilter?.region || lastFilter?.country}…
          </p>
        </div>
      )}

      {companies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9ca3af]">
              {companies.length} compan{companies.length === 1 ? "y" : "ies"} ·{" "}
              {roleTracked.length} tracked
            </p>
            <button
              type="button"
              onClick={() => setCompanies([])}
              className="text-[11px] text-[#6b7280] hover:text-white"
            >
              Clear results
            </button>
          </div>
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              roleSlug={role.slug}
              cv={cv}
              llm={llm}
              tracked={trackByName(company.name)}
              onTrack={track}
              onUntrack={untrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}
