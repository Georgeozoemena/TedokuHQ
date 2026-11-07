import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminGate } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const gate = await getAdminGate();
  if (gate.status === "ok" || gate.status === "mfa_required") redirect("/admin");

  const reason = Array.isArray(sp.reason) ? sp.reason[0] : sp.reason;
  const failed = (Array.isArray(sp.error) ? sp.error[0] : sp.error) === "1";
  const initial = failed
    ? "That sign-in link did not work or has expired. Request a new one."
    : reason === "expired" || gate.status === "expired"
      ? "Your session ended. Please sign in again."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-adm bg-white p-6 shadow-adm">
        <p className="text-sm font-extrabold tracking-[0.18em] text-purple">TEDOKU</p>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">Sign in</h1>
        <p className="mb-5 mt-1 text-sm text-muted">Use the email address your team gave access to.</p>
        <LoginForm initialMessage={initial} />
      </div>
    </main>
  );
}
