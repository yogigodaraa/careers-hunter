import Link from "next/link";

import { ROLES } from "@/lib/roles";

export default function Nav() {
  return (
    <header
      className="border-b"
      style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2130" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block h-6 w-6 rounded-md"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            Careers Hunter
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-xs">
          {ROLES.map((role) => (
            <Link
              key={role.slug}
              href={`/roles/${role.slug}`}
              className="rounded-md border px-3 py-1.5 font-medium text-[#9ca3af] hover:bg-[#1a1d27] hover:text-white"
              style={{ borderColor: "#1e2130", backgroundColor: "#12141c" }}
            >
              {role.title}
            </Link>
          ))}
          <Link
            href="/pipeline"
            className="rounded-md px-3 py-1.5 font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
          >
            Pipeline
          </Link>
        </nav>
      </div>
    </header>
  );
}
