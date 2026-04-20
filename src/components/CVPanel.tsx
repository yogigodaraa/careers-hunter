"use client";

import { useEffect, useState } from "react";

const LS_CV = "careers-hunter.cv.v1";

interface Props {
  onChange?: (cv: string) => void;
}

export default function CVPanel({ onChange }: Props) {
  const [cv, setCv] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_CV);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setCv(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (cv) localStorage.setItem(LS_CV, cv);
      else localStorage.removeItem(LS_CV);
    } catch {
      /* ignore */
    }
    onChange?.(cv);
  }, [cv, onChange]);

  const hasContent = cv.trim().length > 40;
  const words = cv.trim() ? cv.trim().split(/\s+/).length : 0;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#e4e4e7]">
            Your CV
          </p>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Paste the plain text of your CV. Used only when you click &quot;Draft email&quot; —
            stored in browser, never on our server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && (
            <span className="text-[11px] tabular-nums text-[#22c55e]">
              ✓ {words} words
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md px-2 py-1 text-[11px] text-[#9ca3af] hover:bg-[#1a1d27] hover:text-white"
            style={{ border: "1px solid #1e2130" }}
          >
            {collapsed ? "Edit" : "Collapse"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <textarea
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          placeholder="Name, current role, key skills, 3-5 projects with outcome, education, links…"
          spellCheck={false}
          rows={8}
          className="w-full resize-y rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-[#4a4d5a] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
        />
      )}
    </div>
  );
}

export function loadCV(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LS_CV) || "";
  } catch {
    return "";
  }
}
