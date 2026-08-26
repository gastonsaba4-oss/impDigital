import { getStore } from "@netlify/blobs";

// Únicas claves que esta tienda guarda: catálogo, categorías, configuración y pedidos.
const ALLOWED_KEYS = ["products", "categories", "config", "orders"];

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return new Response(JSON.stringify({ error: "clave inválida" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore({ name: "lowgarten-data", consistency: "strong" });

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
