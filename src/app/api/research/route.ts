import { NextRequest, NextResponse } from "next/server";

import type { LLMConfig, LLMProvider } from "@/lib/llm";
import { researchCompanies } from "@/lib/research";
import type { ResearchRequest } from "@/lib/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface Body extends ResearchRequest {
  llm?: { provider?: LLMProvider; apiKey?: string };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.roleSlug || !body.country) {
    return NextResponse.json(
      { error: "Missing roleSlug or country" },
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
    const companies = await researchCompanies(
      {
        roleSlug: body.roleSlug,
        country: body.country,
        region: body.region,
        count: body.count,
        exclude: body.exclude,
      },
      llm,
    );
    return NextResponse.json({ companies });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { error: e.message || "Research failed" },
      { status: 500 },
    );
  }
}
