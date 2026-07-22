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

// Stable (non-OpenRouter) chain entries. The OpenRouter portion is discovered
// live at request time (see buildChain) so it never goes stale — the hardcoded
// OpenRouter IDs below are only a fallback for when /models can't be reached.
const GROQ_CHAIN = ['groq:llama-3.3-70b-versatile', 'groq:qwen/qwen3-32b'];
const MISTRAL_CHAIN = ['mistral:mistral-small-latest'];
const OPENROUTER_FALLBACK = [
  'openrouter:meta-llama/llama-3.3-70b-instruct:free',
  'openrouter:qwen/qwen3-next-80b-a3b-instruct:free',
];

const PROVIDERS = {
  groq: { url: 'https://api.groq.com/openai/v1/chat/completions', key: 'GROQ_API_KEY' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', key: 'OPENROUTER_API_KEY' },
  mistral: { url: 'https://api.mistral.ai/v1/chat/completions', key: 'MISTRAL_API_KEY' },
};

// Live OpenRouter free-model discovery (cached ~10min in isolate memory).
const OR_SKIP = /coder|math|code-|content-safety|guard|moderation|lyria|whisper|embed|rerank/i;
const OR_DEPRIORITISE = /gemma/i;
let OR_CACHE = { ids: [], at: 0 };

async function discoverOpenRouterFreeModels(apiKey) {
  if (OR_CACHE.ids.length && Date.now() - OR_CACHE.at < 10 * 60 * 1000) return OR_CACHE.ids;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) throw new Error(`models ${res.status}`);
    const { data } = await res.json();
    const ids = (data || [])
      .filter(m => {
        const id = String(m.id || '');
        const isFree = id.endsWith(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0');
        return isFree && !OR_SKIP.test(id);
      })
      .sort((a, b) => (b.context_length ?? 0) - (a.context_length ?? 0))
      .sort((a, b) => (OR_DEPRIORITISE.test(a.id) ? 1 : 0) - (OR_DEPRIORITISE.test(b.id) ? 1 : 0))
      .map(m => m.id);
    if (ids.length) OR_CACHE = { ids, at: Date.now() };
    return ids;
  } catch {
    return OR_CACHE.ids;
  }
}

// Compose the provider chain: explicit ASSIST_MODELS override wins; otherwise
// groq → live-discovered OpenRouter free models (fallback to hardcoded) → mistral.
async function buildChain(env) {
  if (env.ASSIST_MODELS) return env.ASSIST_MODELS.split(',').map(s => s.trim()).filter(Boolean);
  const chain = [];
  if (env.GROQ_API_KEY) chain.push(...GROQ_CHAIN);
  if (env.OPENROUTER_API_KEY) {
    const live = await discoverOpenRouterFreeModels(env.OPENROUTER_API_KEY);
    const orEntries = (live.length ? live.slice(0, 4).map(id => `openrouter:${id}`) : OPENROUTER_FALLBACK);
    chain.push(...orEntries);
  }
  if (env.MISTRAL_API_KEY) chain.push(...MISTRAL_CHAIN);
  return chain;
}

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
Venues: Lilium Berlin (waterside Art Deco, 150 seated/300 standing), Fluxbau (riverside, next door).
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

  const chain = await buildChain(env);

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
        body: JSON.stringify({ model, messages: convo, temperature: 0.2, max_tokens: 800 }),
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
