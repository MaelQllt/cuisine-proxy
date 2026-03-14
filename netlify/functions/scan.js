/* ═══════════════════════════════════════════
   cuiZine — netlify/functions/scan.js
   Proxy sécurisé vers l'API Anthropic
   La clé API reste côté serveur, jamais exposée
   ═══════════════════════════════════════════ */

export default async (req, context) => {
  // CORS — autorise ton domaine GitHub Pages
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const body = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // clé stockée dans Netlify env vars
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'API error' }), {
        status: response.status, headers
      });
    }

    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (err) {
    console.error('[cuiZine proxy]', err);
    return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 500, headers });
  }
};

export const config = { path: '/api/scan' };