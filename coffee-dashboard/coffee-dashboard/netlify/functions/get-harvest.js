/**
 * Netlify Function: get-harvest.js
 * Lit harvest-calendar.json depuis GitHub raw + calcule les statuts live
 */

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/GaufreGentille/coffee-dashboard/main/src/data/harvest-calendar.json";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

function dateToMonthIndex(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  if (y === 2026) return m;
  if (y === 2027 && m <= 6) return 12 + m;
  return 6; // fallback juin 2026
}

function getOriginStatus(origin, nowIdx) {
  const priority = [
    "available", "shipping", "arriving_soon",
    "shipping_soon", "buying", "buying_soon", "harvest",
  ];

  const cycleStatuses = origin.cycles.map((cycle) => {
    const { available_eu, shipping, buying_window, harvest } = cycle;
    if (available_eu?.includes(nowIdx)) return "available";
    if (shipping?.includes(nowIdx)) return "shipping";
    if (buying_window?.includes(nowIdx)) return "buying";
    if (harvest?.includes(nowIdx)) return "harvest";
    const nearIn = (arr, n = 2) => arr?.some((x) => x > nowIdx && x - nowIdx <= n);
    if (nearIn(available_eu)) return "arriving_soon";
    if (nearIn(shipping)) return "shipping_soon";
    if (nearIn(buying_window)) return "buying_soon";
    return null;
  });

  const nonNull = cycleStatuses.filter(Boolean);
  if (!nonNull.length) return "off_season";
  for (const p of priority) {
    if (nonNull.includes(p)) return p;
  }
  return nonNull[0];
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "ok" };
  }

  try {
    const response = await fetch(GITHUB_RAW_URL);

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    const data = await response.json();

    const now = new Date();
    const nowIdx = dateToMonthIndex(now);

    const enriched = {
      ...data,
      _live: {
        today: now.toISOString().split("T")[0],
        month_index: nowIdx,
        computed_at: new Date().toISOString(),
      },
      origins: data.origins.map((origin) => ({
        ...origin,
        _status: getOriginStatus(origin, nowIdx),
      })),
    };

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(enriched),
    };
  } catch (err) {
    console.error("get-harvest error:", err.message);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
