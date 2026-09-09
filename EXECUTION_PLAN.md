# Zoventic GEO: Master Execution & Development Plan

> **Project Name:** Zoventic GEO  
> **Official WordPress Plugin Slug:** `zoventic-geo`  
> **Full Title:** `Zoventic GEO – AI Search Optimization & llms.txt for WooCommerce`  
> **Target Platform:** WordPress 6.7+ & WooCommerce 9.x+ (Global Market)  
> **Architecture:** React 19 + Vite 8 + Ant Design v6 + Zustand + WordPress PSR-4 OOP Backend  
> **Document Type:** Step-by-Step Technical Execution Roadmap & Launch Plan  
> **Version:** 2.0 (90-Day Phased Roadmap Aligned with master_plan_v2)  
> **Date:** September 2026  

---

## 1. Plan Overview & Engineering Principles

This document outlines the technical, engineering, quality assurance, and commercial milestones required to deliver **Zoventic GEO**, secure WordPress.org approval, and roll out the Pro monetization tier.

### Core Engineering Principles:
1. **Lightweight & High-Performance:** Ultra-lightweight footprint (<2MB production zip), zero frontend CSS/JS bleed on storefront pages, and PHP 7.4–8.3+ compliance with WordPress Coding Standards (WPCS).
2. **Safe, Scalable Catalog Processing:** Non-blocking asynchronous processing via WooCommerce's **Action Scheduler** (batches of 25 items) to eliminate execution timeouts on 10,000+ SKU catalogs.
3. **Flawless WordPress.org Compliance:** 100% adherence to WordPress plugin review requirements: no remote CDN scripts, proper data disclosures, clean `uninstall.php`, and zero Plugin Check (PCP) errors.
4. **Honest, Unambiguous Feature Positioning:** Every readiness metric and simulation is clearly designated as a structural diagnostic rather than speculative AI search rank guarantees.

---

## 2. 90-Day Execution Phasing Overview

```
                               90-DAY EXECUTION TIMELINE
                               
  DAYS 1–14: MVP CORE          DAYS 15–30: UI & WP.ORG SUBMIT  DAYS 31–60: PRO TIER ROLLOUT   DAYS 61–90: GROWTH & SCALE
  ┌────────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────────┐
  │ • Plugin Scaffolding   │   │ • 8 React UI Tabs Finish  │   │ • Freemius SDK Licensing │   │ • Agency Tier Expansion │
  │ • Dynamic /llms.txt    │   │ • Local Readiness & Sim   │   │ • BYOK AI Enrichment     │   │ • Free GEO Audit Tool   │
  │ • JSON-LD Enhancer     │   │ • Clean uninstall.php     │   │ • Bulk Action Scheduler  │   │ • ProductHunt Launch    │
  │ • BotDetector + Logs   │   │ • WPCS & Plugin Check     │   │ • Sub-feeds & Bing Ping  │   │ • Partner Outreach      │
  │ • Parallel Validation  │   │ • WordPress.org Submit    │   │ • Weekly Email Digest    │   │ • 50–150 Pro Customers  │
  └────────────────────────┘   └───────────────────────────┘   └──────────────────────────┘   └─────────────────────────┘
```

---

## 3. Phase-by-Phase Technical Blueprint

### Phase 1: MVP Core Engine & Customer Validation (Days 1–14)
* **Goal:** Deliver an operational on-premises backend and execute preliminary merchant interviews.
* **Tasks:**
  1. **Customer Discovery & Problem Validation (Parallel Track):**
     * Post structured inquiry questions in WooCommerce merchant communities (Reddit `r/woocommerce`, Facebook groups) to assess awareness of AI search traffic.
     * Conduct 5–10 short validation chats to understand pricing expectations and immediate pain points.
  2. **PSR-4 Scaffolding & Core Architecture:**
     ```
     zoventic-geo/
     ├── zoventic-geo.php            # Main bootstrap header & lifecycle hooks
     ├── readme.txt                  # Standard metadata & external disclosures
     ├── uninstall.php               # Complete database and options cleanup
     ├── includes/
     │   ├── Core/
     │   │   ├── Plugin.php          # Singleton orchestrator
     │   │   ├── Activator.php       # DB table migration & rewrite rules
     │   │   └── Deactivator.php     # Cron cleanup & rewrite flush
     │   ├── Admin/
     │   │   ├── Menu.php            # Admin menu mounting (manage_woocommerce)
     │   │   └── Assets.php          # Isolated script enqueues
     │   ├── Engine/
     │   │   ├── LlmsTxtGenerator.php # /llms.txt stream & ETag 304 generator
     │   │   ├── SchemaBuilder.php   # JSON-LD enrichment (Product, Offer, Rating)
     │   │   ├── BotDetector.php     # AI User-Agent sniffer + cached FCrDNS
     │   │   └── PromptSanitizer.php # Prompt Guard™ injection defense
     │   ├── Rest/
     │   │   └── RestController.php  # /wp-json/zoventic-geo/v1 endpoints
     │   └── Abilities/
     │       └── AbilitiesRegistry.php # WP AI Abilities API registration
     ├── src/                        # React 19 + Ant Design v6 + Zustand UI
     └── dist/                       # Vite 8 production build
     ```
  3. **Database Migration:**
     * Register `wp_zgeo_crawler_logs` table (id, bot_name, ip_address, rdns_status, request_uri, status_code, created_at) with indexed `bot_name` and `created_at`.
  4. **Dynamic `/llms.txt` Endpoint:**
     * Register rewrite rule: `add_rewrite_rule('^llms\.txt$', 'index.php?zgeo_feed=llmstxt', 'top')`.
     * Stream structured markdown with product attributes, SKU, pricing, in-stock indicators, and `PromptSanitizer` security verification.
     * Serve `HTTP 304 Not Modified` via ETag headers when catalog content remains unchanged.
  5. **Crawler Sniffer, Safe Rate Limiter & Bot Logging:**
     * Inspect incoming requests for AI user-agents (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Bytespider`).
     * Implement origin-level tolerant rate-limiting (60+ req/min) for unverified scrapers while automatically bypassing FCrDNS-verified legitimate AI crawlers.
     * Buffer log entries and persist them during the WordPress `shutdown` hook to eliminate storefront latency.
  6. **REST API Controller:**
     * Expose `/overview`, `/products`, `/crawlers`, `/settings`, and `/safety/scan` with mandatory `manage_woocommerce` capability checks and nonce verification.

* **Deliverable:** Fully functional plugin that activates, creates tables, generates `/llms.txt`, and logs AI crawlers.

---

### Phase 2: Complete Dashboard UI & WordPress.org Submission (Days 15–30)
* **Goal:** Finalize all frontend modules, pass all automated code audits, and submit to WordPress.org.
* **Tasks:**
  1. **Frontend Architecture Integration:**
     * Build with **React 19**, **Ant Design v6**, **Zustand**, and **Vite 8**.
     * Enforce strict admin CSS isolation using `<StyleProvider hashPriority="high">` and `<ConfigProvider prefixCls="zgeo-ant">`.
  2. **8 Dedicated UI Modules:**
     * **Header & OverviewTab:** System vitals, crawler summaries, and quick toggles.
     * **GeoHealthTab:** Virtualized catalog health table, citability checks, and single-item manual optimization.
     * **GeoReadinessTab (formerly RankRadarTab):** Heuristic GEO Readiness Score with prominent disclaimer: *"Local structural estimate — not real-time AI engine output"*.
     * **CrawlerLogsTab:** Filterable live bot telemetry with manual log purge.
     * **SimulatorTab:** Interactive query matching simulation + live Prompt Guard adversarial tester.
     * **LlmsEngineTab:** Catalog stream preview, token calculator, and 1-click clipboard copy.
     * **SettingsTab:** Encrypted API key storage, safe rate limiting, and self-healing diagnostic checks.
  3. **WordPress.org Submission Preparation:**
     * Create clean `uninstall.php` using `WP_UNINSTALL_PLUGIN` constant check, cleaning `wp_zgeo_crawler_logs` and plugin options.
     * Write complete `readme.txt` with clear `== External Services ==` disclosures (manifest sync and optional Bing IndexNow API).
     * Verify all code against WordPress Coding Standards using `PHP_CodeSniffer` (WPCS) and `PHPStan` Level 8.
     * Run official **Plugin Check (PCP)** plugin — achieve zero errors and zero warnings.
     * Package submission zip with localized assets and submit to the official WordPress.org review queue.

* **Deliverable:** Production-grade plugin submitted to WordPress.org (8 tabs: Header + Overview + GeoHealth + GeoReadiness + CrawlerLogs + Simulator + LlmsEngine + Settings).

---

### Phase 3: Pro Tier Engine & Freemius Integration (Days 31–60)
* **Goal:** Activate commercial licensing and deploy high-scale Pro features.
* **Tasks:**
  1. **Freemius SDK Integration:**
     * Implement secure in-dashboard license activation and seamless automatic updates.
     * Place clear, non-intrusive upgrade hooks for Pro-exclusive capabilities.
  2. **Client BYOK Engine:**
     * Support OpenAI (`gpt-4o-mini`), Anthropic (`claude-3-5-haiku`), Google Gemini Flash, and OpenRouter.
     * Store credentials using AES-256 encryption via WordPress auth salts.
     * Implement client spend hard-caps ($5, $15, $50 monthly thresholds) with execution auto-pausing.
  3. **Action Scheduler Batch Worker:**
     * Implement background asynchronous bulk enrichment (batches of 25 products) with live progress tracking.
  4. **Hierarchical Sub-Feeds & 100k+ SKU Static Pre-compilation:**
     * Generate category-specific feeds (e.g., `/llms-audio.txt`, `/llms-apparel.txt`) pre-compiled via Action Scheduler background tasks into static cached endpoints (ETag 304), guaranteeing zero memory crashes on massive catalogs.
  5. **Bing IndexNow Integration (Disclosed):**
     * Automatically notify Bing of new product additions for accelerated search engine discovery.
  6. **Weekly ROI Email Digest:**
     * Hybrid attribution tracking combining clean UTM tags with HTTP `Referer` header detection (`chatgpt.com`, `perplexity.ai`, `claude.ai`) and WooCommerce order conversions sent via `wp_mail`.

* **Deliverable:** Monetization tier live with working billing, automated licensing, and bulk catalog processing.

---

### Phase 4: Growth, Agency Expansion & Scale (Days 61–90)
* **Goal:** Scale user base, onboard initial agency accounts, and reach 50–150 paying customers.
* **Tasks:**
  1. **Agency Tier Expansion:**
     * Support multisite networks (WPMU) and multi-language setups (WPML/Polylang).
     * Provide white-label email digest reporting for client accounts.
  2. **Free Online GEO Audit Tool:**
     * Deploy a lightweight web utility allowing merchants and agencies to check whether an external domain serves valid `/llms.txt` and schema.
  3. **Affiliate & Partner Program:**
     * Launch a 25–30% recurring partner program via Freemius.
  4. **Community & Public Launch:**
     * Execute ProductHunt launch highlighting verified problem-solving and honest technical capabilities.
     * Personalized outreach to 100–150 independent WooCommerce agencies with trial Agency licenses.

* **Deliverable:** Scalable customer acquisition funnel with initial recurring revenue.

---

## 4. Immediate Next Steps & Execution Milestones

| Milestone | Action Item | Target Delivery |
| :--- | :--- | :--- |
| **Milestone 1** | Customer validation chats in WooCommerce communities | Day 1–4 |
| **Milestone 2** | Finalize backend core (`LlmsTxtGenerator`, `SchemaBuilder`, `BotDetector`, `PromptSanitizer`) | Day 5–10 |
| **Milestone 3** | Connect React 19 UI tabs to live REST API endpoints | Day 11–18 |
| **Milestone 4** | Audit with Plugin Check (PCP) and submit to WordPress.org | Day 19–30 |
| **Milestone 5** | Integrate Freemius SDK and launch Pro tier features | Day 31–60 |

---

*Related Documentation:*
* [`BUSINESS_PLAN.md`](file:///d:/new-bussiness-plans/geo-engine-prototype/BUSINESS_PLAN.md) — Strategic business model and financial projections.
* [`master_plan_v2.md`](file:///d:/new-bussiness-plans/geo-engine-prototype/master_plan_v2.md) — Master consolidated reference document.
* [`implementation_plan.md`](file:///d:/new-bussiness-plans/geo-engine-prototype/implementation_plan.md) — Deep technical architecture and security specification.
