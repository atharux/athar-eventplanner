import { json, bad } from './_utils.js';

/* RT Network concierge — natural-language → structured slots ONLY.
   The LLM never prices anything: the client app computes totals from the
   catalog and the run-of-show is generated deterministically. Free-model
   chain: tries each entry until one answers (best free model available).

   Env (all optional — endpoint 503s gracefully with none set):
     GROQ_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY
     ASSIST_MODELS — csv override, entries "provider:model-id"
   Default chain verified live 2026-07-05 (OpenRouter free IDs churn —
   update ASSIST_MODELS without a deploy when they do). */

const DEFAULT_CHAIN = [
  'groq:llama-3.3-70b-versatile',
  'groq:qwen/qwen3-32b',
  'openrouter:qwen/qwen3-next-80b-a3b-instruct:free',
  'openrouter:meta-llama/llama-3.3-70b-instruct:free',
  'openrouter:cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'mistral:mistral-small-latest',
];

const PROVIDERS = {
  groq: { url: 'https://api.groq.com/openai/v1/chat/completions', key: 'GROQ_API_KEY' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', key: 'OPENROUTER_API_KEY' },
  mistral: { url: 'https://api.mistral.ai/v1/chat/completions', key: 'MISTRAL_API_KEY' },
};

const SYSTEM_PROMPT = `You are the RT Network event concierge (Rising Tide Collective, Berlin). You help a client plan an event by collecting details conversationally — warm, brief, one question at a time, max 50 words per reply.

You collect these slots (leave unknown ones null):
event_type: "wedding"|"corporate"|"party"
event_date: "YYYY-MM-DD" or null
guests: integer
budget: integer EUR or null
venue_id: "lilium"|"fluxbau"|null
selections: { catering: "catering-street"|"catering-std"|"catering-premium"|null, dj_av: "dj-av"|"dj-live"|null, staff: "staff"|null, photo: "photo"|"photo-video"|null }
hours: integer (event duration, default 5)
staff_count: integer (crew size, default 2)

CATALOG (names only — NEVER state prices or totals; the app shows exact pricing):
Venues: Lilium Berlin (waterside Art Deco, 150 seated/300 standing), FluxBau (riverside, next door, seated/standing max 90 pending venue confirmation).
Catering: street-food buffet (casual), classic buffet (standard), seated 3-course (premium).
DJ & sound: DJ + AV package (standard), premium DJ + light rig.
Event crew (door/floor/bar-back). Photography: photographer, or photo + video team.

Rules: ask about type, guests and date first. Suggest catalog options by name and vibe, never by price. When the client mentions money, set budget/caps but say the app shows live prices. Set done=true only when event_type, guests, and at least a venue or one service are set and the client seems ready to review.

Respond with ONLY valid JSON, no markdown fences:
{"reply": "...", "slots": { ...only the slots you can fill... }, "done": false}`;

function extractJson(text) {
  const cleaned = text.replace(/```(?:json)?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (raw.length > 16 * 1024) return bad('Request too large', 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad('Invalid JSON');
  }
  const { messages, slots } = body || {};
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 24) return bad('messages must contain 1-24 entries');
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return bad('Invalid message');
  }

  const chain = (env.ASSIST_MODELS ? env.ASSIST_MODELS.split(',') : DEFAULT_CHAIN)
    .map(s => s.trim()).filter(Boolean);

  const convo = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Current known slots: ${JSON.stringify(slots || {})}` },
    ...messages.slice(-12),
  ];

  for (const entry of chain) {
    const [providerId, ...rest] = entry.split(':');
    const model = rest.join(':');
    const provider = PROVIDERS[providerId];
    if (!provider || !env[provider.key]) continue;

    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env[provider.key]}`,
        },
        body: JSON.stringify({ model, messages: convo, temperature: 0.2, max_tokens: 400 }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue; // 404 model gone / 429 rate-limited → next in chain
      const data = await res.json();
      const parsed = extractJson(data.choices?.[0]?.message?.content ?? '');
      if (!parsed || typeof parsed.reply !== 'string') continue;
      return json({
        reply: parsed.reply.slice(0, 600),
        slots: typeof parsed.slots === 'object' && parsed.slots ? parsed.slots : {},
        done: !!parsed.done,
        model: entry,
      });
    } catch {
      continue; // timeout / network → next in chain
    }
  }
  return json({ error: 'assistant unavailable' }, 503);
}
