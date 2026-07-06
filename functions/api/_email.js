/* Transactional email via Resend — entirely optional. Every caller awaits
   this and ignores the result; a missing RESEND_API_KEY (or a Resend
   outage) never blocks a booking, it just means no email went out.
   Set up: wrangler pages secret put RESEND_API_KEY
           wrangler pages secret put RESEND_FROM   (e.g. "RT Network <hello@risingtide.store>")
   The From address's domain must be verified in Resend before it will send. */

export async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !to) return { sent: false };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

const WRAP = (title, body) => `
<div style="font-family:'IBM Plex Mono',monospace;max-width:520px;margin:0 auto;color:#0a0a0a">
  <p style="color:#0d9488;text-transform:uppercase;letter-spacing:2px;font-size:11px;margin-bottom:16px">Rising Tide Collective · RT Network</p>
  <h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
  ${body}
  <p style="color:#666;font-size:12px;margin-top:32px">Questions? Reply to this email or write to hello@risingtide.store</p>
</div>`;

export function clientReceiptEmail({ ref, eventType, guests, total, providerCount }) {
  return WRAP('Your request is in the tide 🌊', `
    <p>Quote reference <strong>${ref}</strong> — ${eventType}, ${guests} guests, €${total.toLocaleString()} estimated.</p>
    <p>${providerCount} provider${providerCount === 1 ? '' : 's'} in your package ${providerCount === 1 ? 'is' : 'are'} being asked to confirm. We'll email you the moment everyone's on board.</p>
    <p>Track live status anytime: <a href="{{STATUS_URL}}" style="color:#0d9488">{{STATUS_URL}}</a></p>`);
}

export function clientAllConfirmedEmail({ ref, eventType, guests }) {
  return WRAP("You're fully booked! ✅", `
    <p>Every provider for <strong>${ref}</strong> (${eventType}, ${guests} guests) has confirmed. Your event is locked in.</p>`);
}

export function providerNewGigEmail({ providerName, eventType, eventDate, guests, label, payout, backstageUrl }) {
  return WRAP('New gig request', `
    <p>Hi ${providerName},</p>
    <p>A client wants to book you: <strong>${eventType}</strong>${eventDate ? `, ${eventDate}` : ''}, ${guests} guests.</p>
    <p>${label} — you'd receive <strong>€${payout.toLocaleString()}</strong>.</p>
    <p><a href="${backstageUrl}" style="color:#0d9488;font-weight:700">Open your backstage to confirm or decline →</a></p>`);
}
