=== Zoventic GEO – AI Search Optimization & llms.txt for WooCommerce ===
Contributors: zoventic
Tags: woocommerce, ai, seo, llms.txt, chatgpt
Requires at least: 6.2
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generative Engine Optimization (GEO) & llms.txt suite for WooCommerce. Optimize your store catalog for ChatGPT, Perplexity, and Claude.

== Description ==

**Zoventic GEO** is the industry-standard Generative Engine Optimization (GEO) and AI discoverability suite built natively for WooCommerce.

While traditional SEO plugins optimize for standard 10-blue-link search result pages, **Zoventic GEO structures your store for AI Answer Engines, RAG (Retrieval-Augmented Generation) ingestion, and conversational shopping queries** across ChatGPT Search, Perplexity AI, Google AI Overviews, Claude, and Copilot.

### Why Does Your WooCommerce Store Need GEO?
Standard WooCommerce product pages carry 1.5MB to 4MB of heavy HTML, sliders, and JavaScript. When AI search crawlers (like `GPTBot` or `PerplexityBot`) crawl your site, their strict token budgets get exhausted before reading your actual pricing, product specs, and warranty policies.

Zoventic GEO solves this by providing:
1. **Dynamic `/llms.txt` and `/llms-full.txt` Streaming:** Standard-compliant, clean markdown product feeds that AI agents can ingest in fractions of a second with zero token bloat.
2. **Enhanced JSON-LD Entity Graphs:** Injects rich, structured semantic schema (Product, Offer, verified AggregateRating, Return Policy, and Availability) that conversational LLMs require to quote your products accurately.
3. **AI Prompt Injection Shield (Prompt Guard™):** Protects your store catalog against indirect prompt injection, hidden zero-width unicode attacks, and malicious competitor redirection payloads.
4. **AI Crawler Access Telemetry:** Real-time logging of verified AI bots (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Bytespider`) with cached Reverse DNS (FCrDNS) anti-spoofing.
5. **Native WooCommerce 8.5+ AI Order Attribution:** Automatically queries WooCommerce's built-in order attribution (`_wc_order_attribution_*`) to track orders and GMV generated directly from AI search citations.
6. **HTTP ETag & 304 Caching:** Saves up to 95% server bandwidth by sending instant HTTP 304 Not Modified responses when catalog data has not changed.

== External Services ==

This plugin connects to external services to provide security updates and search engine discovery features:

1. **Zoventic Bot Manifest Service (CDN):**
   * **Purpose:** Weekly retrieval of the latest verified AI crawler user-agents and IP range signatures so your store recognizes new search bots without requiring a plugin update.
   * **Endpoint:** `https://manifest.zoventic.com/bots.json`
   * **Data Sent:** None. It performs a standard read-only HTTP GET request with no store data, user data, or personal information transmitted.
   * **Service Terms & Privacy:** [Zoventic Privacy Policy](https://zoventic.com/privacy)

2. **Microsoft IndexNow API (Optional):**
   * **Purpose:** When enabled in settings, automatically pings the IndexNow protocol upon product publication to accelerate search engine indexing.
   * **Endpoint:** `https://api.indexnow.org/indexnow`
   * **Data Sent:** Newly published or updated product URLs and the store's IndexNow API key.
   * **Service Terms & Privacy:** [IndexNow Terms](https://www.indexnow.org/faq)

== Installation ==

1. Upload the `zoventic-geo` folder to your `/wp-content/plugins/` directory, or install directly through the WordPress Plugins dashboard.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Ensure **WooCommerce 7.0+** is installed and active.
4. Navigate to **WooCommerce > Zoventic GEO** in your WordPress admin menu.
5. Review your automatically generated `/llms.txt` feed and verify your catalog's GEO Readiness Score.

== Frequently Asked Questions ==

= Does this plugin guarantee #1 ranking in ChatGPT? =
No. LLMs are probabilistic, non-deterministic answer engines. Anyone claiming "guaranteed #1 AI ranking" is selling deceptive hype. Zoventic GEO maximizes your citability and readability so AI engines choose your store when answering relevant buyer queries.

= Where can I view my store's llms.txt file? =
Once activated, your feed is accessible at `https://yourstore.com/llms.txt` and `https://yourstore.com/llms-full.txt`.

= Will this slow down my store's checkout? =
Not at all. Zoventic GEO operates with zero frontend JavaScript or CSS on customer-facing pages. Crawler logging is deferred to the WordPress `shutdown` hook via an asynchronous memory buffer, having 0.00ms impact on checkout latency.

= Is this compatible with Rank Math and Yoast SEO? =
Yes. Zoventic GEO hooks cleanly into `woocommerce_structured_data_product` and existing SEO schema filters, preventing duplicate schema declarations and ensuring seamless harmony.

== Changelog ==

= 1.0.0 =
* Initial official release.
* Dynamic `/llms.txt` and `/llms-full.txt` stream with ETag 304 caching.
* JSON-LD semantic entity graph enhancer.
* Real-time AI crawler access logging with cached FCrDNS anti-spoofing.
* AI Prompt Injection Shield (Prompt Guard™).
* Native WooCommerce 8.5+ AI Order Attribution & Revenue tracking.
* React 19 + Ant Design v6 isolated admin dashboard.
