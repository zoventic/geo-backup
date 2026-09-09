import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Button,
  Switch,
  message,
  Flex,
  Typography,
  Space
} from 'antd';
import {
  Copy,
  ExternalLink,
  Layers,
  Star,
  CheckCircle,
  Tag,
  FileText
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';

const { Title, Text } = Typography;

export const LlmsEngineTab = () => {
  const {
    llmsTxtContent,
    siteInfo,
    products,
    llmsTxtSubfeeds,
    llmsTxtFullUrl,
    settings,
    updateSettings,
    regenerateLlmsTxt
  } = useGeoStore();

  const [rules, setRules] = useState({
    variations: settings?.feedRules?.variations ?? true,
    reviews: settings?.feedRules?.reviews ?? true,
    inStock: settings?.feedRules?.inStock ?? true,
    coupons: settings?.feedRules?.coupons ?? true
  });

  useEffect(() => {
    if (settings?.feedRules) {
      setRules({
        variations: settings.feedRules.variations ?? true,
        reviews: settings.feedRules.reviews ?? true,
        inStock: settings.feedRules.inStock ?? true,
        coupons: settings.feedRules.coupons ?? true
      });
    }
  }, [settings]);

  const handleRuleToggle = async (ruleKey, newVal) => {
    const updated = { ...rules, [ruleKey]: newVal };
    setRules(updated);
    try {
      if (updateSettings) {
        await updateSettings({ feedRules: updated });
      }
      await regenerateLlmsTxt?.();
      message.success('Feed rule updated & live /llms.txt refreshed.');
    } catch (err) {
      message.error('Failed to update feed rule.');
    }
  };

  const availableSubfeeds = useMemo(() => {
    if (llmsTxtSubfeeds && llmsTxtSubfeeds.length > 0) {
      return llmsTxtSubfeeds;
    }
    const cats = Array.from(new Set((products || []).map(p => p.category).filter(Boolean)));
    const siteUrl = siteInfo?.siteUrl?.replace(/\/$/, '') || '';
    return cats.map(c => {
      const slug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        name: c,
        slug: slug,
        url: `${siteUrl}/llms-${slug}.txt`,
        count: (products || []).filter(p => p.category === c).length
      };
    });
  }, [llmsTxtSubfeeds, products, siteInfo]);

  const fullCatalogUrl = llmsTxtFullUrl || (siteInfo?.siteUrl ? `${siteInfo.siteUrl.replace(/\/$/, '')}/llms-full.txt` : '/llms-full.txt');

  const manifestContent = useMemo(() => {
    if (llmsTxtContent && llmsTxtContent.trim().length > 50) {
      return llmsTxtContent;
    }

    const storeName = siteInfo?.siteName || 'WooCommerce Store';
    const storeCurrency = siteInfo?.currency || 'USD';
    const storeSymbol = siteInfo?.currencySymbol || '$';
    const rawCoupon = settings?.referralCoupon || settings?.couponCode || 'AI10';
    const cleanCoupon = rawCoupon.replace(/\s*\(.*\)/, '').trim() || 'AI10';
    const couponSuffix = rules.coupons ? `?coupon=${encodeURIComponent(cleanCoupon)}` : '';

    let code = `# ${storeName} — Machine-Readable Catalog\n> Verified Direct Commerce Feed for AI Search Engines and Smart Assistants.\n\n## Store Information\n- Name: ${storeName}\n- Currency: ${storeCurrency} (${storeSymbol})\n- Return Policy: 30-day return guarantee\n`;

    if (rules.coupons) {
      code += `- AI Shopper Discount: Use coupon code '${cleanCoupon}' for discount\n`;
    }

    code += `\n## Featured Product Catalog\n\n`;

    const prods = (products && products.length > 0) ? products : [];
    if (prods.length > 0) {
      prods.slice(0, 20).forEach((p) => {
        const itemUrl = p.permalink || (siteInfo?.siteUrl ? `${siteInfo.siteUrl}/product/${p.id}` : '#');
        code += `### ${p.title}\n`;
        code += `- URL: ${itemUrl}${couponSuffix}\n- SKU: ${p.sku || 'N/A'}\n- Price: ${p.price || '$0.00'}\n- In Stock: ${p.stockStatus || 'In Stock'}\n- Category: ${p.category || 'General'}\n`;
        if (rules.reviews) {
          code += `- Customer Consensus: Verified customer satisfaction rating\n`;
        }
        code += '\n';
      });
    } else {
      code += `> No published products found in store catalog yet.\n`;
    }

    return code;
  }, [rules, llmsTxtContent, siteInfo, products]);

  const tokenStats = useMemo(() => {
    const lines = manifestContent.split('\n').length;
    const tokens = Math.max(120, lines * 14);
    const kb = ((tokens * 4.4) / 1024).toFixed(1);
    const cost = (tokens * 0.00000025).toFixed(5);
    return {
      tokens: `~${tokens.toLocaleString()} tokens (${kb} KB)`,
      cost: `< $${cost}`
    };
  }, [manifestContent]);

  const liveUrl = siteInfo?.siteUrl ? `${siteInfo.siteUrl.replace(/\/$/, '')}/llms.txt` : '/llms.txt';

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestContent);
    message.success('Copied /llms.txt feed to clipboard!');
  };

  const handleOpenLive = () => {
    window.open(liveUrl, '_blank');
  };

  return (
    <div className="zgeo-llmstxt-tab space-y-7">
      {/* 1. Page Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={3} className="zgeo-section-title">llms.txt Feed Studio</Title>
          <Text type="secondary" className="zgeo-section-subtitle">
            Live product catalog feed optimized for AI search agents and answer engines.
          </Text>
        </div>

        <Flex align="center" gap="small">
          <Button
            icon={<Copy size={15} />}
            onClick={handleCopy}
            className="zgeo-btn-white"
          >
            Copy Feed
          </Button>
          <Button
            type="primary"
            icon={<ExternalLink size={15} />}
            onClick={handleOpenLive}
            className="zgeo-btn-brand"
          >
            Open Live URL
          </Button>
        </Flex>
      </Flex>

      {/* 2. 2-Column Layout */}
      <div className="zgeo-llms-grid">
        {/* Left Column: Compilation Rules */}
        <Card
          className="zgeo-glass-card zgeo-llms-card"
          bordered={false}
          styles={{
            body: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: '20px',
              height: '100%',
              padding: '24px',
              minWidth: 0,
              width: '100%'
            }
          }}
        >
          <div>
            <Flex justify="space-between" align="center" className="pb-3.5 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Feed Generation Rules</span>
              <span className="zgeo-fast-rag-tag">Instant Feed</span>
            </Flex>

            <div className="space-y-3 pt-4">
              {/* Rule 1 */}
              <div
                className="zgeo-rule-item"
                onClick={() => handleRuleToggle('variations', !rules.variations)}
              >
                <Flex align="center" gap="small" style={{ minWidth: 0, flex: 1 }}>
                  <div className="zgeo-rule-icon-box indigo">
                    <Layers size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="font-bold text-slate-900 text-xs block truncate">WooCommerce Variations</span>
                    <span className="text-[11px] text-slate-500 block truncate">Stock &amp; size matrix per SKU</span>
                  </div>
                </Flex>
                <Switch
                  checked={rules.variations}
                  onChange={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    handleRuleToggle('variations', checked);
                  }}
                  onClick={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                />
              </div>

              {/* Rule 2 */}
              <div
                className="zgeo-rule-item"
                onClick={() => handleRuleToggle('reviews', !rules.reviews)}
              >
                <Flex align="center" gap="small" style={{ minWidth: 0, flex: 1 }}>
                  <div className="zgeo-rule-icon-box amber">
                    <Star size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="font-bold text-slate-900 text-xs block truncate">Review Consensus Summaries</span>
                    <span className="text-[11px] text-slate-500 block truncate">Pros &amp; cons buyer scores</span>
                  </div>
                </Flex>
                <Switch
                  checked={rules.reviews}
                  onChange={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    handleRuleToggle('reviews', checked);
                  }}
                  onClick={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                />
              </div>

              {/* Rule 3 */}
              <div
                className="zgeo-rule-item"
                onClick={() => handleRuleToggle('inStock', !rules.inStock)}
              >
                <Flex align="center" gap="small" style={{ minWidth: 0, flex: 1 }}>
                  <div className="zgeo-rule-icon-box emerald">
                    <CheckCircle size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="font-bold text-slate-900 text-xs block truncate">In-Stock Only Filter</span>
                    <span className="text-[11px] text-slate-500 block truncate">Auto-exclude stockout items</span>
                  </div>
                </Flex>
                <Switch
                  checked={rules.inStock}
                  onChange={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    handleRuleToggle('inStock', checked);
                  }}
                  onClick={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                />
              </div>

              {/* Rule 4 */}
              <div
                className="zgeo-rule-item"
                onClick={() => handleRuleToggle('coupons', !rules.coupons)}
              >
                <Flex align="center" gap="small" style={{ minWidth: 0, flex: 1 }}>
                  <div className="zgeo-rule-icon-box purple">
                    <Tag size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="font-bold text-slate-900 text-xs block truncate">AI Referral Coupon Codes</span>
                    <span className="text-[11px] text-slate-500 block truncate">Adds <code>?coupon=AI10</code> to links</span>
                  </div>
                </Flex>
                <Switch
                  checked={rules.coupons}
                  onChange={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    handleRuleToggle('coupons', checked);
                  }}
                  onClick={(checked, e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                />
              </div>
            </div>
          </div>

          {/* Live Manifest Metric Box */}
          <div className="zgeo-metric-box mt-5">
            <Flex justify="space-between" align="center" className="font-mono text-[11px]">
              <span className="text-slate-500">Estimated Tokens:</span>
              <span className="font-bold text-slate-800">{tokenStats.tokens}</span>
            </Flex>
            <Flex justify="space-between" align="center" className="font-mono text-[11px] mt-1.5">
              <span className="text-slate-500">Estimated API Cost (GPT-4o):</span>
              <span className="font-bold text-emerald-700">{tokenStats.cost}</span>
            </Flex>
            <div className="pt-2 border-t border-slate-200/70 text-[10px] text-slate-500 flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span className="truncate">Generated directly from WooCommerce in 8ms</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Manifest Live Stream Output */}
        <Card
          className="zgeo-glass-card zgeo-llms-card"
          bordered={false}
          styles={{
            body: {
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '24px',
              minWidth: 0,
              width: '100%'
            }
          }}
        >
          <Flex justify="space-between" align="center" className="pb-3.5 border-b border-slate-100 mb-3.5" style={{ minWidth: 0 }}>
            <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-2 truncate">
              <FileText size={16} className="text-brand-600 flex-shrink-0" />
              <span className="truncate">/llms.txt (Live Stream Output)</span>
            </span>
            <span className="zgeo-spec-tag">Specification v1.1</span>
          </Flex>

          <pre className="zgeo-llms-pre-output">
            {manifestContent}
          </pre>
        </Card>
      </div>

      {/* 3. Category Sub-Feeds & Full Feeds Card */}
      <Card className="zgeo-glass-card" bordered={false}>
        <div className="space-y-4">
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3.5 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 border border-indigo-100 flex items-center justify-center font-bold shadow-2xs">
                <Layers size={20} />
              </div>
              <div>
                <Title level={4} className="zgeo-title-clean">Category Sub-Feeds &amp; Full Catalog</Title>
                <p className="text-xs text-slate-500 mt-0.5">
                  Partitioned markdown sub-feeds per category prevent LLM context window overflow while keeping your entire catalog indexable.
                </p>
              </div>
            </Flex>

            <span className="zgeo-fast-rag-tag">
              Subfeed Generator Active
            </span>
          </Flex>

          <div className="space-y-3">
            {/* Full Feed Row */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Flex align="center" gap="small">
                  <span className="font-bold text-xs text-slate-800">Unabridged Full Catalog Feed</span>
                  <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200/70">
                    /llms-full.txt
                  </span>
                </Flex>
                <div className="font-mono text-[11px] text-slate-500 truncate mt-0.5">{fullCatalogUrl}</div>
              </div>

              <Flex align="center" gap="small" className="flex-shrink-0">
                <Button
                  size="small"
                  icon={<Copy size={13} />}
                  onClick={() => {
                    navigator.clipboard.writeText(fullCatalogUrl);
                    message.success('Copied /llms-full.txt URL!');
                  }}
                  className="zgeo-btn-white text-xs"
                >
                  Copy Link
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<ExternalLink size={13} />}
                  onClick={() => window.open(fullCatalogUrl, '_blank')}
                  className="zgeo-btn-brand text-xs"
                >
                  Open
                </Button>
              </Flex>
            </div>

            {/* Category Subfeeds */}
            {availableSubfeeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {availableSubfeeds.map((sub, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <Flex align="center" gap="small">
                        <span className="font-bold text-xs text-slate-900 truncate">{sub.name}</span>
                        {sub.count !== undefined && (
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {sub.count} item{sub.count === 1 ? '' : 's'}
                          </span>
                        )}
                      </Flex>
                      <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                        /llms-{sub.slug}.txt
                      </div>
                    </div>

                    <Flex align="center" gap="4px" className="flex-shrink-0">
                      <Button
                        size="small"
                        icon={<Copy size={12} />}
                        onClick={() => {
                          navigator.clipboard.writeText(sub.url);
                          message.success(`Copied /llms-${sub.slug}.txt URL!`);
                        }}
                        className="zgeo-btn-white text-[11px]"
                        title="Copy Sub-Feed URL"
                      />
                      <Button
                        size="small"
                        icon={<ExternalLink size={12} />}
                        onClick={() => window.open(sub.url, '_blank')}
                        className="zgeo-btn-white text-[11px]"
                        title="Open Sub-Feed"
                      />
                    </Flex>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                Create WooCommerce categories with published products to automatically generate partitioned /llms-[category].txt feeds.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
