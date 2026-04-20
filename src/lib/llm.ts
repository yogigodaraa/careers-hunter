export type LLMProvider = "anthropic" | "openai" | "google";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
}

const MODELS: Record<LLMProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
};

export async function complete(
  config: LLMConfig,
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? 4000;
  const temperature = opts.temperature ?? 0.4;
  if (config.provider === "anthropic") {
    return callAnthropic(config.apiKey, system, user, maxTokens, temperature);
  }
  if (config.provider === "openai") {
    return callOpenAI(config.apiKey, system, user, maxTokens, temperature);
  }
  return callGoogle(config.apiKey, system, user, maxTokens, temperature);
}

async function callAnthropic(
  key: string,
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELS.anthropic,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content: { text: string }[] };
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(
  key: string,
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODELS.openai,
      max_completion_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGoogle(
  key: string,
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.google}:generateContent?key=${encodeURIComponent(
    key,
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    }),
  });
  if (!res.ok) throw new Error(`Google: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fence) return fence[1].trim();
  const firstBrace = trimmed.search(/[\[{]/);
  if (firstBrace > 0) return trimmed.slice(firstBrace).trim();
  return trimmed;
}
