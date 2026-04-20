import { notFound } from "next/navigation";

import RoleWorkspace from "@/components/RoleWorkspace";
import { ROLES, roleBySlug } from "@/lib/roles";

export function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }));
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = roleBySlug(slug);
  if (!role) notFound();
  return <RoleWorkspace role={role} />;
}
