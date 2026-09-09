# Zoventic GEO — Complete Revised Master Plan (v2.0)
### Honest · Realistic · Actionable

> **Plugin:** `zoventic-geo` — *AI Search Optimization & llms.txt for WooCommerce*  
> **Revised:** September 2026 | **Status:** Ready for Execution

---

## অংশ ১: সত্যিকারের বাজার বিশ্লেষণ (Honest Market Reality)

### ১.১ আইডিয়াটা কি আসলেই ভালো?

**সংক্ষিপ্ত উত্তর: হ্যাঁ — কিন্তু শর্ত আছে।**

GEO (Generative Engine Optimization) একটি **বাস্তব, উদীয়মান সমস্যা।** ChatGPT Search, Perplexity, Claude — এই AI engine গুলো এখন web থেকে সরাসরি content পড়ে recommend করছে। একটি WooCommerce store-এর HTML page সাধারণত ১.৫–৪ MB bloated JavaScript দিয়ে ভরা — AI crawler এটা ঠিকমতো পড়তে পারে না। এখানে তোমার plugin-এর **সত্যিকারের** সুযোগ আছে।

**কিন্তু দুটো গুরুত্বপূর্ণ সত্য মেনে নিতে হবে:**

| সত্য | বিবরণ |
|---|---|
| **GEO এখনো নতুন** | বেশিরভাগ WooCommerce merchant এখনো জানে না GEO কী। তোমাকে market educate করতে হবে — এতে ৬–১২ মাস লাগবে। |
| **Competition আসবেই** | RankMath, Yoast বা WordPress core ১২–১৮ মাসের মধ্যে এই ফিচার যোগ করতে পারে। তোমার window আছে কিন্তু সেটা unlimited নয়। |

---

### ১.২ বাজারের আকার (Realistic TAM)

| প্ল্যাটফর্ম | সংখ্যা |
|---|---|
| WooCommerce active stores (global) | ~৭ মিলিয়ন+ |
| WordPress.org-এ paid plugin কেনা stores (ধারণাগত ১–২%) | ~৭০,০০০–১৪০,০০০ |
| GEO সম্পর্কে সচেতন merchants (early adopter) | ~১০,০০০–৩০,০০০ (ধীরে বাড়ছে) |

**তোমার realistic addressable market Year 1:** ১০,০০০–৩০,০০০ সচেতন store — এর মধ্যে ৩–৮% Pro কিনবে।

---

### ১.৩ প্রতিযোগিতামূলক বাস্তবতা

| প্রতিযোগী | শক্তি | দুর্বলতা | তোমার সুযোগ |
|---|---|---|---|
| **LovedByAI** (~900 installs) | First mover | Generic, WooCommerce-দুর্বল | WooCommerce-native depth |
| **AI Generative Optimizer** (~200 installs) | বিদ্যমান | Primitive, no real schema | Quality + honest claims |
| **RankMath/Yoast** | ৩M+ installs | Legacy codebase, slow to pivot | এখনই category leader হও |
| **WordPress/Automattic** | Core integration | ১–২ বছর দূরে | এখনই build করো |

**তোমার moat (দীর্ঘমেয়াদী সুবিধা):** WooCommerce-specific depth (product variants, stock, BYOK, bulk enrichment), community trust, এবং early brand recognition।

---

## অংশ ২: কী বাস্তব, কী হাইপ (Honest Feature Audit)

### ✅ বাস্তব — এখনই বানাও

| ফিচার | কেন বাস্তব |
|---|---|
| **Dynamic `/llms.txt` generator** | AI crawlers এটা পড়ে, standard growing, PHP-তে সরাসরি করা যায় (১,০০০+ বা ১০০k+ SKU-র জন্য Action Scheduler ব্যাকগ্রাউন্ড প্রি-কম্পাইলেশন ও ফাইল ক্যাশিং) |
| **JSON-LD Schema Enhancement** | WooCommerce schema দুর্বল, এটা improve করা technically straightforward |
| **AI Bot Crawler Logs** | `$_SERVER['HTTP_USER_AGENT']` পড়াই যথেষ্ট, DB-তে store — সহজ |
| **BYOK with Hard-Cap** | AES-256 + wp_options — feasible, genuinely useful |
| **GEO Health Score** | Heuristic scoring (description length, schema completeness, price, stock) — calculable |
| **Prompt Sanitizer (Prompt Guard™)** | regex + string filter — implemented, tested ✅ |
| **1-Click Direct-to-Cart Link** | Simple URL append — trivial |
| **Quality Gate** | Filter empty/broken products from feed — easy |
| **Action Scheduler Bulk** | WooCommerce-native, battle-tested |
| **WooCommerce 8.5+ Order Attribution Integration** | উকমার্সের নেটিভ `_wc_order_attribution_*` মেটা ডাটা সরাসরি কুয়েরি করে ChatGPT ও Perplexity অর্ডার এবং রেভিনিউ শনাক্তকরণ — কোনো থার্ড-পার্টি ওভারহেড নেই |
| **Weekly ROI Email Digest** | হাইব্রিড অ্যাট্রিবিউশন: উকমার্স নেটিভ Order Attribution + UTM + HTTP `Referer` হেডার ডিটেকশন + `wp_mail` — শতভাগ বাস্তবসম্মত |

---

### ❌ হাইপ — বাদ দাও বা সৎভাবে label করো

| দাবি | সত্য | কী করতে হবে |
|---|---|---|
| **"94% Citation Probability"** | LLM citation কোনো formula দিয়ে predict করা অসম্ভব | UI থেকে সম্পূর্ণ বাদ দাও |
| **"Daily Rank Radar across ChatGPT/Perplexity/Claude"** | এই platforms-এর rank tracking API নেই; non-deterministic | **"GEO Readiness Radar"** (Local Heuristic + BYOK Sandbox) হিসেবে rebrand করো; "Rank" শব্দ ব্যবহার করবে না যাতে মিথ্যা আশা তৈরি না হয় |
| **"60-second AI crawler আসবে IndexNow দিয়ে"** | IndexNow = Bing search engine ping, LLM retrain হয় না | "Bing fast-indexing ping" বলো, LLM mention করো না |
| **"Consensus Heatmap = Real AI data"** | কোনো platform cross-model citation data দেয় না | "Local simulation" clearly label করো |
| **"Cryptographic legal protection"** | একটা timestamp legal shield নয় | "Price stale notice" বলো |
| **"Multi-Store Switcher" (MVP-তে)** | Complex OAuth/API auth — MVP-তে দরকার নেই | Phase 4 বা তারপরে রাখো |

---

## অংশ ৩: সঠিক Free vs Pro বিভাজন

> **নীতি:** Free-তে "wow moment" দাও (plugin ইনস্টল করেই `/llms.txt` কাজ করে), কিন্তু scale করতে গেলে Pro লাগবে।

### মূল্য কাঠামো

| Tier | Monthly | Annual | সাশ্রয় |
|:---|:---:|:---:|:---:|
| **Free** | \$0 | \$0 | — |
| **Pro** | \$9/mo | \$89/yr | ~17% (২ মাস ফ্রি) |
| **Agency** | \$25/mo | \$249/yr | ~17% (২ মাস ফ্রি) |

> 💡 **কৌশল:** Monthly option রাখলে skeptical merchant সহজে trial করতে পারবে। বেশিরভাগ পরে annual-এ upgrade করবে — এতে churn কমে এবং LTV বাড়ে।

### ফিচার তুলনা

| ফিচার | Free (WP.org) | Pro — \$89/yr | Agency — \$249/yr |
|:---|:---:|:---:|:---:|
| Dynamic `/llms.txt` | ✅ ৫০ products | ✅ Unlimited (১০০k+ SKU ব্যাকগ্রাউন্ড প্রি-কম্পাইল্ড) | ✅ Unlimited |
| `/llms-full.txt` | ❌ | ✅ | ✅ |
| Hierarchical sub-feeds | ❌ | ✅ | ✅ |
| JSON-LD Schema | ✅ Basic | ✅ Advanced | ✅ |
| GEO Health Table | ✅ ২০ products | ✅ Full catalog | ✅ |
| 1-Click Product Optimize | ✅ Single | ✅ Bulk (Action Scheduler) | ✅ |
| BYOK AI Enrichment | ❌ | ✅ + Hard-cap | ✅ |
| Prompt Simulator (Local) | ✅ Simulation only | ✅ + Live BYOK API | ✅ |
| AI Crawler Logs | ✅ Last 50 | ✅ Unlimited + Export | ✅ |
| Bot Rate Limiter (HTTP 429) | ❌ | ✅ সহনশীল লিমিট (৬০+ req/min; FCrDNS ভেরিফায়েড বট বাইপাস) | ✅ |
| Weekly AI Revenue Email Digest | ❌ | ✅ হাইব্রিড UTM + Referer ট্র্যাকিং | ✅ Custom branding |
| Multisite (WPMU) | ❌ | ❌ | ✅ (25 sites) |
| Multi-Language (WPML/Polylang) | ❌ | ❌ | ✅ |
| Support | Community | Priority email | VIP 24/7 |

---

## অংশ ৪: বাস্তবসম্মত আর্থিক পরিকল্পনা

### ৪.১ Unit Economics

| Item | বিবরণ |
|---|---|
| **COGS (Free users)** | \$0 — plugin runs on merchant's server |
| **COGS (Pro users)** | ~\$0.08/user/month (Cloudflare Workers for manifest sync) |
| **Gross Margin** | ~94–96% |
| **Payment processor** | Freemius/LemonSqueezy — ~5% fee |
| **Net Margin (mature)** | ~85–89% |

---

### ৪.২ সংশোধিত আর্থিক প্রজেকশন

> **ধারণা:** Solo developer, WordPress.org organic growth, moderate content marketing।

#### Conservative Scenario

| Metric | Year 1 | Year 2 | Year 3 |
|:---|---:|---:|---:|
| Free Active Installs | 2,000 | 12,000 | 45,000 |
| Pro Users (\$89/yr) | 80 | 480 | 1,800 |
| Agency Users (\$249/yr) | 15 | 90 | 350 |
| **Gross Revenue** | **\$10,855** | **\$65,030** | **\$247,350** |
| Net (after ~15% fees) | **\$9,227** | **\$55,276** | **\$210,248** |

#### Realistic/Optimistic Scenario (content marketing + agency outreach)

| Metric | Year 1 | Year 2 | Year 3 |
|:---|---:|---:|---:|
| Free Active Installs | 5,000 | 30,000 | 100,000 |
| Pro Users (\$89/yr) | 200 | 1,200 | 4,500 |
| Agency Users (\$249/yr) | 40 | 220 | 850 |
| **Gross Revenue** | **\$27,760** | **\$161,580** | **\$612,750** |
| Net (after fees) | **\$23,596** | **\$137,343** | **\$520,838** |

> ⚠️ **Original plan-এর Year 1 \$87K projection বাদ দাওয়া হয়েছে।** Paid ads বা ভাইরাল launch ছাড়া সেটা realistic নয়।

### ৪.৩ Break-even

- **মাত্র ১২–১৫ Pro user** (\$89×12) hosting + domain cover করবে।
- **১০০ Pro user** = \$8,900/yr — বাংলাদেশে comfortable।
- **৫০০ Pro user** = \$44,500/yr — excellent।
- **Year 1 লক্ষ্য:** ১০০+ Pro user।

---

## অংশ ৫: Go-To-Market কৌশল

### Phase 1: WordPress.org Flywheel (Month 1–3)
**লক্ষ্য:** প্রথম ১,০০০ free install এবং ৩০+ Pro user।

1. **WordPress.org listing optimize** — keyword: "GEO", "llms.txt", "ChatGPT WooCommerce"
2. **Reddit presence** — r/woocommerce, r/SEO, r/Wordpress — value দাও, sell করো না
3. **YouTube demo** — "How to make your WooCommerce store visible in ChatGPT Search"
4. **ProductHunt launch** — polished GIF + "before/after" screenshot

### Phase 2: Agency Partner Program (Month 3–6)
**লক্ষ্য:** ৫০ agency partnership → agency tier sales।

1. **Free "GEO Audit" landing page** — domain input → GEO readiness score → upgrade CTA
2. **Top 150 WooCommerce agencies outreach** — free 3-month agency license offer
3. **Affiliate program** — Freemius 30% recurring commission

### Phase 3: Content & Thought Leadership (Month 6–12)
**লক্ষ্য:** Category expert হওয়া।

1. **Benchmark report** — "How Top 100 WooCommerce Stores Perform in AI Search" (email-gated PDF)
2. **Real case study** — একটা store-এ plugin দিয়ে traffic change দেখাও
3. **Weekly LinkedIn post** — GEO tips, AI search commentary

---

## অংশ ৬: সংশোধিত Execution Timeline (90 Days)

```
Phase 1: MVP Core (Days 1–14)    → Working plugin, WP.org ready
Phase 2: Full UI + Submit (Days 15–30) → All 7 tabs, submitted to WP.org
Phase 3: Pro Features (Days 31–60) → Freemius live, paying customers
Phase 4: Growth (Days 61–90)      → 50–150 Pro users, agency channel
```

---

### Phase 1: MVP Core Engine — Days 1–14

| Task | সময় |
|---|---|
| Plugin scaffold (PSR-4, main file, activator/deactivator) | Day 1–2 |
| DB migration (`wp_zgeo_crawler_logs` table, rewrite rules) | Day 2–3 |
| `LlmsTxtGenerator.php` (dynamic rewrite, ETag 304, fallback) | Day 4–7 |
| `SchemaBuilder.php` (JSON-LD Product + Offer + AggregateRating) | Day 6–9 |
| `BotDetector.php` (UA detect, async cached FCrDNS, shutdown hook) | Day 8–11 |
| `RestController.php` (all REST endpoints) | Day 10–13 |
| Basic React UI (Header + Overview + Settings) | Day 11–14 |

**✅ Deliverable:** Plugin installs, generates `/llms.txt`, logs bots, basic dashboard works.

---

### Phase 2: Full UI + WP.org Submission — Days 15–30

| Task | সময় |
|---|---|
| GeoHealthTab (virtual table, scoring, 1-click optimize) | Day 15–19 |
| GeoReadinessTab (সাবেক RankRadar) (GEO Readiness Radar — local heuristic, clearly labeled simulation) | Day 16–20 |
| CrawlerLogsTab (live log, filter, purge) | Day 17–20 |
| SimulatorTab (local simulation + Prompt Guard sandbox) | Day 19–22 |
| LlmsEngineTab (feed selector, preview, token counter) | Day 20–23 |
| SettingsTab (encrypted API key vault, diagnostics) | Day 22–25 |
| `uninstall.php` (complete data cleanup) | Day 25 |
| `readme.txt` (WP.org metadata + **External Services disclosure**) | Day 26–27 |
| Plugin Check (PCP) — zero warnings | Day 27–28 |
| PHP_CodeSniffer (WPCS) — zero errors | Day 28–29 |
| **WordPress.org Submit** | Day 30 |

**✅ Deliverable:** Plugin submitted to WordPress.org (৮টি ট্যাব: Header + Overview + GeoHealth + GeoReadiness + CrawlerLogs + Simulator + LlmsEngine + Settings).

---

### Phase 3: Pro Features — Days 31–60

| Task | সময় |
|---|---|
| Freemius SDK integration (in-dashboard license, upgrade prompts) | Day 31–35 |
| Pro feature gates (code-level free/pro checks) | Day 35–37 |
| BYOK AI Enrichment (key validation, cost estimator, Action Scheduler) | Day 37–45 |
| Bulk Optimize (25/batch, progress bar, dirty-flag) | Day 43–50 |
| Hierarchical sub-feeds (`/llms-[category].txt`) | Day 48–53 |
| IndexNow Pinger (Bing ping on product publish — disclosed) | Day 50–54 |
| BotManifestSync (weekly remote manifest — disclosed) | Day 52–56 |
| Weekly Email Digest (হাইব্রিড UTM + HTTP Referer + WooCommerce অর্ডার ডাটা → wp_mail) | Day 55–60 |

**✅ Deliverable:** Pro tier live, first paying customers.

---

### Phase 4: Growth & Scale — Days 61–90

| Task | সময় |
|---|---|
| Agency tier (multisite, white-label, 25-site license) | Day 61–70 |
| Free "GEO Audit" landing page | Day 65–72 |
| Affiliate program setup (Freemius 30% recurring) | Day 70–75 |
| ProductHunt launch | Day 75–80 |
| Agency outreach (150 agencies, personalized email) | Day 78–90 |

**✅ Deliverable:** Growth engine running, 50–150 Pro users by Day 90.

---

## অংশ ৭: টেকনিক্যাল আর্কিটেকচার (Corrected)

### সিস্টেম আর্কিটেকচার

```
[ WooCommerce Store ]
        │
        ├── ON-PREMISES ENGINE (zero latency, 100% local)
        │       ├── Core/Plugin.php       → Singleton lifecycle manager
        │       ├── Core/Activator.php    → DB migration, rewrite flush
        │       ├── Core/Deactivator.php  → Cron cleanup, rewrite flush
        │       ├── LlmsTxtGenerator.php  → /llms.txt + /llms-full.txt (১০০k+ SKU: Action Scheduler ব্যাকগ্রাউন্ড প্রি-কম্পাইলেশন ও স্ট্যাটিক ক্যাশিং) + ETag 304
        │       ├── SchemaBuilder.php     → Enhanced JSON-LD
        │       ├── BotDetector.php       → UA sniff + async FCrDNS (1hr transient cache; verified bots bypass rate-limit)
        │       ├── PromptSanitizer.php   → Injection defense ✅ DONE
        │       └── RestController.php    → /wp-json/zoventic-geo/v1/*
        │
        ├── BYOK ENGINE (merchant's own key — Pro only)
        │       ├── OpenAI / Anthropic / Gemini / DeepSeek / OpenRouter
        │       ├── Hard-cap guardrails ($5/$15/$50/month)
        │       └── Action Scheduler batch (25 products/batch)
        │
        └── OPTIONAL CLOUD (minimal, fully disclosed in readme.txt)
                ├── Bot Manifest Sync → manifest.zoventic.com (weekly GET, no data sent)
                └── IndexNow Ping → indexnow.org (Bing search engine ONLY, not LLM)
```

### সংশোধিত "GEO Readiness Radar" (সাবেক "Rank Radar" — Honest Version)

```
GEO Readiness Radar (NOT SERP Rank Tracking)
│
├── Free — Local Heuristic Engine:
│   ├── Keyword coverage (product description vs query)
│   ├── Schema completeness score
│   ├── Token density score
│   └── "Citability Score: 73/100"
│   └── ⚠️ Disclaimer: "Local estimate — not real AI output"
│
└── Pro — Live API Sandbox (BYOK):
    ├── Merchant's own OpenAI/Claude key
    ├── Sends product + query → real AI response
    └── ⚠️ Disclaimer: "Uses your API credits"
```

---

## অংশ ৮: ঝুঁকি ম্যাট্রিক্স

| ঝুঁকি | সম্ভাবনা | প্রভাব | মোকাবেলা |
|---|---|---|---|
| WordPress.org rejection | মধ্যম | উচ্চ | External service disclosure + PCP zero warnings |
| RankMath GEO feature (১–২ বছরে) | উচ্চ | উচ্চ | Community + brand build এখনই; WooCommerce depth |
| LLM API/crawling changes | উচ্চ | মধ্যম | Open standards (llms.txt, JSON-LD) — platform-agnostic |
| Slow initial adoption | উচ্চ | মধ্যম | Agency channel — ১ agency = ১০–৫০ sites |
| BYOK cost confusion | মধ্যম | মধ্যম | Default \$5 hard-cap, clear UI |
| Fake metrics backlash | উচ্চ (যদি রাখো) | উচ্চ | **সম্পূর্ণ বাদ দাও** |
| Bot Rate Limiter CDN Bypass বা AI Bot Block | নিম্ন | মধ্যম | FCrDNS ভেরিফায়েড আসল বটদের (GPTBot) বাইপাস করা; রেট লিমিট শুধুমাত্র আনভেরিফায়েড অ্যাগ্রেসিভ স্ক্র্যাপারদের জন্য (৬০+ req/min); এজ ক্যাশ থাকলে ক্যাশ রেসপন্সে সার্ভার চাপ এমনিতেই শূন্য |

---

## অংশ ৯: WordPress.org Compliance Checklist

- [ ] `readme.txt` — `Stable tag`, `Tested up to`, `Requires at least`, `Requires PHP`
- [ ] `readme.txt` — `== External Services ==` section সব external call disclosed
- [ ] `uninstall.php` — `WP_UNINSTALL_PLUGIN` check + সব data cleanup
- [ ] সব function prefix: `zgeo_*`
- [ ] সব class: `Zoventic\Geo\*`
- [ ] সব options: `zoventic_geo_*`
- [ ] No remote CDN — সব locally bundled
- [ ] GPL-2.0+ compatible — React ✅, AntD ✅, Zustand ✅
- [ ] Plugin Check (PCP) — zero errors
- [ ] PHP_CodeSniffer (WPCS) — zero errors
- [ ] PHPStan Level 8 — zero errors
- [ ] IP logging → Privacy Policy link mandatory

---

## অংশ ১০: UI-তে বাধ্যতামূলক Disclosure Text

```
[Simulator Tab]
"This readiness score is a local estimate based on your store's data
structure. It does not represent actual output from ChatGPT, Perplexity,
Claude, or any AI engine. AI responses are non-deterministic."

[Overview → IndexNow]
"IndexNow notifies Bing's search engine index only. It does not update
ChatGPT or LLM training data, which retrain on their own schedule."

[Settings → Bot Manifest]
"This plugin fetches the latest AI crawler list from manifest.zoventic.com
(read-only GET, no personal data sent). See our Privacy Policy."
```

---

## সারসংক্ষেপ: তোমার ৩ লাইনের স্ট্র্যাটেজি

```
১. ৩০ দিনে MVP → WordPress.org-এ দাও → free install শুরু হোক।
২. ৬০ দিনে Pro চালু → Freemius → প্রথম $1,000 revenue।
৩. ৯০ দিনে agency channel → 100+ Pro user → stable business।
```

> **এটা AI hype নয় — একটা real problem-এর real solution।  
> সৎ থাকো, ধীরে বানাও, community তৈরি করো।  
> তাহলে বিজনেস হবে।**

---

*Zoventic GEO Master Plan v2.0 — Revised September 2026*
