import { useState, useEffect, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", // index 0 unused
  "Jan 26", "Fév 26", "Mar 26", "Avr 26", "Mai 26", "Juin 26",
  "Juil 26", "Aoû 26", "Sep 26", "Oct 26", "Nov 26", "Déc 26",
  "Jan 27", "Fév 27", "Mar 27", "Avr 27", "Mai 27", "Juin 27",
];

const MONTH_LABELS_SHORT = [
  "", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D",
  "J", "F", "M", "A", "M", "J",
];

// Convert real Date to calendar index (1 = Jan 2026 ... 18 = Jun 2027)
function dateToIndex(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-based
  if (y === 2026) return m;
  if (y === 2027 && m <= 6) return 12 + m;
  return null;
}

// ─── Status engine ────────────────────────────────────────────────────────────
// Given a single cycle and the current month index, compute status

function getCycleStatus(cycle, nowIdx) {
  const inArr = (arr, i) => arr && arr.includes(i);
  const nearArr = (arr, i, n = 2) =>
    arr && arr.some((x) => x > i && x - i <= n);

  if (inArr(cycle.available_eu, nowIdx)) return "available";
  if (inArr(cycle.shipping, nowIdx)) return "shipping";
  if (inArr(cycle.buying_window, nowIdx)) return "buying";
  if (inArr(cycle.harvest, nowIdx)) return "harvest";

  // Not in any active window — check if something is coming soon (within 2 months)
  if (nearArr(cycle.available_eu, nowIdx)) return "arriving_soon";
  if (nearArr(cycle.shipping, nowIdx)) return "shipping_soon";
  if (nearArr(cycle.buying_window, nowIdx)) return "buying_soon";

  return null;
}

// Best status across all cycles of an origin
function getOriginStatus(origin, nowIdx) {
  const priority = [
    "available", "shipping", "arriving_soon",
    "shipping_soon", "buying", "buying_soon", "harvest",
  ];
  const statuses = origin.cycles.map((c) => getCycleStatus(c, nowIdx)).filter(Boolean);
  if (!statuses.length) return null;
  for (const s of priority) {
    if (statuses.includes(s)) return s;
  }
  return statuses[0];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  available: {
    label: "En entrepôt",
    color: "#2f7a4d",
    bg: "rgba(47,122,77,0.12)",
    border: "rgba(47,122,77,0.35)",
    dot: "#2f7a4d",
  },
  shipping: {
    label: "En route",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.35)",
    dot: "#2563eb",
  },
  arriving_soon: {
    label: "Arrive bientôt",
    color: "#c2570d",
    bg: "rgba(194,87,13,0.14)",
    border: "rgba(194,87,13,0.45)",
    dot: "#c2570d",
  },
  shipping_soon: {
    label: "Embarque bientôt",
    color: "#8a6412",
    bg: "rgba(138,100,18,0.10)",
    border: "rgba(138,100,18,0.35)",
    dot: "#8a6412",
  },
  buying: {
    label: "Fenêtre d'achat",
    color: "#a83bb0",
    bg: "rgba(168,59,176,0.12)",
    border: "rgba(168,59,176,0.35)",
    dot: "#a83bb0",
  },
  buying_soon: {
    label: "Achat imminent",
    color: "#6b4fc4",
    bg: "rgba(107,79,196,0.12)",
    border: "rgba(107,79,196,0.35)",
    dot: "#6b4fc4",
  },
  harvest: {
    label: "En récolte",
    color: "#4a7c3f",
    bg: "rgba(74,124,63,0.08)",
    border: "rgba(74,124,63,0.2)",
    dot: "#4a7c3f",
  },
};

const PANEL_CONFIGS = [
  {
    id: "taste",
    icon: "☕",
    title: "À goûter maintenant",
    subtitle: "Cafés disponibles en entrepôt Europe",
    statuses: ["available"],
    accent: "#2f7a4d",
  },
  {
    id: "buy",
    icon: "🛒",
    title: "À acheter",
    subtitle: "Fenêtre d'achat ouverte — commandez vos échantillons",
    statuses: ["buying"],
    accent: "#a83bb0",
  },
  {
    id: "soon",
    icon: "🚢",
    title: "Arrive bientôt",
    subtitle: "En route vers les entrepôts européens",
    statuses: ["shipping", "arriving_soon"],
    accent: "#2563eb",
  },
  {
    id: "alert",
    icon: "⚡",
    title: "Alerte — imminent",
    subtitle: "Fenêtre d'achat qui s'ouvre dans moins de 2 mois",
    statuses: ["buying_soon", "shipping_soon"],
    accent: "#c2570d",
  },
];

const REGION_FILTERS = ["Tous", "Amérique du Sud", "Amérique Centrale", "Afrique", "Asie"];
const PROCESS_FILTERS = ["Tous", "washed", "natural", "honey", "anaerobic", "wet-hulled"];

// ─── Mini Gantt row ───────────────────────────────────────────────────────────

function GanttRow({ cycle, nowIdx }) {
  const total = 18;
  const cells = Array.from({ length: total }, (_, i) => i + 1);
  const getType = (idx) => {
    if (cycle.available_eu?.includes(idx)) return "available";
    if (cycle.shipping?.includes(idx)) return "shipping";
    if (cycle.buying_window?.includes(idx)) return "buying";
    if (cycle.harvest?.includes(idx)) return "harvest";
    return null;
  };
  const typeColors = {
    harvest: "#4a7c3f44",
    buying: "#a83bb033",
    shipping: "#2563eb44",
    available: "#2f7a4d44",
  };
  const typeBorders = {
    harvest: "#4a7c3f",
    buying: "#a83bb0",
    shipping: "#2563eb",
    available: "#2f7a4d",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 6 }}>
      <span style={{ fontSize: 9, color: "var(--ks-dim)", minWidth: 90, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
        {cycle.label}
      </span>
      <div style={{ display: "flex", gap: 1, flex: 1 }}>
        {cells.map((idx) => {
          const t = getType(idx);
          const isNow = idx === nowIdx;
          return (
            <div
              key={idx}
              title={`${MONTH_NAMES[idx]}${t ? " — " + STATUS_CONFIG[t]?.label : ""}`}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 2,
                background: t ? typeColors[t] : "rgba(255,255,255,0.55)",
                border: isNow
                  ? "1.5px solid var(--ks-ink)"
                  : t
                  ? `1px solid ${typeBorders[t]}44`
                  : "1px solid rgba(7,23,43,0.08)",
                transition: "transform 0.1s",
                cursor: "default",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Origin card ─────────────────────────────────────────────────────────────

function OriginCard({ origin, nowIdx, expanded, onToggle }) {
  const status = getOriginStatus(origin, nowIdx);
  const cfg = STATUS_CONFIG[status] || {};

  return (
    <div
      onClick={onToggle}
      style={{
        background: expanded
          ? "rgba(255,255,255,0.78)"
          : cfg.bg || "rgba(255,255,255,0.55)",
        border: `1px solid ${expanded ? "var(--ks-border-strong)" : cfg.border || "var(--ks-border)"}`,
        borderRadius: 10,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: 6,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{origin.flag}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ks-ink)" }}>
              {origin.country}
            </span>
            {origin.alert && (
              <span style={{ fontSize: 10, color: "#c2570d" }}>⚠</span>
            )}
          </div>
          <div style={{ fontSize: 10, color: "var(--ks-dim)", marginTop: 1 }}>
            {origin.typical_processes.join(" · ")}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: cfg.color || "var(--ks-dim)",
            background: cfg.bg,
            border: `1px solid ${cfg.border || "transparent"}`,
            borderRadius: 20,
            padding: "2px 8px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: cfg.dot || "var(--ks-dim)",
              marginRight: 5,
              verticalAlign: "middle",
            }}
          />
          {cfg.label || "Hors saison"}
        </div>
        <span style={{ fontSize: 10, color: "var(--ks-faint)", marginLeft: 4 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 10 }}>
          {/* Alert */}
          {origin.alert && (
            <div
              style={{
                background: "rgba(194,87,13,0.1)",
                border: "1px solid rgba(194,87,13,0.3)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 11,
                color: "#c2570d",
                marginBottom: 8,
              }}
            >
              {origin.alert}
            </div>
          )}

          {/* Notes */}
          <div
            style={{
              fontSize: 11,
              color: "var(--ks-ink-2)",
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            {origin.notes}
          </div>

          {/* Regions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {origin.key_regions.map((r) => (
              <span
                key={r}
                style={{
                  fontSize: 10,
                  color: "var(--ks-ink-2)",
                  background: "rgba(7,23,43,0.07)",
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              >
                {r}
              </span>
            ))}
          </div>

          {/* Gantt */}
          <div>
            <div style={{ display: "flex", gap: 1, marginLeft: 92 }}>
              {Array.from({ length: 18 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    fontSize: 8,
                    color: i + 1 === nowIdx ? "var(--ks-ink)" : "var(--ks-faint)",
                    fontWeight: i + 1 === nowIdx ? 700 : 400,
                    textAlign: "center",
                  }}
                >
                  {MONTH_LABELS_SHORT[i + 1]}
                </div>
              ))}
            </div>
            {origin.cycles.map((c, i) => (
              <GanttRow key={i} cycle={c} nowIdx={nowIdx} />
            ))}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Récolte", color: "#4a7c3f" },
              { label: "Fenêtre achat", color: "#a83bb0" },
              { label: "Embarquement", color: "#2563eb" },
              { label: "Disponible EU", color: "#2f7a4d" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 12,
                    height: 8,
                    borderRadius: 2,
                    background: color + "44",
                    border: `1px solid ${color}`,
                  }}
                />
                <span style={{ fontSize: 9, color: "var(--ks-dim)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section panel ────────────────────────────────────────────────────────────

function SectionPanel({ config, origins, nowIdx }) {
  const [expanded, setExpanded] = useState(null);

  const matching = useMemo(
    () =>
      origins.filter((o) => {
        const s = getOriginStatus(o, nowIdx);
        return config.statuses.includes(s);
      }),
    [origins, nowIdx, config.statuses]
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.50)",
        border: `1px solid var(--ks-border)`,
        borderRadius: 12,
        padding: "14px 14px",
        borderTop: `2px solid ${config.accent}`,
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{config.icon}</span>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 13, color: "var(--ks-ink)" }}
            >
              {config.title}
            </div>
            <div style={{ fontSize: 10, color: "var(--ks-dim)", marginTop: 1 }}>
              {config.subtitle}
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: config.accent + "22",
              border: `1px solid ${config.accent}55`,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
              fontWeight: 700,
              color: config.accent,
            }}
          >
            {matching.length}
          </div>
        </div>
      </div>

      {/* Origins */}
      {matching.length === 0 ? (
        <div
          style={{ fontSize: 11, color: "var(--ks-faint)", textAlign: "center", padding: "10px 0" }}
        >
          Aucune origine dans cette fenêtre actuellement
        </div>
      ) : (
        matching.map((o) => (
          <OriginCard
            key={o.id}
            origin={o}
            nowIdx={nowIdx}
            expanded={expanded === o.id}
            onToggle={() =>
              setExpanded(expanded === o.id ? null : o.id)
            }
          />
        ))
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HarvestPanel({ data }) {
  const [regionFilter, setRegionFilter] = useState("Tous");
  const [processFilter, setProcessFilter] = useState("Tous");
  const [activeTab, setActiveTab] = useState("grid"); // 'grid' | 'all'

  const nowIdx = useMemo(() => dateToIndex(new Date()) || 6, []);
  const nowLabel = MONTH_NAMES[nowIdx] || "?";

  const filteredOrigins = useMemo(() => {
    if (!data?.origins) return [];
    return data.origins.filter((o) => {
      const regionOk = regionFilter === "Tous" || o.region === regionFilter;
      const processOk =
        processFilter === "Tous" ||
        o.typical_processes.some((p) =>
          p.toLowerCase().includes(processFilter.toLowerCase())
        );
      return regionOk && processOk;
    });
  }, [data, regionFilter, processFilter]);

  if (!data) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--ks-faint)",
          fontSize: 12,
        }}
      >
        Chargement du calendrier…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "var(--ks-ink)",
        padding: "0 0 20px 0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ks-ink)" }}>
            Calendrier des origines
          </div>
          <div style={{ fontSize: 11, color: "var(--ks-dim)", marginTop: 2 }}>
            Aujourd'hui : <span style={{ color: "var(--ks-ink-2)" }}>{nowLabel}</span>
            {" · "}
            <span style={{ color: "var(--ks-faint)" }}>Source : Algrano DSC 2026-27</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "grid", label: "Par statut" },
            { id: "all", label: "Toutes les origines" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background:
                  activeTab === t.id
                    ? "var(--ks-ink)"
                    : "rgba(255,255,255,0.55)",
                border: `1px solid ${
                  activeTab === t.id
                    ? "var(--ks-ink)"
                    : "var(--ks-border)"
                }`,
                borderRadius: 6,
                color: activeTab === t.id ? "#fff" : "var(--ks-dim)",
                fontSize: 11,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {/* Region */}
        <div style={{ display: "flex", gap: 3 }}>
          {REGION_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 20,
                border: `1px solid ${
                  regionFilter === r
                    ? "var(--ks-ink)"
                    : "var(--ks-border)"
                }`,
                background:
                  regionFilter === r
                    ? "var(--ks-ink)"
                    : "transparent",
                color: regionFilter === r ? "#fff" : "var(--ks-dim)",
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div style={{ width: 1, background: "var(--ks-border)" }} />
        {/* Process */}
        <div style={{ display: "flex", gap: 3 }}>
          {PROCESS_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setProcessFilter(p)}
              style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 20,
                border: `1px solid ${
                  processFilter === p
                    ? "var(--ks-ink)"
                    : "var(--ks-border)"
                }`,
                background:
                  processFilter === p
                    ? "var(--ks-ink)"
                    : "transparent",
                color: processFilter === p ? "#fff" : "var(--ks-dim)",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 12,
          }}
        >
          {PANEL_CONFIGS.map((cfg) => (
            <SectionPanel
              key={cfg.id}
              config={cfg}
              origins={filteredOrigins}
              nowIdx={nowIdx}
            />
          ))}
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--ks-faint)",
              marginBottom: 10,
            }}
          >
            {filteredOrigins.length} origines · Cliquez pour voir le calendrier détaillé
          </div>
          {filteredOrigins.map((o) => {
            const status = getOriginStatus(o, nowIdx);
            const cfg = STATUS_CONFIG[status] || {};
            return (
              <div
                key={o.id}
                style={{
                  background: cfg.bg || "rgba(255,255,255,0.50)",
                  border: `1px solid ${cfg.border || "var(--ks-border)"}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>{o.flag}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: "var(--ks-ink)" }}>
                    {o.country}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--ks-dim)", marginLeft: 8 }}>
                    {o.region}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {o.typical_processes.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: 9,
                        color: "var(--ks-dim)",
                        background: "rgba(7,23,43,0.06)",
                        border: "1px solid var(--ks-border)",
                        borderRadius: 3,
                        padding: "1px 5px",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: cfg.color || "var(--ks-dim)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cfg.label || "Hors saison"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Source footer */}
      <div
        style={{
          marginTop: 16,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.45)",
          border: "1px solid var(--ks-border)",
          borderRadius: 8,
          fontSize: 10,
          color: "var(--ks-faint)",
        }}
      >
        <span style={{ color: "var(--ks-dim)" }}>Sources vérifiées : </span>
        Algrano Direct Sourcing Calendar 2026-27 ·{" "}
        <a
          href="https://algrano.com/learn/sourcing-calendar"
          target="_blank"
          rel="noopener"
          style={{ color: "#2f7a4d", textDecoration: "none" }}
        >
          algrano.com
        </a>{" "}
        · Données mises à jour manuellement — dernière vérification :{" "}
        <span style={{ color: "var(--ks-dim)" }}>Juin 2026</span>
      </div>
    </div>
  );
}
