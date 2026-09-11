# WooCommerce AI Commerce — সম্পূর্ণ ব্যবসা পরিকল্পনা

> **তৈরি:** ১০ সেপ্টেম্বর ২০২৬
> **অবস্থা:** যাচাইয়ের আগের খসড়া (pre-validation draft)
> **আত্মবিশ্বাস:** ~৭০% (ডেস্ক গবেষণাভিত্তিক, merchant-এর সাথে কথা বলা হয়নি)

---

## ০. এক পাতায় সারাংশ

| | |
|---|---|
| **পণ্য** | WooCommerce plugin — দোকানকে AI shopping-এর জন্য প্রস্তুত করা + বিক্রি প্রমাণ করা |
| **সমস্যা** | Shopify-র ৫৬ লাখ store ChatGPT-তে default-এ আছে। WooCommerce-এর ৪১ লাখ **নেই** |
| **customer** | WooCommerce দোকানদার + GEO service দেওয়া freelancer/agency |
| **বাজার** | USA প্রধান, সাথে UK / Canada / Australia |
| **দাম** | Free tier + Pro $৩৯/মাস + Agency $৯৯/মাস |
| **লক্ষ্য** | ১৮ মাসে ১০০ paying customer ≈ $৩,৯০০/মাস |
| **break-even** | ~$৩,০০০/মাস (বাংলাদেশে খরচের ভিত্তিতে) |
| **প্রথম ধাপ** | ২ সপ্তাহের যাচাই — কোড নয় |

**এক বাক্যে:**
> WooCommerce দোকান ChatGPT-তে বিক্রি করছে কি না — দেখাও, ঠিক করো, প্রমাণ দাও।

---

## ১. সুযোগ কেন আছে

### ১.১ কাঠামোগত ফাঁক

মার্চ ২০২৬-এ Shopify Google-এর সাথে মিলে UCP বানিয়েছে। ফলাফল:

| | Shopify | WooCommerce |
|---|---|---|
| ChatGPT-তে দৃশ্যমান | **স্বয়ংক্রিয়, default** | **না** |
| store সংখ্যা | ৫৬ লাখ চালু | ৪১ লাখ বাইরে |
| ৬টা কারিগরি শর্ত | ৬/৬ স্বয়ংক্রিয় | **০/৬** |
| merchant যাচাই | Shopify করে দেয় | নিজে OpenAI-এর allow-list-এ আবেদন |

Etsy চালু। PayPal-এর ACP আরও কোটি খানেক ছোট ব্যবসা আনছে। **WooCommerce বাদ।**

### ১.২ যে ৬টা স্তর প্রতিটা Woo store-কে নিজে বানাতে হয়

1. Google Merchant Center feed + AI attribute (product Q&A, compatible accessories, substitutes)
2. Free shopping listing — হাতে চালু করতে হয়
3. পূর্ণ Product JSON-LD (GTIN, ওজন, মাপ, material, AggregateRating)
4. Server-side conversion tracking
5. AI crawler config (robots.txt)
6. UCP-সঙ্গতিপূর্ণ checkout API

**সময় লাগে: "কয়েক সপ্তাহ।" সাধারণ দোকানদার একটাও পারবে না।**

### ১.৩ WooCommerce নিজে এটা করছে না — যাচাই করা

official developer doc, roadmap আর 10.9 release note — তিনটাই আলাদা করে দেখা হয়েছে:

| বিষয় | roadmap-এ আছে? |
|---|---|
| MCP (admin-এর জন্য) | ✅ beta |
| Product feed | ❌ **নেই** |
| AI discoverability | ❌ **নেই** |
| ACP / UCP | ❌ **নেই** |

**গুরুত্বপূর্ণ:** WooCommerce MCP **দোকানদারের জন্য** (Claude দিয়ে product update), **ক্রেতার জন্য নয়**। doc-এ সরাসরি লেখা: *"এটা ChatGPT-র মতো public AI assistant-এর জন্য product discovery টুল নয়।"* Admin password লাগে।

তাদের দর্শন: *"extensibility আর open source ethos"* — ভিত্তি তারা দেবে, উপরে extension developer-রা বানাবে।

**অর্থাৎ তারা প্রতিযোগী নয় — আমন্ত্রণ।**

Stripe ACP নিয়ে অক্টোবর ২০২৫-এ বলেছিল "কাজ শুরু হয়েছে"। ৮ মাস পরে 10.9-এ কিছুই আসেনি।

### ১.৪ প্রতিযোগীরা দুর্বল

| Plugin | Install | ফাঁক |
|---|---|---|
| CTX Feed | ৮০,০০০+ | AI attribute নেই |
| Google for WooCommerce | ৮ লাখ+ | Google feed, AI attribute নেই |
| Pixel Manager | ৪০,০০০+ | tracking, feed নেই |
| WebToffee Feed | বড় | সদ্য OpenAI feed যোগ করেছে ⚠️ |
| **Ovena ACP + ChatGPT Feed** | **২০+** | ডেডিকেটেড, প্রায় শূন্য traction |
| xPay Agentic Commerce | নতুন | "early-stage, protocol-এর অংশমাত্র" |

**কেউই AI-নির্দিষ্ট attribute (Q&A, accessories, substitutes) দিচ্ছে না। কেউই attribution দিচ্ছে না।**

### ১.৫ চাহিদার মাঠপর্যায়ের প্রমাণ

- **Upwork** — "GEO Expert" ৩০+ ঘণ্টা/সপ্তাহ, contract-to-hire; brand-রা নিয়োগ দিচ্ছে
- **Fiverr** — GEO-র আলাদা category (Fiverr search volume ছাড়া category বানায় না)
- **দাম** — অভিজ্ঞ $৩০–৪৫/ঘণ্টা, পূর্ণ program $৫০০–৩,০০০
- **Shopify Community** — merchant নিজে AEO/GEO কৌশল জিজ্ঞেস করছে
- **WordPress forum** — ব্যবহারকারী llms.txt নিয়ে প্রশ্ন করছে, plugin author নিজে **SEMrush-এ পাঠাচ্ছে** কারণ তার measurement নেই

### ১.৬ সময়ের জানালা

> OpenAI-র Merchant Portal স্বাধীন merchant-দের জন্য **early access-এ**, ধাপে ধাপে ছাড়া হচ্ছে। ইউরোপে পূর্ণ প্রাপ্যতা ২০২৬-এর শেষে।

**দরজা এখন খুলছে। জানালা আনুমানিক ১২–১৮ মাস।**

---

## ২. পণ্যের সংজ্ঞা

### ২.১ যা বানাবেন না ❌

| জিনিস | কেন না |
|---|---|
| generic "GEO plugin" | শব্দ বিষাক্ত, ২০ প্রতিযোগী |
| **llms.txt generator** | Google বলেছে কাজ করে না। **৯৭% ফাইল কখনো fetch হয়নি।** citation প্রভাব শূন্য |
| আরেকটা visibility dashboard | ৬০+ SaaS আছে, $১০ tier আছে |
| শুধু feed generator | commodity হয়ে যাবে ১৮ মাসে |

### ২.২ যা বানাবেন ✅

তিন স্তর, একই plugin-এ:

```
স্তর ১ — AUDIT (ফ্রি, wp.org-এ ঢোকার টোপ)
স্তর ২ — FIX   (Pro-র অর্ধেক মূল্য)
স্তর ৩ — PROOF (Pro-র আসল মূল্য, churn-এর ওষুধ)
```

### ২.৩ Feature তালিকা

#### 🆓 FREE (wp.org)

**AI Readiness Audit — স্কোর ০–১০০**

| যাচাই | কী দেখে |
|---|---|
| Product schema | GTIN, brand, ওজন, মাপ, material, AggregateRating আছে কি না |
| AI crawler access | robots.txt-এ OAI-SearchBot, PerplexityBot, ClaudeBot, GPTBot ব্লক কি না |
| Merchant Center feed | feed আছে কি না, কতটা পূর্ণ |
| Product data | description দৈর্ঘ্য, ছবি সংখ্যা, attribute |
| Q&A উপস্থিতি | product page-এ প্রশ্নোত্তর আছে কি না |
| AI referral tracking | বসানো আছে কি না |

**+ এক ক্লিকে fix** — schema সম্পূর্ণ করা, robots.txt ঠিক করা
**+ AI crawler visit log** — কোন bot কোন product দেখেছে

**কেন ফ্রি:** wp.org search থেকে install আসবে। audit ভয় তৈরি করে → upgrade।

#### 💰 PRO — $৩৯/মাস

| Feature | কেন গুরুত্বপূর্ণ |
|---|---|
| **AI attribute generation** ⭐ | product Q&A, compatible accessories, substitutes — LLM দিয়ে auto। **কেউ দিচ্ছে না** |
| **OpenAI-spec product feed** | CSV/TSV/XML/JSON, HTTPS endpoint, ১৫ মিনিটে refresh |
| **AI referral attribution** ⭐⭐ | "ChatGPT থেকে ৭টা order, ৳৪২,০০০ এ মাসে" |
| Weekly prompt tracking | ৫০টা prompt, ৪টা model — আপনার product আসে কি না |
| প্রতিযোগী তুলনা | কে আসছে আপনার বদলে |

#### 🏢 AGENCY — $৯৯/মাস

- ১০টা site
- White-label PDF report
- একক dashboard

### ২.৪ আসল moat — কেন এটা টিকবে

```
commodity হয়ে যাবে  →  feed, schema, robots.txt
                        (CTX Feed, WebToffee, শেষে WooCommerce)

কেউ দেবে না         →  "গত মাসে ChatGPT থেকে কত টাকা এলো"
                        ↑ এটাই পণ্য
```

**কারণ:**
- WooCommerce protocol support ফ্রি করলেও **attribution দেবে না**
- feed plugin-রা feed বানায়, **বিক্রি প্রমাণ করে না**
- দোকানদার citation বোঝে না — **টাকা বোঝে**
- টাকা দেখলে **cancel করে না** → churn-এর সমাধান

---

## ৩. ধাপ ০ — যাচাই (২ সপ্তাহ, খরচ ~৳০)

> **⚠️ এই ধাপ বাদ দেবেন না। কোড লেখার আগে এটাই সবচেয়ে জরুরি কাজ।**

### ৩.১ সপ্তাহ ১ — মানুষ চায় কি না

**দিন ১–২: Landing page**

একটা পাতা। পণ্য নেই। শুধু প্রতিশ্রুতি + email box।

**Headline:**
> **Shopify stores are selling inside ChatGPT. Is yours?**

**Sub:**
> 5.6 million Shopify stores became discoverable in ChatGPT automatically in March 2026.
> WooCommerce stores did not. Not one.
> Find out where your store stands — free scan, 60 seconds.

**Body — ৩টা bullet:**
> ✓ See exactly which of the 6 AI-readiness layers your store is missing
> ✓ Fix product schema and AI crawler access in one click
> ✓ Track how many orders actually came from ChatGPT, Perplexity and Claude

**CTA:** `Get early access — free scan` → email box

**Pre-order box (সপ্তাহ ২-এ যোগ করবেন):**
> Founding member — $29/mo, first 3 months half price. Cancel anytime.

**Tool:** Carrd / Framer / সাধারণ HTML। **WordPress লাগবে না।**

**দিন ৩–৭: প্রচার**

| কোথায় | কী করবেন |
|---|---|
| WooCommerce Facebook group | প্রশ্ন হিসেবে পোস্ট, বিজ্ঞাপন নয় |
| r/woocommerce, r/ecommerce, r/SEO | একই |
| Indie Hackers | build-in-public পোস্ট |
| WordPress Facebook group | একই |
| **Fiverr/Upwork-এর GEO seller-দের** ⭐ | সরাসরি message — এরাই সেরা লক্ষ্য |

**পোস্টের ভাষা (বিজ্ঞাপন নয়, প্রশ্ন):**
> Did anyone here check whether your WooCommerce products show up in ChatGPT shopping?
> Shopify stores got included automatically in March. Woo stores didn't — you have to build the feed, schema, crawler access and Merchant Center setup yourself.
> Curious how many of you have actually done it, or whether it's even on your radar.

### ৩.২ ২০টা outreach message

**A) WooCommerce দোকানদারকে (১০টা):**
> Hi — quick question, not selling anything.
> You run a WooCommerce store. Have you checked whether your products appear when someone asks ChatGPT for a product recommendation in your category?
> Shopify stores got that automatically in March 2026. Woo stores didn't.
> I'm researching whether store owners even know about this gap. Two questions if you have a minute:
> 1. Were you aware of it?
> 2. If a tool showed you exactly what's missing and fixed it, would that be worth paying for?

**B) Fiverr/Upwork-এর GEO seller-কে (১০টা) ⭐:**
> Hi — I saw your GEO/AEO gig. Not a client, doing product research.
> When you deliver an AI visibility project for a WooCommerce client, what tools do you use to build the report? How long does the manual part take you?
> I'm looking at building something that automates the WooCommerce side. Would love to know what's painful in your current workflow.

**কেন B বেশি মূল্যবান:** এদের **আয় ইতিমধ্যে আসছে** ($৫০০–৩,০০০/gig)। $৩৯/মাস এদের কাছে কিছুই না। আর এরা প্রতিটা client-এ ব্যবহার করবে।

### ৩.৩ সপ্তাহ ২ — টাকা দেবে কি না

Landing page-এ pre-order বসান। **$২৯, প্রথম ৩ মাস অর্ধেক দাম।** Stripe/Paddle payment link যথেষ্ট।

### ৩.৪ সিদ্ধান্তের মাপকাঠি

| ফল | সিদ্ধান্ত |
|---|---|
| ১০০+ email **এবং** ৫+ pre-order | 🟢 **বানান** — আত্মবিশ্বাস ৭০% → ৯০% |
| ৩০–১০০ email, ০ pre-order | 🟡 আগ্রহ আছে, টাকা নেই — বার্তা বদলে আবার |
| ৩০-এর কম email | 🔴 **থামুন।** ২ সপ্তাহ গেল, ৬ মাস বাঁচল |

**যা লক্ষ্য করবেন:** কতজন বলে *"আমি জানতামই না"* — সেটাই বাজারের আকার।

---

## ৪. ধাপ ১ — MVP (৬–৮ সপ্তাহ)

### ৪.১ v1-এ শুধু এইটুকু

```
✅ Audit engine — ৬ স্তরের যাচাই, স্কোর
✅ One-click fix — schema + robots.txt
✅ AI crawler log
✅ Feed generator — OpenAI spec
✅ Attribution tracking — order → AI referrer
✅ Freemius licensing

❌ prompt tracking      → v1.1
❌ attribute generation → v1.1 (LLM খরচ, পরে)
❌ agency dashboard     → v2
❌ white-label report   → v2
```

**নিয়ম: যা যাচাইয়ে প্রমাণিত হয়নি, v1-এ ঢোকাবেন না।**

### ৪.২ কারিগরি স্থাপত্য

```
┌─────────────────────────────────────┐
│  WordPress Plugin (PHP)             │
│  ├── Audit engine (স্থানীয়, API নেই) │
│  ├── Schema writer                  │
│  ├── robots.txt manager             │
│  ├── Feed generator + endpoint      │
│  └── Order tracker (server-side)    │
└──────────────┬──────────────────────┘
               │ HTTPS (শুধু Pro)
┌──────────────▼──────────────────────┐
│  Backend (Node বা Python)           │
│  ├── LLM attribute generation       │
│  ├── Prompt tracking scheduler      │
│  ├── Aggregation + reporting        │
│  └── Postgres / SQLite              │
└─────────────────────────────────────┘
```

**গুরুত্বপূর্ণ সিদ্ধান্ত:**

| বিষয় | সিদ্ধান্ত | কেন |
|---|---|---|
| Audit কোথায় চলবে | **স্থানীয়, plugin-এর ভেতরে** | wp.org নিয়ম সহজ হয়, ফ্রি tier-এ খরচ শূন্য |
| Attribution | **server-side hook** | ChatGPT referrer ব্রাউজারে হারায় |
| Prompt polling | **সাপ্তাহিক, দৈনিক নয়** | খরচ ২০ গুণ কমে |
| Model | **সস্তা tier (Haiku শ্রেণির)** | attribute generation-এ যথেষ্ট |
| একই prompt একাধিক customer-এর | **ফল ভাগাভাগি করুন** ⭐ | খরচ কমে, আর নিজস্ব dataset তৈরি হয় — দীর্ঘমেয়াদি moat |

### ৪.৩ Attribution কীভাবে কাজ করবে

```
১. Order তৈরি হলে WooCommerce hook ধরুন
২. session থেকে সংরক্ষণ করুন: referrer, landing page, UTM
৩. referrer মেলান AI উৎসের তালিকার সাথে:
   chatgpt.com, chat.openai.com, perplexity.ai,
   claude.ai, gemini.google.com, copilot.microsoft.com
৪. referrer না থাকলে fallback: প্রথম visit-এ landing page +
   কোনো search engine referrer নেই + AI crawler ওই page দেখেছিল
৫. order-এ meta হিসেবে জমা করুন
৬. রিপোর্ট: "এ মাসে AI থেকে X order, ৳Y"
```

**সততা জরুরি:** ১০০% নির্ভুল হবে না। রিপোর্টে লিখুন *"attributed"*, *"exact"* নয়। ভুল দাবি করলে বিশ্বাস হারাবেন।

---

## ৫. ধাপ ২ — Launch

### ৫.১ WordPress.org-এর নিয়ম ⚠️

**আপনার পুরো distribution এটার উপর। নিয়ম ভাঙলে plugin মুছে যাবে।**

| নিয়ম | করণীয় |
|---|---|
| **External API disclosure** | readme-তে স্পষ্ট: কোন server, কী data, কেন। লুকালে ban |
| **"Phoning home" নিষিদ্ধ** | অনুমতি ছাড়া কোনো data পাঠাবেন না |
| **GPL-সঙ্গতিপূর্ণ** | plugin-এর কোড GPL হতে হবে |
| **Upsell spam নিষিদ্ধ** | admin জুড়ে বিজ্ঞাপন নয়। এক জায়গায় সীমিত |
| **readme.txt** | সঠিক format, tag, screenshot |
| **⏰ Review queue** | **২–৬ সপ্তাহ।** পরিকল্পনায় ধরে রাখুন |

### ৫.২ Payment — বাংলাদেশ থেকে

**Stripe বাংলাদেশে নেই।** আগেই সমাধান করুন।

| উপায় | কাটে | মন্তব্য |
|---|---|---|
| **Freemius** ⭐ | ~৭% | WP plugin-এর জন্যই বানানো — license, update, payment, tax একসাথে |
| Paddle | ~৫% | Merchant of Record, VAT সামলায় |
| Lemon Squeezy | ~৫% | সহজ MoR |
| US LLC + Stripe | কম | ঝামেলা, পরে |

**সুপারিশ: Freemius দিয়ে শুরু।** licensing নিজে বানাতে ২ মাস চলে যাবে।

*(শুরুর আগে current payout নীতি যাচাই করে নেবেন।)*

### ৫.৩ আইনি

- **Privacy policy** — কী data সংগ্রহ, কোথায় যায়
- **GDPR** — EU-র ক্রেতা থাকলে প্রযোজ্য। order data সংবেদনশীল
- **DPA** — Pro customer-দের জন্য data processing agreement
- **Terms** — কোনো ranking/citation-এর নিশ্চয়তা দেবেন না

---

## ৬. দাম ও অর্থনীতি

### ৬.১ দামের স্তর

| Tier | দাম | কী পাবে |
|---|---|---|
| **Free** | $০ | Audit, one-click fix, crawler log |
| **Pro** | **$৩৯/মাস** বা $২৯০/বছর | + attribute, feed, attribution, tracking |
| **Agency** | **$৯৯/মাস** | ১০ site, white-label report |

**$১০–২০-এ নামবেন না।** ওখানে তলা নেই, আর ওই customer সবচেয়ে বেশি support চায়।

### ৬.২ খরচের হিসাব (প্রতি customer/মাস)

```
Prompt tracking  ৫০ prompt × ৪ model × সাপ্তাহিক = ৮০০ call   ≈ $১.০০
Attribute gen    একবারের কাজ, ৫০০ product                    ≈ $০.৫০
Hosting + DB     ভাগ করে                                     ≈ $১.০০
Freemius ৭%                                                  ≈ $২.৭০
─────────────────────────────────────────────────────────────────────
মোট                                                          ≈ $৫.২০
$৩৯ দামে margin                                              ≈ ৮৭%
```

### ৬.৩ আয়ের ধাপ

| paying customer | মাসিক আয় | অবস্থা |
|---|---|---|
| ২৫ | $৯৭৫ | প্রথম সংকেত |
| ৫০ | $১,৯৫০ | চলছে |
| **১০০** | **$৩,৯০০** | **break-even পার** |
| ২৫০ | $৯,৭৫০ | ভালো ব্যবসা |
| ৫০০ | $১৯,৫০০ | টিম নেওয়ার সময় |

### ৬.৪ Free → Paid রূপান্তর

বাস্তবসম্মত ধরে নিন **২–৪%**।

```
১০০ paying পেতে দরকার  →  ~৩,৩০০ free install
wp.org-এ ভালো plugin    →  ১২–১৮ মাসে সম্ভব
```

---

## ৭. Go-to-market

### ৭.১ ক্রম

```
১. wp.org (প্রধান)      → ফ্রি tier, organic search
২. GEO freelancer ⭐     → Fiverr/Upwork seller-দের সরাসরি
৩. Content              → "WooCommerce vs Shopify AI shopping" — SEO
৪. WooCommerce group    → সাহায্য করুন, বিজ্ঞাপন নয়
৫. Agency               → পরে, v2-তে
```

### ৭.২ বার্তা (এটাই কেন্দ্র)

**✅ বলবেন:**
> WooCommerce gave you MCP — you can manage your store with Claude.
> But when your **customer** asks ChatGPT for a product, whether you show up is a different problem. And nobody owns it yet.

**❌ বলবেন না:**
- "WooCommerce কিছু করছে না" — মিথ্যা, technical merchant ধরে ফেলবে
- "আমরা citation নিশ্চিত করি" — কেউ পারে না
- "llms.txt লাগবে" — প্রমাণিত অকেজো

### ৭.৩ লক্ষ্য বাজার

| দেশ | অগ্রাধিকার | কারণ |
|---|---|---|
| 🇺🇸 USA | **প্রধান** | সবচেয়ে বড়, ৩.৬ লাখ SEO consultant |
| 🇨🇦 Canada | **দ্বিতীয়** ⭐ | মাথাপিছু US-এর চেয়ে **বেশি** AI adoption, কম প্রতিযোগিতা |
| 🇬🇧 UK | তৃতীয় | agency ঘন |
| 🇦🇺 Australia | চতুর্থ | ছোট, এমনিতেই আসবে |

দাম **USD**-তে, UI **ইংরেজিতে**। বাংলা/আঞ্চলিক ভাষা **v2-এর feature, v1-এর ব্যবসা নয়**।

---

## ৮. ঝুঁকি ও থামার শর্ত

### ৮.১ ঝুঁকির তালিকা

| ঝুঁকি | মাত্রা | প্রশমন |
|---|---|---|
| CTX Feed (৮০k) AI attribute যোগ করবে | 🔴 | attribution-এ দৌড়ান, feed-এ নয় |
| WebToffee ইতিমধ্যে নড়েছে | 🔴 | গতি বাড়ান |
| Google for WooCommerce (৮ লাখ) আংশিক ঢেকে দেয় | 🟡 | দাবি সংশোধন — "সম্পূর্ণ অদৃশ্য" বলবেন না |
| protocol বদলাচ্ছে (ACP/UCP/MCP) | 🟡 | feed layer আলাদা রাখুন, বদলানো সহজ হয় |
| OpenAI অনুমোদন আপনার হাতে নয় | 🟡 | পরিষ্কার লিখুন — আপনি প্রস্তুত করেন, অনুমোদন দেন না |
| WooCommerce পরে discovery যোগ করবে | 🟡 | attribution তখনো আপনার |
| **Churn** | 🔴 | **attribution-ই ওষুধ** — টাকা দেখলে থাকে |
| **wp.org review দেরি** | 🟡 | ২–৬ সপ্তাহ ধরে রাখুন |
| **আপনার লেগে থাকা** | 🔴🔴 | **সবচেয়ে বড় ঝুঁকি।** বেশিরভাগ SaaS এখানেই মরে |

### ৮.২ থামার শর্ত (kill criteria)

**সাথে সাথে থামবেন যদি:**

- ❌ ২ সপ্তাহের যাচাইয়ে **৩০-এর কম email**
- ❌ WooCommerce **ফ্রি ACP/UCP discovery support** ছাড়ে
- ❌ CTX Feed **পূর্ণ AI attribute suite** যোগ করে
- ❌ **৯ মাসে ২৫ paying customer** না হয়

**নিয়মিত দেখতে থাকবেন:** `developer.woocommerce.com/roadmap/` আর WooCommerce release note।

### ৮.৩ যা মাপবেন

| সূচক | লক্ষ্য |
|---|---|
| wp.org install (মাসিক) | মাস ৬-এ ৫০০+ |
| Free → Paid | ২–৪% |
| Churn (মাসিক) | ৫%-এর নিচে |
| Support ticket/customer/মাস | ০.৫-এর নিচে |
| Attribution রিপোর্ট দেখা হয় কি না | **সবচেয়ে জরুরি** — না দেখলে moat নেই |

---

## ৯. সময়রেখা

```
সপ্তাহ ১–২     যাচাই                        খরচ ~৳০
               └─ সবুজ না পেলে এখানেই শেষ

সপ্তাহ ৩–১০    MVP তৈরি
               ├─ audit engine
               ├─ fix + feed
               ├─ attribution
               └─ Freemius

সপ্তাহ ১১      wp.org-এ জমা
               └─ ⏰ review ২–৬ সপ্তাহ

মাস ৪–৬        প্রথম install, প্রথম paying
               └─ লক্ষ্য: ২৫ paying

মাস ৭–১২       v1.1 — prompt tracking, attribute gen
               └─ লক্ষ্য: ৫০ paying

মাস ১৩–১৮      v2 — agency, white-label
               └─ লক্ষ্য: ১০০ paying ≈ $৩,৯০০/মাস
```

---

## ১০. এই সপ্তাহে যা করবেন

```
□ Landing page বানান (Carrd/Framer) — ২ ঘণ্টা
□ Headline + copy বসান (ধাপ ৩.১ দেখুন)
□ Email box + pre-order link
□ ১০ জন Woo দোকানদারকে message
□ ১০ জন Fiverr/Upwork GEO seller-কে message ⭐
□ ৩টা group-এ প্রশ্ন পোস্ট করুন
□ উত্তর লিখে রাখুন — এটাই আপনার product spec
```

**কোড লিখবেন না। এখনো না।**

---

## পরিশিষ্ট A — মূল সংখ্যা

| তথ্য | মান |
|---|---|
| WooCommerce store | ৪১.৫–৪৫.৩ লাখ |
| জানা ecommerce platform-এ Woo | ৪৮.৪% |
| Shopify agent-ready store | ৫৬ লাখ |
| AEO software বাজার ২০২৬ | $১.২–২B |
| বাজারের বৃদ্ধি | ৪৫–৬০%/বছর |
| category-তে VC বিনিয়োগ | $৩০০M+ |
| Profound funding / valuation | $১৫৫M / $১B |
| Peec AI ARR (৬ মাসে) | $১০M |
| ChatGPT shopping data Google feed থেকে | ~৭৫% |
| US SEO/marketing consultant | ৩,৬২,৭৫৩ |
| US+CA agency যাদের কর্মী <১০ | ৬৪% |
| **llms.txt ফাইল কখনো fetch হয়নি** | **৯৭%** |

---

## পরিশিষ্ট B — সতর্কতা

> **এই পরিকল্পনা সম্পূর্ণভাবে ডেস্ক গবেষণাভিত্তিক।** একজন WooCommerce merchant-এর সাথেও কথা বলা হয়নি।
>
> গবেষণার সময় দুইটা প্রাথমিক ধারণা **ভুল প্রমাণিত** হয়েছে (agency white-label ফাঁক, WooCommerce-এর প্রতিযোগিতা)। আরও ভুল থাকতে পারে।
>
> vendor-প্রকাশিত পরিসংখ্যানে **৭ গুণ পর্যন্ত গরমিল** পাওয়া গেছে (AI referral ০.১৫% বনাম ১.০৮%)।
>
> **ধাপ ০ বাদ দেবেন না।** ২ সপ্তাহের যাচাই এই পুরো নথির চেয়ে বেশি মূল্যবান।

---

## পরিশিষ্ট C — সূত্র

**WooCommerce official**
- https://developer.woocommerce.com/docs/features/mcp/
- https://developer.woocommerce.com/2025/10/03/ai-agentic-commerce-in-woocommerce/
- https://developer.woocommerce.com/roadmap/
- https://developer.woocommerce.com/2026/06/09/woocommerce-10-9-beta/
- https://woocommerce.com/posts/ai-product-discovery/

**বাজার ও প্রতিযোগী**
- https://seresa.io/blog/agentic-commerce-readiness/shopify-got-ucp-for-free-and-woocommerce-stores-must-build-it-themselves
- https://www.contexthints.com/guide/chatgpt-product-feed.html
- https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt
- https://redstagfulfillment.com/what-is-woocommerces-market-share/
- https://www.surmado.com/blog/best-ai-visibility-tools-2026
- https://ayzeo.com/pricing
- https://llmpulse.ai/pricing

**llms.txt-এর প্রমাণ**
- https://www.techwyse.com/news/ai-search/google-llms-txt-no-ranking-benefit-june-2026
- https://www.1clickreport.com/blog/llms-txt-evidence-2026

**চাহিদার সংকেত**
- https://www.upwork.com/hire/geo-specialists/
- https://www.fiverr.com/categories/online-marketing/generative-engine-optimization
- https://community.shopify.com/t/strategy-for-aeo-geo/576930
- https://wordpress.org/support/topic/how-does-website-llms-txt-help/
- https://news.ycombinator.com/item?id=44133279
