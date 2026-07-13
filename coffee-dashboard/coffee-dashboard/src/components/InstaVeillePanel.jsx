import { useState, useEffect, useMemo } from "react";

// ─── Kissa Soko — Panneau Veille Instagram ────────────────────────────────────
// Données servies par /.netlify/functions/get-insta (Netlify Blobs),
// alimentées quotidiennement par GitHub Actions via Business Discovery.

const FEED_URL = "/.netlify/functions/get-insta";
const CACHE_KEY = "insta-veille-cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 min
const NEW_THRESHOLD = 48 * 3600 * 1000; // badge "nouveau" si post < 48h
const PAGE_SIZE = 48;

const CATEGORY_COLORS = {
  Torrefacteur: "#ea9524",
  Materiel: "#60a5fa",
  Cafe: "#4ade80",
  Producteur: "#86efac",
  Barista: "#e879f9",
  Media: "#a78bfa",
  Importateur: "#fb923c",
  Communaute: "#facc15",
  The: "#34d399",
  Evenement: "#f472b6",
};
const catColor = (c) => CATEGORY_COLORS[c] || "#888";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fmtFollowers(n) {
  if (n == null) return "";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export default function InstaVeillePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { at, payload } = JSON.parse(cached);
        if (Date.now() - at < CACHE_TTL) { setData(payload); return; }
      } catch { /* cache corrompu → refetch */ }
    }
    fetch(FEED_URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((payload) => {
        setData(payload);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
        } catch { /* quota sessionStorage dépassé → tant pis pour le cache */ }
      })
      .catch((e) => setError(String(e)));
  }, []);

  // Feed aplati : un item par post, trié du plus récent au plus ancien
  const feed = useMemo(() => {
    if (!data?.accounts) return [];
    const items = [];
    for (const a of data.accounts) {
      if (!a.posts) continue;
      for (const p of a.posts) {
        if (!p.timestamp) continue;
        items.push({ ...p, account: a });
      }
    }
    items.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));
    return items;
  }, [data]);

  const categories = useMemo(() => {
    const counts = {};
    for (const it of feed) {
      const c = it.account.category;
      counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [feed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return feed.filter((it) => {
      if (category !== "Tous" && it.account.category !== category) return false;
      if (q && !it.account.handle.toLowerCase().includes(q) &&
          !(it.account.name || "").toLowerCase().includes(q) &&
          !(it.caption || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [feed, category, search]);

  const newCount = useMemo(
    () => feed.filter((it) => Date.now() - new Date(it.timestamp) < NEW_THRESHOLD).length,
    [feed]
  );

  if (error) {
    return <div style={{ padding: 20, color: "#f87171", fontSize: 12 }}>
      Erreur de chargement de la veille Instagram : {error}
    </div>;
  }
  if (!data) {
    return <div style={{ padding: 20, color: "#888", fontSize: 12 }}>Chargement de la veille…</div>;
  }
  if (!feed.length) {
    return <div style={{ padding: 20, color: "#888", fontSize: 12 }}>
      Aucune donnée pour l'instant — le premier passage de la veille n'a pas encore eu lieu.
    </div>;
  }

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f0f0f0" }}>Veille Instagram</span>
        <span style={{ fontSize: 10, color: "#888" }}>
          {data.stats?.ok ?? "?"} comptes suivis · {feed.length} posts
        </span>
        {newCount > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#1a1a1a",
            background: "#fed238", borderRadius: 8, padding: "1px 7px",
          }}>
            {newCount} nouveau{newCount > 1 ? "x" : ""}
          </span>
        )}
        {data.fetchedAt && (
          <span style={{ fontSize: 9, color: "#555", marginLeft: "auto" }}>
            màj {timeAgo(data.fetchedAt)}
          </span>
        )}
      </div>

      {/* ─── Filtres ─── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLimit(PAGE_SIZE); }}
          placeholder="Rechercher…"
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#eee", fontSize: 11, padding: "4px 10px", outline: "none", width: 150,
          }}
        />
        {[["Tous", feed.length], ...categories.slice(0, 8)].map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setLimit(PAGE_SIZE); }}
            style={{
              cursor: "pointer", fontSize: 10, borderRadius: 8, padding: "3px 9px",
              border: `1px solid ${category === cat ? catColor(cat) : "rgba(255,255,255,0.1)"}`,
              background: category === cat ? `${catColor(cat)}22` : "rgba(255,255,255,0.03)",
              color: category === cat ? catColor(cat) : "#aaa",
            }}
          >
            {cat} <span style={{ opacity: 0.6 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ─── Grille de posts ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        gap: 12,
      }}>
        {filtered.slice(0, limit).map((it) => {
          const isNew = Date.now() - new Date(it.timestamp) < NEW_THRESHOLD;
          return (
            <a
              key={it.id}
              href={it.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block", textDecoration: "none",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${isNew ? "rgba(254,210,56,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12, overflow: "hidden",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", aspectRatio: "1/1", background: "#111" }}>
                {it.image && (
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                {it.type === "VIDEO" && (
                  <span style={{
                    position: "absolute", top: 8, right: 8, fontSize: 11,
                    background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "1px 6px", color: "#fff",
                  }}>▶</span>
                )}
                {it.type === "CAROUSEL_ALBUM" && (
                  <span style={{
                    position: "absolute", top: 8, right: 8, fontSize: 11,
                    background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "1px 6px", color: "#fff",
                  }}>⧉</span>
                )}
                {isNew && (
                  <span style={{
                    position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700,
                    background: "#fed238", color: "#1a1a1a", borderRadius: 6, padding: "1px 7px",
                  }}>NOUVEAU</span>
                )}
              </div>

              {/* Infos compte */}
              <div style={{ padding: "8px 10px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {it.account.profilePic && (
                    <img
                      src={it.account.profilePic}
                      alt=""
                      loading="lazy"
                      style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#f0f0f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {it.account.name || it.account.handle}
                  </span>
                  <span style={{ fontSize: 9, color: catColor(it.account.category), marginLeft: "auto", flexShrink: 0 }}>
                    {it.account.category}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                  @{it.account.handle}
                  {it.account.followers != null && ` · ${fmtFollowers(it.account.followers)} abonnés`}
                </div>
                {it.caption && (
                  <div style={{
                    fontSize: 10, color: "#aaa", marginTop: 5, lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {it.caption}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 9, color: "#666" }}>
                  <span>{timeAgo(it.timestamp)}</span>
                  {it.likes != null && <span>♥ {fmtFollowers(it.likes)}</span>}
                  {it.comments != null && <span>💬 {it.comments}</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* ─── Voir plus ─── */}
      {filtered.length > limit && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            style={{
              cursor: "pointer", fontSize: 11, borderRadius: 8, padding: "6px 16px",
              border: "1px solid rgba(254,210,56,0.35)", background: "rgba(254,210,56,0.08)", color: "#fed238",
            }}
          >
            Voir plus ({filtered.length - limit} restants)
          </button>
        </div>
      )}
    </div>
  );
}
