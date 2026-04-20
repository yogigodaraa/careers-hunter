"use client";

import { useEffect, useMemo, useState } from "react";

import {
  loadPipeline,
  removeFromPipeline,
  savePipeline,
  STAGE_LABELS,
  STAGE_ORDER,
  updateStage,
} from "@/lib/pipeline";
import { roleBySlug } from "@/lib/roles";
import type { PipelineStage, TrackedCompany } from "@/lib/types";

const STAGE_COLOR: Record<PipelineStage, string> = {
  queued: "#6b7280",
  emailed: "#6366f1",
  replied: "#8b5cf6",
  interview: "#22c55e",
  rejected: "#ef4444",
};

export default function PipelineBoard() {
  const [items, setItems] = useState<TrackedCompany[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadPipeline());
  }, []);

  useEffect(() => {
    savePipeline(items);
  }, [items]);

  const roleOptions = useMemo(() => {
    const slugs = Array.from(new Set(items.map((t) => t.roleSlug)));
    return slugs.map((s) => ({ slug: s, title: roleBySlug(s)?.title ?? s }));
  }, [items]);

  const filtered = useMemo(
    () =>
      filterRole === "all"
        ? items
        : items.filter((t) => t.roleSlug === filterRole),
    [filterRole, items],
  );

  function changeStage(
    companyName: string,
    roleSlug: string,
    next: PipelineStage,
  ) {
    setItems((prev) => updateStage(prev, companyName, roleSlug, next));
  }

  function remove(companyName: string, roleSlug: string) {
    setItems((prev) => removeFromPipeline(prev, companyName, roleSlug));
  }

  const byStage = useMemo(() => {
    const map: Record<PipelineStage, TrackedCompany[]> = {
      queued: [],
      emailed: [],
      replied: [],
      interview: [],
      rejected: [],
    };
    for (const t of filtered) map[t.stage].push(t);
    return map;
  }, [filtered]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Pipeline</h1>
        <p className="mt-2 text-sm text-[#9ca3af]">
          Nothing tracked yet. Go to a role page, click &quot;+ Track&quot; on any company, and
          it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            {items.length} tracked · {byStage.interview.length} interview ·{" "}
            {byStage.emailed.length + byStage.replied.length} in flight
          </p>
        </div>
        {roleOptions.length > 1 && (
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
          >
            <option value="all">All roles ({items.length})</option>
            {roleOptions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.title} (
                {items.filter((t) => t.roleSlug === r.slug).length})
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="grid gap-3 md:grid-cols-5">
        {STAGE_ORDER.map((stage) => (
          <div
            key={stage}
            className="rounded-xl border"
            style={{ backgroundColor: "#0f1118", borderColor: "#1e2130" }}
          >
            <div
              className="flex items-center justify-between border-b px-3 py-2"
              style={{ borderColor: "#1e2130" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: STAGE_COLOR[stage] }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e4e4e7]">
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              <span className="text-[10px] tabular-nums text-[#6b7280]">
                {byStage[stage].length}
              </span>
            </div>
            <ul className="divide-y" style={{ borderColor: "#1e2130" }}>
              {byStage[stage].length === 0 ? (
                <li className="p-3 text-center text-[11px] text-[#4a4d5a]">—</li>
              ) : (
                byStage[stage].map((t) => (
                  <li key={`${t.roleSlug}:${t.company.name}`} className="space-y-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={t.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white hover:underline"
                      >
                        {t.company.name}
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(t.company.name, t.roleSlug)}
                        className="text-[10px] text-[#6b7280] hover:text-[#ef4444]"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[10px] text-[#6b7280]">
                      {roleBySlug(t.roleSlug)?.title ?? t.roleSlug} · {t.company.hqLocation}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {STAGE_ORDER.filter((s) => s !== stage).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => changeStage(t.company.name, t.roleSlug, s)}
                          className="rounded border px-1.5 py-0.5 text-[9px] font-medium text-[#9ca3af] hover:text-white"
                          style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
                          title={`Move to ${STAGE_LABELS[s]}`}
                        >
                          → {STAGE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
