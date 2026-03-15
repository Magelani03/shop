/**
 * Simple GET /api/health. If this returns 200 on Vercel, the api/ folder is deployed.
 * The catch-all api/[[...path]].ts handles all other /api/* routes (e.g. /api/auth/register).
 */
export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok",
    from: "api/health.ts",
    timestamp: new Date().toISOString(),
  });
}
