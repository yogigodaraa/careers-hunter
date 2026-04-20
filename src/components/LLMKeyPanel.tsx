"use client";

import { useEffect, useState } from "react";

import type { LLMProvider } from "@/lib/llm";

const LS_PROVIDER = "careers-hunter.llmProvider";
const LS_KEY = "careers-hunter.llmKey";

const INFO: Record<LLMProvider, { label: string; link: string; hint: string }> = {
  anthropic: {
    label: "Claude",
    link: "https://console.anthropic.com/settings/keys",
    hint: "sk-ant-…",
  },
  openai: {
    label: "OpenAI",
    link: "https://platform.openai.com/api-keys",
    hint: "sk-…",
  },
  google: {
    label: "Gemini (free tier)",
    link: "https://aistudio.google.com/app/apikey",
    hint: "AIza…",
  },
};

export interface LLMState {
  provider: LLMProvider;
  apiKey: string;
}

interface Props {
  onChange: (state: LLMState | null) => void;
}

export default function LLMKeyPanel({ onChange }: Props) {
  const [provider, setProvider] = useState<LLMProvider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(LS_PROVIDER);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (p === "anthropic" || p === "openai" || p === "google") setProvider(p);
      const k = localStorage.getItem(LS_KEY);
      if (k) setApiKey(k);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PROVIDER, provider);
    } catch {
      /* ignore */
    }
  }, [provider]);

  useEffect(() => {
    try {
      if (apiKey) localStorage.setItem(LS_KEY, apiKey);
      else localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    onChange(apiKey.trim().length > 0 ? { provider, apiKey: apiKey.trim() } : null);
  }, [apiKey, provider, onChange]);

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#e4e4e7]">
            AI key
          </p>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Paste your Claude / OpenAI / Gemini key. Stored in browser only, sent direct to the
            provider.
          </p>
        </div>
        <a
          href={INFO[provider].link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#818cf8] hover:text-white"
        >
          Get a key →
        </a>
      </div>

      <div className="mb-2 flex gap-1">
        {(["anthropic", "openai", "google"] as LLMProvider[]).map((p) => {
          const active = provider === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className="flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: active ? "#1a1d27" : "transparent",
                border: `1px solid ${active ? "#2d3150" : "#1e2130"}`,
                color: active ? "#e4e4e7" : "#6b7280",
              }}
            >
              {INFO[p].label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type={show ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={INFO[provider].hint}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-[#4a4d5a] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded-lg px-3 text-[11px] font-medium text-[#9ca3af] hover:text-white"
          style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2130" }}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
