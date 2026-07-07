import { safeEqual } from './api/_utils.js';

/* Password-gates /ops (the operator CRM) with plain HTTP Basic Auth — no
   Cloudflare Access, no Zero Trust, no billing plan required. Runs in front
   of every request Pages Functions sees; only enforces the check for
   /ops and /ops/*, so the client quote builder, provider backstage links,
   and /api/* are completely untouched.

   Setup (same mechanism as every other secret in this app):
     wrangler pages secret put OPS_PASSWORD --project-name athareventplanner-crm
   Optional: OPS_USER (defaults to 'rt-ops') if you want a specific username.

   Fails CLOSED if OPS_PASSWORD isn't set yet — /ops is unreachable rather
   than silently open, so a forgotten secret can't leave it unprotected. */

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname !== '/ops' && !url.pathname.startsWith('/ops/')) {
    return next();
  }

  if (!env.OPS_PASSWORD) {
    return new Response(
      'Ops access is not configured yet. Set the OPS_PASSWORD secret: ' +
      'wrangler pages secret put OPS_PASSWORD --project-name athareventplanner-crm',
      { status: 503 }
    );
  }

  const expectedUser = env.OPS_USER || 'rt-ops';
  const expected = `Basic ${btoa(`${expectedUser}:${env.OPS_PASSWORD}`)}`;
  const provided = request.headers.get('Authorization') || '';

  if (!safeEqual(provided, expected)) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="RT Network Ops", charset="UTF-8"' },
    });
  }

  return next();
}
