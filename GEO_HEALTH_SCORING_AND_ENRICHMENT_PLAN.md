# Zoventic GEO — Multi-Signal Health Scoring, Enrichment Lifecycle & Transparent Diagnostic Plan
> **File:** `GEO_HEALTH_SCORING_AND_ENRICHMENT_PLAN.md`  
> **Status:** Revised & Upgraded (Aligned with Multi-Signal Diagnostic Principles & WP.org Guidelines 5 & 11)  
> **Architecture:** Honest Objective Diagnostics • Independent Stock Layer • Stale Revalidation • Variable Product Coverage

---

## ১. কেন এই রিভিশন (Why This Upgrade)?

পূর্ববর্তী ড্রাফটে একটি ফ্ল্যাট ফর্মুলা (`50 + 5 + 5 + 5 = 65%`) ছিল, যার কারণে প্রায় সব প্রোডাক্ট অপরিবর্তিতভাবে ঠিক ৬৫%-এ আটকে থাকত। এটি দেখতে একটি "কৃত্রিম সেলস ডেমো ট্রিক" মনে হতে পারত এবং WordPress.org রিভিউতে মিসলিডিং ইউআই (Guideline 5 & 11) হিসেবে ঝুঁকির কারণ হতে পারত।

এই রিভিশনে আমরা **৩টি মূল নীতি** প্রতিষ্ঠা করছি:
1. **Multi-Signal Objective Scoring:** স্কোর কোনো নির্দিষ্ট ফিক্সড সিলিংয়ে আটকে থাকবে না। ৮–১০টি আসল সিগন্যাল মিলিয়ে প্রোডাক্টভেদে স্কোর স্বাভাবিকভাবেই **৩৫% থেকে ৮০% পর্যন্ত ছড়িয়ে থাকবে**।
2. **Content Readiness vs Stock Separation:** ডেটার কোয়ালিটি (Content Readiness Score: e.g. 96%) এবং গুদামের মাল (Live Stock: In Stock / Out of Stock) সম্পূর্ণ আলাদা দুটি স্বাধীন ইন্ডিকেটরে প্রদর্শিত হবে। স্টক না থাকার কারণে কনটেন্ট স্কোরে বিভ্রান্তিকর কৃত্রিম ক্যাপ হবে না।
3. **Stale Enrichment Revalidation:** মার্চেন্ট যদি প্রোডাক্ট অপটিমাইজ করার পর নিজে ডিসক্রিপশন বা অ্যাট্রিবিউট পরিবর্তন করে, তবে প্লাগইন তা `woocommerce_update_product` হুক দিয়ে ধরে স্ট্যাটাস ফ্ল্যাগ করবে।

---

## ২. Multi-Signal Scoring Engine (মোট ১০০ পয়েন্ট)

প্রোডাক্ট অডিট ইঞ্জিন নিচের ১০টি স্বাধীন ও বস্তুনিষ্ঠ (Objective) সিগন্যালের ভিত্তিতে স্কোর হিসাব করবে:

| # | সিগন্যাল (Signal) | পয়েন্ট | যাচাইয়ের নিয়ম (Validation Logic) |
|---|---|:---:|---|
| **S1** | **SKU / Unique Identifier** | **১০** | `$p->get_sku()` বিদ্যমান এবং খালি নয়। |
| **S2** | **Category & Taxonomy Depth** | **১০** | ক্যাটালগে ক্যাটাগরি নির্ধারিত (`product_cat` আছে, 'Uncategorized' নয়)। |
| **S3** | **Description Depth (Word Count)** | **১৫** | <ul><li>< ২০ শব্দ: ০ পয়েন্ট</li><li>২০–৫৯ শব্দ: +৫ পয়েন্ট</li><li>৬০+ শব্দ: পূর্ণ ১৫ পয়েন্ট</li></ul> |
| **S4** | **Structured Product Attributes** | **১৫** | WooCommerce-এর নিজস্ব Attributes (যেমন: Size, Color, Material, Dimensions) ব্যবহৃত হয়েছে। |
| **S5** | **Media & Visual Assets** | **১০** | <ul><li>Featured Image আছে: +৫ পয়েন্ট</li><li>Product Gallery Images (> ১টি ছবি): +৫ পয়েন্ট</li></ul> |
| **S6** | **Pricing & Currency Integrity** | **১০** | বৈধ মূল্য (`$p->get_price() > 0`) এবং সক্রিয় কারেন্সি কোড নির্ধারিত। |
| **S7** | **Semantic Specs & Buyer FAQ Graph** | **১৫** | Zoventic GEO দ্বারা সমৃদ্ধ structured FAQ/Specs মেটাডেটা (`_zgeo_specs` বা `_zgeo_optimized_at`) যুক্ত। |
| **S8** | **Merchant Policies (Return & Shipping)** | **১০** | রিটার্ন ও শিপিং পলিসি স্কিমা (JSON-LD MerchantReturnPolicy) সংযুক্ত। |
| **S9** | **Social Proof / Customer Ratings** | **৫** | রিভিউ কাউন্ট > ০ অথবা ভ্যালিড AggregateRating উপস্থিত। |
| **Total** | **সর্বোচ্চ সম্ভব স্কোর** | **১০০** | |

### প্রোডাক্টভেদে স্বাভাবিক স্কোরের বিতরণ (Natural Variance):
- **Barebones Product (শুধু নাম ও দাম):** ~২০% – ৩০%
- **Typical Basic Product (নাম, দাম, ১টি ছবি, স্বল্প বর্ণনা):** ~৪৫% – ৫৫%
- **Well-documented Product (গ্যালারি, বর্ণনা ও ভ্যারিয়েশন):** ~৬৫% – ৭৫%
- **Zoventic GEO 1-Click Enriched Product (Rich Specs + FAQs + Return Policy Schema):** **৯০% – ৯৮%**

---

## ৩. Content Score বনাম Live Stock আলাদা প্রদর্শন (Honest Architecture)

কনটেন্ট স্কোরের সাথে ইনভেন্টরি ক্যাপ গুলিয়ে না ফেলে দুটি পরিষ্কার আলাদা ব্যাজে ইউজার ইন্টারফেসে তথ্য দেওয়া হবে:

```
┌────────────────────────────────────────────────────────────┐
│ Content Readiness: 🟢 96% (Optimal AI Search Schema)      │
│ Live Availability: ⚠️ Out of Stock (Restock in WooCommerce)│
└────────────────────────────────────────────────────────────┘
```

1. **Content Readiness Score (০–১০০%):**  
   প্রোডাক্টের ডেটা এবং স্কিমা AI ক্রলারদের পড়ার উপযোগী কি না, তা সম্পূর্ণ নিরপেক্ষভাবে পরিমাপ করবে।
2. **Live Stock Indicator:**  
   `✅ In Stock` অথবা `⚠️ Out of Stock`।  
   - আউট-অব-স্টক হলে স্কোরে মিথ্যা নম্বর কাটবে না, বরং স্পষ্ট ব্যাখ্যা দেবে:  
     *"প্রোডাক্টের AI স্কিমা ১০০% প্রস্তুত। কিন্তু যেহেতু গুদামে বর্তমানে স্টক ০, তাই ChatGPT বা Perplexity ক্রেতাকে এই মুহূর্তে রিডাইরেক্ট করবে না। স্টকে মাল আনলেই এটি স্বয়ংক্রিয়ভাবে লাইভ সাইটেশনে চলে যাবে।"*

---

## ৪. কারিগরি ফাঁকসমূহের সমাধান (Technical Specifications)

### ক) Stale Enrichment Revalidation
- **হুক:** `woocommerce_update_product`
- **লজিক:** মার্চেন্ট যদি পরবর্তীতে WooCommerce প্রোডাক্ট এডিট স্ক্রিন থেকে টাইটেল, ডেসক্রিপশন বা অ্যাট্রিবিউট সেভ করে:
  - প্লাগইন চেক করবে সেভ করার টাইমস্ট্যাম্প `_zgeo_optimized_at`-এর চেয়ে নতুন কি না।
  - যদি নতুন হয়, তবে মেটা সেট করবে: `_zgeo_needs_recheck = true`।
  - ড্যাশবোর্ডে প্রোডাক্টের পাশে একটি সূক্ষ্ম ব্যাজ আসবে: `Needs Re-check` (যাতে পুরনো ডেটার ওপর ভিত্তি করে অসত্য স্কোর প্রদর্শিত না হয়)।

### খ) Variable Products Policy (Phase 1 vs Phase 2)
- **Phase 1 (বর্তমান বাস্তবায়ন):** Parent-level এগ্রিগেটেড স্কোরিং।
  - প্যারেন্ট প্রোডাক্টের অধীনে ভ্যারিয়েশন অ্যাট্রিবিউট (যেমন: Size/Color) এবং প্রতিটি ভ্যারিয়েশনের Offer স্কিমা উপস্থিত থাকলে S4 ও S6-এর পূর্ণ মার্ক পাবে।
- **Phase 2 (ভবিষ্যৎ এক্সটেনশন):** ড্রয়ারের ভেতরে প্রতিটি ভ্যারিয়েশনের জন্য আলাদা মাইক্রো-টাইলস।

### গ) Honest UI Framing
- "1-Click Enrich" বাটনের নিচে বা টুলটিপে পরিষ্কার ব্যাখ্যা থাকবে:  
  *"Fills missing AI-readable fields: Generates structured buyer FAQs, technical specs graph, and return policy schema."*  
  (যাতে মার্চেন্ট সুনির্দিষ্টভাবে বোঝে কী কী ফিল্ড যোগ হচ্ছে, কোনো ফাঁকা ম্যাজিক নয়)।

---

## ৫. ফাইলভিত্তিক কোড পরিবর্তন (Implementation Files)

### ১. [MODIFY] `includes/Rest/RestController.php`
- `get_products()` মেথডে Multi-Signal scoring ফাংশন প্রতিস্থাপন।
- প্রতিটি সিগন্যাল (S1 থেকে S9) স্বাধীনভাবে ক্যালকুলেট করে স্কোর রিটার্ন করা।
- রেসপন্স অবজেক্টে `contentScore`, `stockStatus`, `isStale` আলাদা ফিল্ড হিসেবে প্রদান।

### ২. [MODIFY] `includes/Engine/BulkActionScheduler.php`
- `enrich_product()` মেথডে মাল্টি-সিগন্যাল স্পেক্স ইনজেকশন নিশ্চিত করা।
- `woocommerce_update_product` হুকে স্টেলনেস চেকার যুক্ত করা।

### ৩. [MODIFY] `src/components/GeoHealthTab.jsx`
- টেবিল কলামে Content Readiness Score এবং Stock Status আলাদা ব্যাজে প্রদর্শন।
- ড্রয়ার পপআপে কোন কোন সিগন্যাল পাস করেছে (Green Check) আর কোনটি বাকি আছে (Gray/Yellow) তার স্পষ্ট ১০-পয়েন্ট চেকলিস্ট প্রদর্শন।

---

## ৬. Verification & Unit Test Suite

1. **PHP CLI Unit Tests:**
   - Case 1: Barebones product (Title + Price only) ➔ ৩০% এর আশেপাশে স্কোর আসতে হবে।
   - Case 2: Average product (Title, SKU, 1 Image, 30-word description) ➔ ৫০%–৬০% আসতে হবে।
   - Case 3: Out-of-Stock product with full specs ➔ Content score ৯৫%+, Stock ব্যাজ `Out of Stock`।
   - Case 4: 1-Click Enrich execution ➔ S7, S8 যুক্ত হয়ে স্কোর ৯০%+ এ উন্নীত হওয়া।
2. **Stale Hook Test:**
   - প্রোডাক্ট আপডেট করলে `_zgeo_needs_recheck` ফ্ল্যাগ টেস্ট।
3. **Build & Deploy:**
   - `npm run build`, `sync_all.cjs`, জিপ তৈরি ও গিট পুশ।
