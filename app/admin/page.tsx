import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NotAuthorised } from "@/components/admin/NotAuthorised";
import { ClicksChart } from "@/components/admin/ClicksChart";
import { FilterBar } from "@/components/admin/FilterBar";
import { KpiCards } from "@/components/admin/KpiCards";
import { OpensPanel } from "@/components/admin/OpensPanel";
import { RecentTable } from "@/components/admin/RecentTable";
import { ReferrerTable } from "@/components/admin/ReferrerTable";
import { BarList, Card } from "@/components/admin/ui";
import { getAdminGate } from "@/lib/admin/guard";
import { countryName, formatNumber } from "@/lib/admin/format";
import { loadDashboard, MAX_ROWS, type DashboardData } from "@/lib/admin/queries";
import { parseRange, rangeToQuery } from "@/lib/admin/range";
import { getServiceClient } from "@/lib/supabase/server-admin";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // 1) Server-side access check. Nothing below runs for anyone who fails it.
  const gate = await getAdminGate();
  if (gate.status === "unauthenticated") redirect("/admin/login");
  if (gate.status === "expired") redirect("/admin/login?reason=expired");
  if (gate.status === "mfa_required") redirect("/admin/mfa");
  if (gate.status !== "ok") return <NotAuthorised />;

  // 2) Read the filter from the URL (validated) and load the numbers.
  const parsed = parseRange(await searchParams);
  let data: DashboardData | null = null;
  try {
    data = await loadDashboard(getServiceClient(), parsed.filter, parsed.granularity);
  } catch (err) {
    console.error("[admin] dashboard load failed", err); // details stay in the server log, not on screen
  }

  return (
    <AdminShell active="downloads" email={gate.email}>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Downloads</h1>
        <p className="mt-1 text-sm text-muted">
          {parsed.label}. {parsed.filter.includeBots ? "Bots included." : "Bots excluded."} Times are Nigeria time (WAT).
        </p>
      </header>

      <FilterBar range={parsed.key} from={parsed.customFrom} to={parsed.customTo} bots={parsed.filter.includeBots} exportQuery={rangeToQuery(parsed)} />
      {parsed.notice && <p role="status" className="mt-3 rounded-xl bg-warn-bg p-3 text-sm text-warn">{parsed.notice}</p>}

      {!data ? (
        <div className="mt-5"><Card><p className="text-sm text-ink">The numbers could not be loaded. Check the Supabase settings and try again. Details are in the server log.</p></Card></div>
      ) : (
        <div className="mt-5 space-y-4">
          {data.truncated && (
            <p role="status" className="rounded-xl bg-warn-bg p-3 text-sm text-warn">
              This view has more than {formatNumber(MAX_ROWS)} clicks, so only the newest {formatNumber(MAX_ROWS)} are counted. Pick a shorter range, or move the counting into SQL views (see the note in lib/admin/queries.ts).
            </p>
          )}
          <KpiCards kpis={data.kpis} />

          <Card title="Clicks over time" note={parsed.granularity === "hour" ? "By hour" : "By day"}>
            <ClicksChart series={data.series} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Where they come from: referrers"><ReferrerTable items={data.referrers} /></Card>
            <Card title="Referrers at a glance"><BarList items={data.referrers.slice(0, 8)} /></Card>
            <Card title="UTM source"><BarList items={data.utmSources} /></Card>
            <Card title="UTM campaign"><BarList items={data.utmCampaigns} /></Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Country (top 10)"><BarList items={data.countries} format={(l) => (l === "Unknown" ? l : countryName(l))} /></Card>
            <Card title="Device type"><BarList items={data.devices} /></Card>
            <Card title="Operating system"><BarList items={data.systems} /></Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Which button works" note="Clicks by where the button sits on the page"><BarList items={data.buttons} /></Card>
            <OpensPanel kpis={data.kpis} byVersion={data.opensByVersion} />
          </div>

          <Card title="Recent activity" note="The latest 50 clicks. No names, no IP addresses, no visitor ids.">
            <RecentTable rows={data.recent} />
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
