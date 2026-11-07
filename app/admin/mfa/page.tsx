import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { MfaPanel } from "@/components/admin/MfaPanel";
import { NotAuthorised } from "@/components/admin/NotAuthorised";
import { getAdminGate } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  // This page is where two-step sign-in is finished, so it must not demand it.
  const gate = await getAdminGate({ requireAal2: false });
  if (gate.status === "unauthenticated" || gate.status === "expired") redirect("/admin/login");
  if (gate.status === "forbidden") return <NotAuthorised />;
  return (
    <AdminShell active="security">
      <h1 className="text-2xl font-extrabold text-ink">Security</h1>
      <p className="mt-1 text-sm text-muted">Two-step sign-in protects this area even if someone gets hold of your email.</p>
      <div className="mt-5 max-w-md rounded-adm bg-white p-5 shadow-adm">
        <MfaPanel />
      </div>
    </AdminShell>
  );
}
