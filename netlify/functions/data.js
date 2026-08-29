import { getStore } from "@netlify/blobs";

// Claves válidas: "sites" (registro de tiendas), "platform" (acceso del
// administrador general), o "site:<id>:<parte>" para los datos de cada tienda.
const SITE_KEY_RE = /^site:[a-zA-Z0-9_-]+:(products|categories|config|orders|branding)$/;

function isValidKey(key) {
  return key === "sites" || key === "platform" || SITE_KEY_RE.test(key);
}

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key || !isValidKey(key)) {
    return new Response(JSON.stringify({ error: "clave inválida" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore({ name: "lowgarten-platform", consistency: "strong" });

  if (req.method === "GET") {
    const value = await store.get(key, { type: "json" });
    return new Response(JSON.stringify({ value: value ?? null }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "cuerpo inválido" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    await store.setJSON(key, body.value);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
