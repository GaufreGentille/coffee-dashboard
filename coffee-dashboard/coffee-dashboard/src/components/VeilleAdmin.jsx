import { useState, useEffect } from "react";
import SEED from "../data/insta-handles.json";

// ─── Kissa Soko — Admin de la liste de veille Instagram ──────────────────────
// Discret en bas du panneau veille. Mot de passe = env Netlify VEILLE_ADMIN_KEY.

const HANDLES_URL = "/.netlify/functions/handles";

export default function VeilleAdmin() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(() => sessionStorage.getItem("veille-admin-key") || "");
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ handle: "", name: "", category: "Torrefacteur" });

  const categories = [...new Set([
    "Torrefacteur", "Materiel", "Cafe", "Producteur", "Barista", "Media",
    "Importateur", "Communaute", "The", "Evenement", "Education", "Boutique", "Autre",
    ...list.map((e) => e.category),
  ])];

  const api = async (body) => {
    const r = await fetch(HANDLES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  };

  const loadList = () =>
    fetch(HANDLES_URL).then((r) => r.json()).then((l) => setList(Array.isArray(l) ? l : []));

  useEffect(() => { if (open) loadList(); }, [open]);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const login = async () => {
    setBusy(true);
    try {
      await api({ action: "ping" });
      sessionStorage.setItem("veille-admin-key", key);
      setAuthed(true);
      flash("Connecté ✓");
    } catch (e) {
      flash(e.message === "non autorisé" ? "Mot de passe incorrect" : e.message, false);
    } finally { setBusy(false); }
  };

  const add = async () => {
    if (!form.handle.trim()) return;
    setBusy(true);
    try {
      const res = await api({ action: "add", entry: form });
      flash(`@${res.added.handle} ajouté (${res.count} comptes)`);
      setForm({ handle: "", name: "", category: form.category });
      loadList();
    } catch (e) { flash(e.message, false); }
    finally { setBusy(false); }
  };

  const remove = async (handle) => {
    if (!confirm(`Retirer @${handle} de la veille ?`)) return;
    setBusy(true);
    try {
      const res = await api({ action: "remove", handle });
      flash(`@${handle} retiré (${res.count} comptes)`);
      loadList();
    } catch (e) { flash(e.message, false); }
    finally { setBusy(false); }
  };

  const importSeed = async () => {
    if (!confirm(`Importer la liste de base (${SEED.length} comptes) ? Cela remplace la liste actuelle.`)) return;
    setBusy(true);
    try {
      const res = await api({ action: "replace", list: SEED });
      flash(`Liste importée : ${res.count} comptes`);
      loadList();
    } catch (e) { flash(e.message, false); }
    finally { setBusy(false); }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, color: "#eee", fontSize: 11, padding: "5px 10px", outline: "none",
  };
  const btnStyle = (accent = false) => ({
    cursor: busy ? "wait" : "pointer", fontSize: 11, borderRadius: 8, padding: "5px 14px",
    border: `1px solid ${accent ? "rgba(254,210,56,0.4)" : "rgba(255,255,255,0.15)"}`,
    background: accent ? "rgba(254,210,56,0.12)" : "rgba(255,255,255,0.05)",
    color: accent ? "#fed238" : "#ccc", opacity: busy ? 0.5 : 1,
  });

  const filtered = list.filter((e) => {
    const q = search.trim().toLowerCase();
    return !q || e.handle.includes(q) || (e.name || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen(!open)} style={{
        cursor: "pointer", background: "none", border: "none",
        color: "#555", fontSize: 10, padding: 0,
      }}>
        ⚙️ Gérer la veille {open ? "▲" : "▼"}
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          {msg && (
            <div style={{
              fontSize: 11, marginBottom: 10, padding: "5px 10px", borderRadius: 8,
              color: msg.ok ? "#4ade80" : "#f87171",
              background: msg.ok ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            }}>{msg.text}</div>
          )}

          {!authed ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="Mot de passe admin"
                style={{ ...inputStyle, width: 180 }}
              />
              <button onClick={login} disabled={busy} style={btnStyle(true)}>Connexion</button>
            </div>
          ) : (
            <div>
              {/* Ajout */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
                <input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  placeholder="@handle"
                  style={{ ...inputStyle, width: 140 }}
                />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom affiché (optionnel)"
                  style={{ ...inputStyle, width: 170 }}
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ ...inputStyle, width: 130 }}
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={add} disabled={busy} style={btnStyle(true)}>+ Ajouter</button>
              </div>

              {/* Liste */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrer la liste…"
                  style={{ ...inputStyle, width: 160 }}
                />
                <span style={{ fontSize: 10, color: "#666" }}>{list.length} comptes suivis</span>
                {list.length === 0 && (
                  <button onClick={importSeed} disabled={busy} style={btnStyle(true)}>
                    Importer la liste de base ({SEED.length})
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                {filtered.slice(0, 200).map((e) => (
                  <div key={e.handle} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "4px 10px", fontSize: 11,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{ color: "#eee" }}>@{e.handle}</span>
                    <span style={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                    <span style={{ color: "#888", fontSize: 9, marginLeft: "auto", flexShrink: 0 }}>{e.category}</span>
                    <button onClick={() => remove(e.handle)} disabled={busy} style={{
                      cursor: "pointer", background: "none", border: "none",
                      color: "#f87171", fontSize: 12, padding: "0 2px", flexShrink: 0,
                    }}>✕</button>
                  </div>
                ))}
                {filtered.length > 200 && (
                  <div style={{ padding: 8, fontSize: 10, color: "#666", textAlign: "center" }}>
                    … {filtered.length - 200} de plus — affine le filtre
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
