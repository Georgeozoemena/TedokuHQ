// POST /api/first-open  { "installId": "<uuid v4>", "appVersion": "1.0.0", "os": "android" }  ->  204
// Logic and validation are in lib/track/firstOpen.ts. See docs/expo-first-open.md.
import { handleFirstOpen } from "@/lib/track/firstOpen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleFirstOpen(request);
}
