import { NextResponse, type NextRequest } from "next/server";
import { captureError, logInfo } from "@/lib/observability";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const expected = process.env.SENTRY_TEST_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const error = new Error("Sentry monitoring smoke test");
  captureError(error, {
    operation: "monitoring.sentry_test"
  });
  logInfo("monitoring.sentry_test.triggered");

  return NextResponse.json({
    dsnConfigured: Boolean(process.env.SENTRY_DSN),
    ok: true
  });
}
