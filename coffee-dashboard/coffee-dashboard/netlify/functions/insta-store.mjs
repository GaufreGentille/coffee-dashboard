// insta-store.mjs — reçoit le feed Instagram depuis GitHub Actions
// et le stocke dans Netlify Blobs. Protégé par le header x-veille-secret.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST uniquement" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secret = req.headers.get("x-veille-secret");
  if (!secret || secret !== process.env.VEILLE_SECRET) {
    return new Response(JSON.stringify({ error: "non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    if (!payload?.accounts || !payload?.fetchedAt) {
      return new Response(JSON.stringify({ error: "payload invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore({ name: "insta-veille", consistency: "strong" });
    await store.setJSON("feed", payload);

    return new Response(
      JSON.stringify({ ok: true, accounts: payload.accounts.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
