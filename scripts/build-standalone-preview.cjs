const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'index.tailwind-perfect.backup.html');
const destPath = path.join(__dirname, '..', 'preview.html');

let html = fs.readFileSync(srcPath, 'utf8');

console.log('Transforming backup HTML to Zoventic GEO preview.html...');

// 1. Replace brand names
html = html.replace(/OmniGEO for WooCommerce/g, 'Zoventic GEO for WooCommerce');
html = html.replace(/OmniGEO/g, 'Zoventic GEO');
html = html.replace(/omnigeo/g, 'zoventic-geo');

// 2. Add AI Order Attribution Card HTML
const aiRevenueCardHtml = `
      <!-- AI Search Order Attribution & Revenue Card (WooCommerce 8.5+ Native) -->
      <div class="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl border border-slate-800 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <i data-lucide="dollar-sign" class="h-5 w-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-100">AI Search Order Attribution & Revenue</h3>
                <span class="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  Native WooCommerce 8.5+ (_wc_order_attribution_*)
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Real verified orders and revenue referred directly from ChatGPT, Perplexity & Claude citations</p>
            </div>
          </div>
          <span class="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/20">
            Last 30 Days Live Attribution
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <!-- Total AI Revenue -->
          <div class="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
            <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total AI Revenue</span>
            <div class="text-3xl font-extrabold text-emerald-400 mt-1 mb-1">$1,420.50</div>
            <p class="text-xs text-slate-300">From <strong class="text-emerald-400">12 verified orders</strong> via ChatGPT, Perplexity & Claude citations</p>
          </div>

          <!-- Average Order Value (AOV) -->
          <div class="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
            <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Average Order Value (AOV)</span>
            <div class="text-3xl font-extrabold text-cyan-400 mt-1 mb-1">$118.38</div>
            <p class="text-xs text-slate-300">+28% higher basket size than standard search due to high-intent conversational queries</p>
          </div>

          <!-- Engine Breakdown -->
          <div class="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
            <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">AI Revenue by Platform</span>
            <div class="space-y-2 mt-2">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-200">ChatGPT Search</span>
                  <span class="text-slate-400">$890.00 (7 orders, 62.7%)</span>
                </div>
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full" style="width: 62.7%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-200">Perplexity AI</span>
                  <span class="text-slate-400">$345.50 (3 orders, 24.3%)</span>
                </div>
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-teal-400 rounded-full" style="width: 24.3%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-200">Claude</span>
                  <span class="text-slate-400">$185.00 (2 orders, 13.0%)</span>
                </div>
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full" style="width: 13.0%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent AI Orders Mini List -->
        <div>
          <div class="text-xs font-semibold text-slate-300 mb-2">Recent AI Attributed Orders (SourceBuster & Referer Detected):</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05] flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-white">#1084</div>
                <div class="text-[11px] text-slate-400">Sep 4 · 2 items</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-emerald-400">$249.99</div>
                <span class="inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ChatGPT</span>
              </div>
            </div>
            <div class="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05] flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-white">#1079</div>
                <div class="text-[11px] text-slate-400">Sep 3 · 1 item</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-emerald-400">$189.50</div>
                <span class="inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">Perplexity</span>
              </div>
            </div>
            <div class="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05] flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-white">#1072</div>
                <div class="text-[11px] text-slate-400">Aug 31 · 3 items</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-emerald-400">$320.00</div>
                <span class="inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ChatGPT</span>
              </div>
            </div>
            <div class="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05] flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-white">#1065</div>
                <div class="text-[11px] text-slate-400">Aug 29 · 1 item</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-emerald-400">$95.00</div>
                <span class="inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Claude</span>
              </div>
            </div>
          </div>
        </div>
      </div>
`;

// Insert the card right before the main grid in the overview tab
if (html.includes('<!-- Main Grid: 2 Columns on XL -->')) {
  html = html.replace('<!-- Main Grid: 2 Columns on XL -->', aiRevenueCardHtml + '\n      <!-- Main Grid: 2 Columns on XL -->');
} else if (html.includes('id="tab-overview"')) {
  // fallback insert after the 4 stat cards
  html = html.replace(/(<div id="tab-overview"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/, '$1\n' + aiRevenueCardHtml);
}

fs.writeFileSync(destPath, html, 'utf8');
console.log('SUCCESS: preview.html written successfully (' + (html.length / 1024).toFixed(1) + ' KB)!');
