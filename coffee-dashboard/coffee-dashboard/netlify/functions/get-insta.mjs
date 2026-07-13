// get-insta.mjs — sert le feed Instagram stocké dans Netlify Blobs au dashboard.
import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore({ name: "insta-veille", consistency: "strong" });
    const feed = await store.get("feed", { type: "json" });

    if (!feed) {
      return new Response(
        JSON.stringify({ fetchedAt: null, stats: null, accounts: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(feed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // cache CDN 30 min — le feed ne change qu'une fois par jour
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
