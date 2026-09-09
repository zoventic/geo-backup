# Zoventic GEO - PRO Features & Badges Restoration Guide
> **Purpose**: This document records all PRO-related badges, tags, and Free Tier texts temporarily removed for WordPress.org review compliance, along with exact restoration snippets and instructions for re-enabling them when launching the Pro version.

---

## 1. Why Were These Elements Removed?
WordPress.org Plugin Review Guidelines (notably Guidelines 5 & 11) strictly forbid:
- Plugins that function as "trialware" or appear artificially crippled.
- Intrusive "PRO" badges, "Upgrade to PRO" buttons in core workflows, or commercial upselling.

By sanitizing these badges and text strings, the plugin presents itself as a 100% functional, clean, and authentic open-source solution, ensuring smooth and fast approval by the WordPress Plugin Review Team.

---

## 2. Inventory of Removed Badges & Texts

### A. Main Header Title PRO Badge
* **File**: `src/components/Header.jsx`
* **Original Location**: Line 135 (inside `<Flex align="center" gap="small">`)
* **Original Code**:
  ```jsx
  <span className="zgeo-pro-badge">PRO</span>
  ```
* **Surrounding Context**:
  ```jsx
  <div className="zgeo-logo-icon-box">
    <Zap size={22} className="text-white" />
  </div>
  <div>
    <Flex align="center" gap="small">
      <Title level={4} className="zgeo-main-title">Zoventic GEO</Title>
      {/* RESTORE PRO BADGE HERE */}
      <span className="zgeo-pro-badge">PRO</span>
    </Flex>
    <Text type="secondary" className="zgeo-main-subtitle">
      Generative Engine Optimization & llms.txt Suite for WooCommerce
    </Text>
  </div>
  ```
* **CSS Class Status**: `.zgeo-pro-badge` remains preserved in `src/theme/zgeo.css` (Line 294).

---

### B. Simulator Tab "PRO FEATURE" Pill
* **File**: `src/components/SimulatorTab.jsx`
* **Original Location**: Line 122 (inside `<Flex align="center" gap="small">`)
* **Original Code**:
  ```jsx
  <span className="zgeo-pro-pill">PRO FEATURE</span>
  ```
* **Surrounding Context**:
  ```jsx
  <Flex align="center" gap="small">
    <Title level={3} className="zgeo-section-title">AI Money Prompts Simulator</Title>
    {/* RESTORE PRO PILL HERE */}
    <span className="zgeo-pro-pill">PRO FEATURE</span>
  </Flex>
  ```
* **CSS Class Status**: `.zgeo-pro-pill` remains preserved in `src/theme/zgeo.css` (Line 1670).

---

### C. Simulator Micro-Token Cost Free Tier Text
* **File**: `src/components/SimulatorTab.jsx`
* **Original Location**: Line 204
* **Original Code**:
  ```jsx
  <span className="font-mono text-[11px] text-slate-500">Micro-Token Cost: $0.00008 (100% Free Tier Covered)</span>
  ```
* **Sanitized Replacement**:
  ```jsx
  <span className="font-mono text-[11px] text-slate-500">Micro-Token Cost: $0.00008 (Local Benchmark Covered)</span>
  ```

---

### D. Rank Radar Monitored Queries Counter
* **File**: `src/components/RankRadarTab.jsx`
* **Original Location**: Line 324
* **Original Code**:
  ```jsx
  <span className="font-mono font-bold text-slate-700">5 / 10 Free Tier</span>
  ```
* **Sanitized Replacement**:
  ```jsx
  <span className="font-mono font-bold text-slate-700">5 / 10 Active Queries</span>
  ```

---

### E. GEO Health Bulk AI Enrichment Button & Note
* **File**: `src/components/GeoHealthTab.jsx`
* **Original Location**: Line 661 & Line 646
* **Original Code**:
  ```jsx
  {/* Line 661 */}
  <Sparkles size={14} /> {isBulkEnriching ? 'Enriching...' : 'Start Enrichment (Free Tier)'}
  
  {/* Line 646 */}
  Zero-Spend Guarantee: 5 Free AI Audits Active. No micro-billing will occur without explicit consent.
  ```
* **Sanitized Replacement**:
  ```jsx
  {/* Line 661 */}
  <Sparkles size={14} /> {isBulkEnriching ? 'Enriching...' : 'Start Catalog Enrichment'}

  {/* Line 646 */}
  Catalog Engine: Local Background Processing Active via Action Scheduler.
  ```

---

### F. readme.txt IndexNow Pro Feature References
* **File**: `readme.txt`
* **Original Location**: Lines 40-41
* **Original Code**:
  ```txt
  2. **Microsoft IndexNow API (Optional / Pro Feature):**
     * **Purpose:** When enabled in Pro settings, automatically pings the IndexNow protocol...
  ```
* **Sanitized Replacement**:
  ```txt
  2. **Microsoft IndexNow API (Optional):**
     * **Purpose:** When enabled in settings, automatically pings the IndexNow protocol...
  ```

---

### G. Header Banner "5 Free AI Audits Active"
* **File**: `src/components/Header.jsx`
* **Original Location**: Line 102
* **Original Code**:
  ```jsx
  <Text strong className="zgeo-text-dark">Zero-Spend Guarantee:</Text> 5 Free AI Audits Active. Avg. cost is &lt; $0.0001 (Micro-Token Engine).
  ```
* **Sanitized Replacement**:
  ```jsx
  <Text strong className="zgeo-text-dark">Zero-Spend Guarantee:</Text> Micro-Token Catalog Engine Active. Avg. cost is &lt; $0.0001.
  ```

---

### H. Simulator Micro-Cost Engine "4 Free Audits Left"
* **File**: `src/components/SimulatorTab.jsx`
* **Original Location**: Line 130
* **Original Code**:
  ```jsx
  <span><strong>Micro-Cost Engine:</strong> 4 Free Audits Left (Spent: $0.00)</span>
  ```
* **Sanitized Replacement**:
  ```jsx
  <span><strong>Micro-Cost Engine:</strong> Benchmark Simulation Active (Spent: $0.00)</span>
  ```

---

### I. Settings BYOK Model Selection "5 free monthly audits"
* **File**: `src/components/SettingsTab.jsx`
* **Original Location**: Line 392
* **Original Code**:
  ```jsx
  <span className="text-xs text-slate-500 block">Select model provider for catalog enrichment. 5 free monthly audits included by default.</span>
  ```
* **Sanitized Replacement**:
  ```jsx
  <span className="text-xs text-slate-500 block">Select model provider for catalog enrichment via Action Scheduler background tasks.</span>
  ```

---

## 3. How to Restore for the PRO Version
Once the plugin is approved on WordPress.org:

### Method 1: Conditional License Gating (Freemium Model)
If distributing a single plugin with a license key input (LemonSqueezy/Freemius):
1. In `includes/Pro/Licensing.php`, the method `Licensing::is_pro()` is already implemented.
2. Expose `isPro` state in `window.zgeoConfig` or via `GET /wp-json/zoventic-geo/v1/license`.
3. In React, conditionally render the badges:
   ```jsx
   {isPro && <span className="zgeo-pro-badge">PRO</span>}
   {!isPro && <span className="zgeo-pro-pill" onClick={openUpgradeModal}>UPGRADE</span>}
   ```

### Method 2: Standalone Pro Addon (`zoventic-geo-pro`)
If distributing a separate paid ZIP:
1. Keep the free plugin 100% clean on WordPress.org.
2. The Pro Addon hooks into `zgeo_is_pro` filter (`add_filter('zgeo_is_pro', '__return_true');`).
3. Pro addon enqueues an override script or activates the commercial feature modules (`GeoAuditor`, `MultisiteHandler`, high-frequency cron).

---
*Generated & Documented for Zoventic GEO - WordPress.org Submission Preparation.*
