// GET /download?from=hero  ->  logs one click (best effort), then 302 to APK_URL.
// All the logic lives in lib/track/log.ts. The redirect target is ONLY the APK_URL env variable.
import { handleDownload, handleDownloadHead } from "@/lib/track/log";

export const runtime = "nodejs";        // we use node:crypto for the IP hash
export const dynamic = "force-dynamic"; // never cache: every click must be counted

export async function GET(request: Request) {
  return handleDownload(request);
}

export async function HEAD() {
  return handleDownloadHead();
}
