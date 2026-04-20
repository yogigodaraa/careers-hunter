import Link from "next/link";

import { ROLES } from "@/lib/roles";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Research the right companies.
          <br />
          <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Apply with personalised emails.
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#9ca3af] md:text-base">
          Pick a role, pick a country + state, and the model builds you a batch of real
          companies hiring for it. Paste your CV once; get a personalised outreach email per
          company that you send from your own mail client. Track every application in one place.
        </p>
      </section>

      <section className="mb-10 grid gap-4 md:grid-cols-2">
        {ROLES.map((role) => (
          <Link
            key={role.slug}
            href={`/roles/${role.slug}`}
            className="group rounded-xl border p-5 transition-colors hover:bg-[#1a1d27]"
            style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: role.accent }}
              />
              <h2 className="text-lg font-semibold text-white group-hover:text-white">
                {role.title}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">{role.tagline}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-[#6b7280]">
              Open page →
            </p>
          </Link>
        ))}
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ backgroundColor: "#12141c", borderColor: "#1e2130" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e4e4e7]">
          How it works
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-[#9ca3af]">
          <li>
            <span className="mr-2 font-mono text-[#818cf8]">1.</span>
            Paste your Claude / OpenAI / Gemini key on any role page. It stays in your browser.
          </li>
          <li>
            <span className="mr-2 font-mono text-[#818cf8]">2.</span>
            Paste your CV once. We use it only when you click &quot;Draft email&quot;.
          </li>
          <li>
            <span className="mr-2 font-mono text-[#818cf8]">3.</span>
            Pick country + state, hit Research. Get a batch of real companies with websites and
            careers links. Click &quot;+ More&quot; for another batch, de-duped.
          </li>
          <li>
            <span className="mr-2 font-mono text-[#818cf8]">4.</span>
            For each company, click &quot;Draft email&quot; to generate a personalised outreach
            grounded in your CV. Review, then open in your mail client to send.
          </li>
          <li>
            <span className="mr-2 font-mono text-[#818cf8]">5.</span>
            Track progress on the Pipeline page — kanban from queued to interview, saved in
            your browser.
          </li>
        </ol>
      </section>
    </div>
  );
}
