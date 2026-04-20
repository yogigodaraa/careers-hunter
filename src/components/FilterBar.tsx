"use client";

import { useEffect, useState } from "react";

export interface FilterState {
  country: string;
  region: string;
  count: number;
}

interface Props {
  storageKey: string;
  defaults?: Partial<FilterState>;
  onRun: (state: FilterState) => void;
  loading?: boolean;
  canRun: boolean;
  onLoadMore?: () => void;
  loadMoreEnabled?: boolean;
}

const DEFAULTS: FilterState = {
  country: "Australia",
  region: "Western Australia",
  count: 25,
};

export default function FilterBar({
  storageKey,
  defaults,
  onRun,
  loading,
  canRun,
  onLoadMore,
  loadMoreEnabled,
}: Props) {
  const [state, setState] = useState<FilterState>({ ...DEFAULTS, ...defaults });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FilterState>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, storageKey]);

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <label className="block text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wider text-[#9ca3af]">
            Country
          </span>
          <input
            type="text"
            value={state.country}
            onChange={(e) => setState((s) => ({ ...s, country: e.target.value }))}
            placeholder="Australia"
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#4a4d5a] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
          />
        </label>

        <label className="block text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wider text-[#9ca3af]">
            State / Region
          </span>
          <input
            type="text"
            value={state.region}
            onChange={(e) => setState((s) => ({ ...s, region: e.target.value }))}
            placeholder="Western Australia"
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#4a4d5a] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
          />
        </label>

        <label className="block text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wider text-[#9ca3af]">
            How many
          </span>
          <select
            value={state.count}
            onChange={(e) => setState((s) => ({ ...s, count: Number(e.target.value) }))}
            className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
          >
            <option value={10}>10 per batch</option>
            <option value={25}>25 per batch</option>
            <option value={40}>40 per batch</option>
            <option value={50}>50 per batch</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            disabled={!canRun || loading}
            onClick={() => onRun(state)}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {loading ? "Researching…" : "Research companies"}
          </button>
          {onLoadMore && (
            <button
              type="button"
              disabled={!loadMoreEnabled || loading}
              onClick={onLoadMore}
              className="rounded-lg border px-3 py-2 text-xs font-medium text-[#9ca3af] hover:text-white disabled:opacity-40"
              style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
              title="Fetch another batch, excluding the ones you already have"
            >
              + More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
