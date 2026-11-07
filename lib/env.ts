// Read environment variables lazily so `next build` works without secrets.
export const env = {
  get apkUrl() { return process.env.APK_URL ?? ""; },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; },
  get ipHashSalt() { return process.env.IP_HASH_SALT ?? ""; },
  get cronSecret() { return process.env.CRON_SECRET ?? ""; },
  get supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""; },
  get supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""; },
  get supabaseServiceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""; },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  },
};
export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && env.adminEmails.includes(email.toLowerCase());
}
