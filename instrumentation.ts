import type { Instrumentation } from 'next';

/**
 * Server errors, reported once each: a single structured log line (searchable in Vercel → Logs),
 * plus a short alert to ERROR_WEBHOOK_URL when it's set (a Slack or Discord incoming webhook).
 * Only the route, path and error go out, never request headers or cookies.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const message = err instanceof Error ? err.message : String(err);
  const digest = typeof err === 'object' && err && 'digest' in err ? String((err as { digest: unknown }).digest) : undefined;
  const report = { level: 'error', message, digest, method: request.method, path: request.path.split('?')[0], route: context.routePath, kind: context.routeType };
  console.error(JSON.stringify(report));

  const hook = process.env.ERROR_WEBHOOK_URL;
  if (!hook) return;
  try {
    const text = `Site error on ${report.method} ${report.path} (${report.route}): ${message.slice(0, 300)}${digest ? ` [${digest}]` : ''}`;
    await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, content: text }), signal: AbortSignal.timeout(3000) });
  } catch {
    // reporting must never cause a second failure
  }
};
