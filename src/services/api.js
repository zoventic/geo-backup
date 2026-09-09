// Zoventic GEO WordPress REST API Client

const getConfig = () => {
  if (typeof window !== "undefined" && window.zgeoConfig) {
    return window.zgeoConfig;
  }
  return {
    restUrl: "/wp-json/zoventic-geo/v1/",
    nonce: "",
    siteName: "My WooCommerce Store",
    siteUrl: typeof window !== "undefined" ? window.location.origin : "",
    currency: "USD",
    currencySymbol: "$"
  };
};

const request = async (endpoint, options = {}) => {
  const config = getConfig();
  let url = config.restUrl || "/wp-json/zoventic-geo/v1/";
  if (!url.endsWith("/")) url += "/";
  url += endpoint.replace(/^\//, "");

  const headers = {
    "Content-Type": "application/json",
    ...(config.nonce ? { "X-WP-Nonce": config.nonce } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status + ": " + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.warn("[Zoventic GEO API] Request to " + endpoint + " failed:", error.message);
    throw error;
  }
};

export const api = {
  getConfig,

  getOverview: () => request("overview"),

  getProducts: () => request("products"),

  optimizeProduct: (id) => request("products/" + id + "/optimize", { method: "POST" }),

  getCrawlers: () => request("crawlers"),

  clearCrawlers: () => request("crawlers", { method: "DELETE" }),

  getSettings: () => request("settings"),

  saveSettings: (settings) => request("settings", {
    method: "POST",
    body: JSON.stringify(settings)
  }),

  getLlmsTxt: () => request("llms-txt"),

  reindexFeed: () => request("reindex", { method: "POST" }),

  scanPromptSafety: (content) => request("safety/scan", {
    method: "POST",
    body: JSON.stringify({ content })
  }),

  getAiRevenue: (days = 30) => request("attribution/revenue?days=" + days),

  getQueries: () => request("queries"),

  saveQuery: (query) => request("queries", {
    method: "POST",
    body: JSON.stringify(query)
  }),

  deleteQuery: (id) => request("queries/" + id, { method: "DELETE" }),

  startBulkOptimize: () => request("products/bulk-optimize", { method: "POST" }),

  getBulkOptimizeProgress: () => request("products/bulk-optimize/progress"),

  cancelBulkOptimize: () => request("products/bulk-optimize/cancel", { method: "POST" }),

  auditDomain: (domain) => request("audit/domain", {
    method: "POST",
    body: JSON.stringify({ domain })
  }),

  sendTestDigest: (email) => request("settings/test-digest", {
    method: "POST",
    body: JSON.stringify({ email })
  }),

  pingIndexNow: () => request("indexnow/ping", {
    method: "POST",
    body: JSON.stringify({})
  }),

  rotateIndexNowKey: () => request("indexnow/rotate-key", {
    method: "POST",
    body: JSON.stringify({})
  }),

  getAbilities: () => request("abilities"),

  runQueriesAudit: () => request("queries/run-audit", {
    method: "POST",
    body: JSON.stringify({})
  }),

  simulateCrawlerHit: (bot = "PerplexityBot") => request("crawlers/simulate", {
    method: "POST",
    body: JSON.stringify({ bot })
  }),

  getLicense: () => request("license"),

  activateLicense: (key) => request("license/activate", {
    method: "POST",
    body: JSON.stringify({ key })
  }),

  deactivateLicense: () => request("license/deactivate", {
    method: "POST"
  })
};

export default api;