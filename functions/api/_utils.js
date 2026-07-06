/* Shared helpers for RT Network Pages Functions.
   Underscore-prefixed files are not routed. */

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function bad(msg, status = 400) {
  return json({ error: msg }, status);
}

/* Constant-time string compare (both must be non-empty strings). */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/* Turnstile verification — optional. Without TURNSTILE_SECRET_KEY set,
   every submission passes (the widget itself is also env-gated client
   side, so this only activates once both halves are configured). */
export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip || '' }),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}
