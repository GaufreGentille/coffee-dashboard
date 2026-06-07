/**
 * Netlify Function: get-harvest.js
 * Proxy vers le Cloudflare Worker kissa-soko-harvest
 * 
 * Endpoint: /.netlify/functions/get-harvest
 */

const WORKER_URL = "https://kissa-soko-harvest.raphimignon.workers.dev";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

function httpsGet(url) {
  const https = require("https");
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: { "User-Agent": "KissaSoko-Netlify/1.0", Accept: "application/json" },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: {} });
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
    req.end();
  });
}

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "ok" };
  }

  const forceRefresh = event.queryStringParameters?.refresh === "1";
  const now = Date.now();

  // Serve from in-memory cache if fresh
  if (cache && !forceRefresh && now - cacheTime < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { ...HEADERS, "X-Cache": "HIT" },
      body: JSON.stringify(cache),
    };
  }

  try {
    const workerUrl =
      WORKER_URL + (forceRefresh ? "?refresh=1" : "");
    const { status, body } = await httpsGet(workerUrl);

    if (status !== 200 || !body.origins) {
      throw new Error(`Worker responded with status ${status}`);
    }

    cache = body;
    cacheTime = now;

    return {
      statusCode: 200,
      headers: { ...HEADERS, "X-Cache": "MISS" },
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.error("get-harvest error:", err.message);

    if (cache) {
      return {
        statusCode: 200,
        headers: { ...HEADERS, "X-Cache": "STALE" },
        body: JSON.stringify(cache),
      };
    }

    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
