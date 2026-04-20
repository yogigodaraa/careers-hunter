import { NextRequest, NextResponse } from "next/server";

import { draftEmail } from "@/lib/drafts";
import type { LLMConfig, LLMProvider } from "@/lib/llm";
import type { Company } from "@/lib/types";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

interface Body {
  company?: Company;
  roleSlug?: string;
  cv?: string;
  llm?: { provider?: LLMProvider; apiKey?: string };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.company || !body.roleSlug || !body.cv) {
    return NextResponse.json(
      { error: "Missing company, roleSlug, or cv" },
      { status: 400 },
    );
  }

  const provider = body.llm?.provider;
  const apiKey = body.llm?.apiKey?.trim();
  if (!provider || !apiKey) {
    return NextResponse.json(
      { error: "Missing LLM provider or apiKey" },
      { status: 401 },
    );
  }

  const llm: LLMConfig = { provider, apiKey };

  try {
    const draft = await draftEmail(body.company, body.roleSlug, body.cv, llm);
    return NextResponse.json(draft);
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { error: e.message || "Draft failed" },
      { status: 500 },
    );
  }
}
