import { useState, useEffect, useMemo } from "react";
import VeilleAdmin from "./VeilleAdmin.jsx";

// ─── Kissa Soko — Panneau Veille Instagram (v3 : épingles admin) ─────────────
// Feed : /.netlify/functions/get-insta — rempli chaque mardi par GitHub Actions
// Votes : /.netlify/functions/vote — identité légère (pseudo + id localStorage)
// Épingles : /.netlify/functions/pins — posts mis en avant par l'admin, sans
//            limite de durée, images rafraîchies chaque semaine par le script.

const FEED_URL = "/.netlify/functions/get-insta";
const VOTE_URL = "/.netlify/functions/vote";
const PINS_URL = "/.netlify/functions/pins";
const CACHE_KEY = "insta-veille-cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 min
const NEW_THRESHOLD = 7 * 24 * 3600 * 1000; // badge "nouveau" si post < 7 jours
const MAX_POST_AGE = 14 * 24 * 3600 * 1000; // le feed n'affiche que les posts < 2 semaines
const PAGE_SIZE = 48;

const CATEGORY_COLORS = {
  Torrefacteur: "#b4610f",
  Materiel: "#2563eb",
  Cafe: "#2f7a4d",
  Producteur: "#4a7c3f",
  Barista: "#a83bb0",
  Media: "#6b4fc4",
  Importateur: "#c2570d",
  Communaute: "#8a6412",
  The: "#1f7a63",
  Evenement: "#bd3a70",
};
const catColor = (c) => CATEGORY_COLORS[c] || "#6d747a";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fmtCount(n) {
  if (n == null) return "";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

// ─── Identité légère ─────────────────────────────────────────────────────────
function loadIdentity() {
  try {
    const raw = localStorage.getItem("ks-user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id && u?.pseudo) return u;
    }
  } catch { /* localStorage indisponible */ }
  return null;
}

function saveIdentity(pseudo) {
  const user = {
    id: (crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
    pseudo: pseudo.trim().slice(0, 20),
  };
  try { localStorage.setItem("ks-user", JSON.stringify(user)); } catch { /* tant pis */ }
  return user;
}

const netScore = (counts) => (counts?.u || 0) - (counts?.d || 0);

// ─── Modal de choix du pseudo ────────────────────────────────────────────────
function PseudoModal({ onConfirm, onCancel }) {
  const [pseudo, setPseudo] = useState("");
  const valid = pseudo.trim().length >= 2;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--ks-paper-2)", border: "1px solid rgba(218,93,22,0.30)",
          boxShadow: "0 24px 60px rgba(7,23,43,0.18)",
          borderRadius: 14, padding: 24, width: 300, maxWidth: "88vw",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ks-ink)", marginBottom: 6 }}>
          Choisis un pseudo pour voter
        </div>
        <div style={{ fontSize: 10, color: "var(--ks-dim)", lineHeight: 1.5, marginBottom: 14 }}>
          Pas de compte, pas de mot de passe — ton pseudo est lié à ce navigateur.
        </div>
        <input
          autoFocus
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && valid && onConfirm(pseudo)}
          placeholder="Ton pseudo (2-20 caractères)"
          maxLength={20}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#fff", border: "1px solid var(--ks-border-strong)",
            borderRadius: 8, color: "var(--ks-ink)", caretColor: "var(--ks-orange)",
            fontSize: 13, padding: "8px 12px", outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            cursor: "pointer", fontSize: 11, borderRadius: 8, padding: "6px 14px",
            border: "1px solid var(--ks-border-strong)", background: "none", color: "var(--ks-dim)",
          }}>Annuler</button>
          <button
            onClick={() => valid && onConfirm(pseudo)}
            disabled={!valid}
            style={{
              cursor: valid ? "pointer" : "default", fontSize: 11, fontWeight: 700,
              borderRadius: 8, padding: "6px 16px", border: "none",
              background: valid ? "var(--ks-orange)" : "rgba(218,93,22,0.25)", color: "#fff",
            }}
          >C'est parti !</button>
        </div>
      </div>
    </div>
  );
}

// ─── Boutons de vote 🔥/❄️ ───────────────────────────────────────────────────
function VoteButtons({ postId, counts, mine, onVote }) {
  const btn = (dir, emoji, count, active, activeColor) => (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(postId, mine === dir ? 0 : dir); }}
      title={dir === 1 ? "Hot — à ne pas rater" : "Cold — sans intérêt"}
      style={{
        cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
        fontSize: 11, borderRadius: 8, padding: "2px 8px",
        border: `1px solid ${active ? activeColor : "var(--ks-border-strong)"}`,
        background: active ? `${activeColor}1f` : "var(--ks-paper-2)",
        color: active ? activeColor : "var(--ks-dim)",
      }}
    >
      <span>{emoji}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{fmtCount(count) || 0}</span>
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {btn(1, "🔥", counts?.u || 0, mine === 1, "#c2570d")}
      {btn(-1, "❄️", counts?.d || 0, mine === -1, "#2563eb")}
    </div>
  );
}

// ─── Carte de post (feed et épingles) ────────────────────────────────────────
function PostCard({ it, isNew, pinned, isAdmin, votes, onVote, onPin, onUnpin }) {
  const borderColor = pinned
    ? "rgba(218,93,22,0.50)"
    : isNew ? "rgba(218,93,22,0.26)" : "var(--ks-border)";
  return (
    <a
      href={it.permalink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block", textDecoration: "none",
        background: pinned ? "rgba(218,93,22,0.06)" : "rgba(255,255,255,0.55)",
        border: `1px solid ${borderColor}`,
        borderRadius: 12, overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--ks-paper-3)" }}>
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
        {pinned ? (
          <span style={{
            position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700,
            background: "#ea9524", color: "#1a1a1a", borderRadius: 6, padding: "1px 7px",
          }}>📌 ÉPINGLÉ</span>
        ) : isNew && (
          <span style={{
            position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700,
            background: "#fed238", color: "#1a1a1a", borderRadius: 6, padding: "1px 7px",
          }}>NOUVEAU</span>
        )}
        {/* Contrôles admin : épingler / désépingler */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              pinned ? onUnpin(it.id) : onPin(it);
            }}
            title={pinned ? "Retirer l'épingle" : "Épingler en haut du feed"}
            style={{
              position: "absolute", bottom: 8, right: 8, cursor: "pointer",
              fontSize: 12, borderRadius: 8, padding: "3px 8px",
              border: `1px solid ${pinned ? "#ea9524" : "rgba(255,255,255,0.3)"}`,
              background: pinned ? "rgba(234,149,36,0.85)" : "rgba(0,0,0,0.6)",
              color: pinned ? "#1a1a1a" : "#fff",
            }}
          >
            {pinned ? "📌 ✕" : "📌"}
          </button>
        )}
      </div>

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
            fontSize: 11, fontWeight: 700, color: "var(--ks-ink)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {it.account.name || it.account.handle}
          </span>
          <span style={{ fontSize: 9, color: catColor(it.account.category), marginLeft: "auto", flexShrink: 0 }}>
            {it.account.category}
          </span>
        </div>
        <div style={{ fontSize: 9, color: "var(--ks-dim)", marginTop: 2 }}>
          @{it.account.handle}
          {it.account.followers != null && ` · ${fmtCount(it.account.followers)} abonnés`}
        </div>
        {it.caption && (
          <div style={{
            fontSize: 10, color: "var(--ks-ink-2)", marginTop: 5, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {it.caption}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
          <VoteButtons
            postId={it.id}
            counts={votes.counts[it.id]}
            mine={votes.mine[it.id] || 0}
            onVote={onVote}
          />
          <span style={{ fontSize: 9, color: "var(--ks-dim)", marginLeft: "auto" }}>{timeAgo(it.timestamp)}</span>
        </div>
      </div>
    </a>
  );
}

export default function InstaVeillePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent"); // "recent" | "hot"
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [user, setUser] = useState(loadIdentity);
  const [votes, setVotes] = useState({ counts: {}, mine: {} });
  const [pendingVote, setPendingVote] = useState(null);

  const [pins, setPins] = useState({});
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("veille-admin-key") || "");

  // ── Détection de la connexion admin (événement émis par VeilleAdmin) ──
  useEffect(() => {
    const onAuth = () => setAdminKey(sessionStorage.getItem("veille-admin-key") || "");
    window.addEventListener("veille-admin-auth", onAuth);
    return () => window.removeEventListener("veille-admin-auth", onAuth);
  }, []);

  // ── Chargement du feed ──
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { at, payload } = JSON.parse(cached);
        if (Date.now() - at < CACHE_TTL) { setData(payload); return; }
      } catch { /* cache corrompu */ }
    }
    fetch(FEED_URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((payload) => {
        setData(payload);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
        } catch { /* quota */ }
      })
      .catch((e) => setError(String(e)));
  }, []);

  // ── Chargement des épingles (jamais en cache) ──
  useEffect(() => {
    fetch(PINS_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (p && typeof p === "object") setPins(p); })
      .catch(() => { /* épingles optionnelles */ });
  }, []);

  // ── Chargement des votes (jamais en cache) ──
  useEffect(() => {
    const qs = user ? `?user=${encodeURIComponent(user.id)}` : "";
    fetch(VOTE_URL + qs)
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => { if (v) setVotes({ counts: v.counts || {}, mine: v.mine || {} }); })
      .catch(() => { /* votes optionnels */ });
  }, [user]);

  // ── Envoi d'un vote (optimiste) ──
  const sendVote = async (postId, dir, identity) => {
    const u = identity || user;
    if (!u) { setPendingVote({ postId, dir }); return; }

    setVotes((prev) => {
      const counts = { ...prev.counts };
      const mine = { ...prev.mine };
      const c = { ...(counts[postId] || { u: 0, d: 0 }) };
      const old = mine[postId] || 0;
      if (old === 1) c.u = Math.max(0, c.u - 1);
      if (old === -1) c.d = Math.max(0, c.d - 1);
      if (dir === 1) c.u += 1;
      if (dir === -1) c.d += 1;
      counts[postId] = c;
      if (dir === 0) delete mine[postId]; else mine[postId] = dir;
      return { counts, mine };
    });

    try {
      const r = await fetch(VOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, dir, userId: u.id, pseudo: u.pseudo }),
      });
      const res = await r.json();
      if (r.ok) {
        setVotes((prev) => ({
          ...prev,
          counts: { ...prev.counts, [postId]: { u: res.u, d: res.d } },
        }));
      }
    } catch { /* recalé au prochain chargement */ }
  };

  const confirmPseudo = (pseudo) => {
    const u = saveIdentity(pseudo);
    setUser(u);
    if (pendingVote) {
      sendVote(pendingVote.postId, pendingVote.dir, u);
      setPendingVote(null);
    }
  };

  // ── Épingler / désépingler (admin) ──
  const pinPost = async (it) => {
    const item = {
      id: it.id, caption: it.caption, image: it.image, type: it.type,
      permalink: it.permalink, timestamp: it.timestamp,
      account: {
        handle: it.account.handle, name: it.account.name,
        category: it.account.category, profilePic: it.account.profilePic || null,
        followers: it.account.followers ?? null,
      },
    };
    setPins((prev) => ({ ...prev, [it.id]: { ...item, pinnedAt: new Date().toISOString() } }));
    try {
      const r = await fetch(PINS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: "pin", item }),
      });
      if (!r.ok) throw new Error();
    } catch {
      setPins((prev) => { const p = { ...prev }; delete p[it.id]; return p; });
      alert("Échec de l'épinglage (session admin expirée ?)");
    }
  };

  const unpinPost = async (postId) => {
    if (!confirm("Retirer cette épingle ?")) return;
    const backup = pins[postId];
    setPins((prev) => { const p = { ...prev }; delete p[postId]; return p; });
    try {
      const r = await fetch(PINS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: "unpin", postId }),
      });
      if (!r.ok) throw new Error();
    } catch {
      setPins((prev) => ({ ...prev, [postId]: backup }));
      alert("Échec du retrait (session admin expirée ?)");
    }
  };

  // ── Épingles triées (les plus récemment épinglées d'abord) ──
  const pinnedItems = useMemo(
    () => Object.values(pins).sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt)),
    [pins]
  );

  // ── Feed aplati : posts < 2 semaines, hors épingles (affichées à part) ──
  const feed = useMemo(() => {
    if (!data?.accounts) return [];
    const items = [];
    for (const a of data.accounts) {
      if (!a.posts) continue;
      for (const p of a.posts) {
        if (!p.timestamp) continue;
        if (Date.now() - new Date(p.timestamp).getTime() > MAX_POST_AGE) continue;
        if (pins[p.id]) continue; // déjà dans la section épinglée
        items.push({ ...p, account: a });
      }
    }
    return items;
  }, [data, pins]);

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
    const items = feed.filter((it) => {
      if (category !== "Tous" && it.account.category !== category) return false;
      if (q && !it.account.handle.toLowerCase().includes(q) &&
          !(it.account.name || "").toLowerCase().includes(q) &&
          !(it.caption || "").toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "hot") {
      items.sort((x, y) => {
        const diff = netScore(votes.counts[y.id]) - netScore(votes.counts[x.id]);
        if (diff !== 0) return diff;
        return new Date(y.timestamp) - new Date(x.timestamp);
      });
    } else {
      items.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));
    }
    return items;
  }, [feed, category, search, sort, votes.counts]);

  const newCount = useMemo(
    () => feed.filter((it) => Date.now() - new Date(it.timestamp) < NEW_THRESHOLD).length,
    [feed]
  );

  const isAdmin = !!adminKey;

  if (error) {
    return <div style={{ padding: 20, color: "#b4402f", fontSize: 12 }}>
      Erreur de chargement de la veille Instagram : {error}
    </div>;
  }
  if (!data) {
    return <div style={{ padding: 20, color: "var(--ks-dim)", fontSize: 12 }}>Chargement de la veille…</div>;
  }
  if (!feed.length && !pinnedItems.length) {
    return <div style={{ padding: 20 }}>
      <div style={{ color: "var(--ks-dim)", fontSize: 12 }}>
        Aucune donnée pour l'instant — le premier passage de la veille n'a pas encore eu lieu.
      </div>
      <VeilleAdmin />
    </div>;
  }

  return (
    <div>
      {pendingVote && (
        <PseudoModal onConfirm={confirmPseudo} onCancel={() => setPendingVote(null)} />
      )}

      {/* ─── Barre d'etat ───
          Le titre « Veille Instagram » a ete retire : la page porte deja son
          nom en grand juste au-dessus, c'etait le seul onglet a s'annoncer
          deux fois. Il ne reste ici que les compteurs. */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: "var(--ks-dim)" }}>
          {data.stats?.ok ?? "?"} comptes suivis · {feed.length} posts
        </span>
        {newCount > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#3c2d05",
            background: "var(--ks-yellow)", borderRadius: 8, padding: "1px 7px",
          }}>
            {newCount} nouveau{newCount > 1 ? "x" : ""}
          </span>
        )}
        {user && (
          <span style={{ fontSize: 9, color: "var(--ks-dim)" }}>· connecté : <span style={{ color: "var(--ks-orange)", fontWeight: 600 }}>{user.pseudo}</span></span>
        )}
        {data.fetchedAt && (
          <span style={{ fontSize: 9, color: "var(--ks-faint)", marginLeft: "auto" }}>
            màj {timeAgo(data.fetchedAt)}
          </span>
        )}
      </div>

      {/* ─── Section épinglée ─── */}
      {pinnedItems.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--ks-orange)", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            📌 À la une
            <span style={{ fontWeight: 400, color: "var(--ks-dim)", fontSize: 9 }}>
              — sélection de la maison
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 12,
          }}>
            {pinnedItems.map((it) => (
              <PostCard
                key={it.id}
                it={it}
                isNew={false}
                pinned
                isAdmin={isAdmin}
                votes={votes}
                onVote={sendVote}
                onPin={pinPost}
                onUnpin={unpinPost}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Tri + Filtres ─── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--ks-border-strong)" }}>
          {[["recent", "Récents"], ["hot", "🔥 Hot"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setSort(key); setLimit(PAGE_SIZE); }}
              style={{
                cursor: "pointer", fontSize: 10, padding: "4px 11px", border: "none",
                background: sort === key ? "rgba(218,93,22,0.14)" : "var(--ks-paper-2)",
                color: sort === key ? "var(--ks-orange)" : "var(--ks-dim)",
                fontWeight: sort === key ? 700 : 400,
              }}
            >{label}</button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLimit(PAGE_SIZE); }}
          placeholder="Rechercher…"
          style={{
            background: "var(--ks-paper-2)", border: "1px solid var(--ks-border-strong)",
            borderRadius: 8, color: "var(--ks-ink)", caretColor: "var(--ks-orange)",
            fontSize: 11, padding: "4px 10px", outline: "none", width: 130,
          }}
        />
        {[["Tous", feed.length], ...categories.slice(0, 8)].map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setLimit(PAGE_SIZE); }}
            style={{
              cursor: "pointer", fontSize: 10, borderRadius: 8, padding: "3px 9px",
              border: `1px solid ${category === cat ? catColor(cat) : "var(--ks-border-strong)"}`,
              background: category === cat ? `${catColor(cat)}1a` : "var(--ks-paper-2)",
              color: category === cat ? catColor(cat) : "var(--ks-dim)",
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
        {filtered.slice(0, limit).map((it) => (
          <PostCard
            key={it.id}
            it={it}
            isNew={Date.now() - new Date(it.timestamp) < NEW_THRESHOLD}
            pinned={false}
            isAdmin={isAdmin}
            votes={votes}
            onVote={sendVote}
            onPin={pinPost}
            onUnpin={unpinPost}
          />
        ))}
      </div>

      {/* ─── Voir plus ─── */}
      {filtered.length > limit && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            style={{
              cursor: "pointer", fontSize: 11, borderRadius: 8, padding: "6px 16px",
              border: "1px solid rgba(218,93,22,0.40)", background: "rgba(218,93,22,0.08)", color: "var(--ks-orange)",
            }}
          >
            Voir plus ({filtered.length - limit} restants)
          </button>
        </div>
      )}

      {/* ─── Admin (discret, mot de passe requis) ─── */}
      <VeilleAdmin />
    </div>
  );
}
