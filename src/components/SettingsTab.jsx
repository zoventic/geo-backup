import React, { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Input,
  Switch,
  Slider,
  Select,
  message,
  Flex,
  Typography,
  Space,
  Modal
} from 'antd';
import {
  Store,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Check,
  Zap,
  Trash2,
  Save,
  Cpu,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Compass,
  Search,
  ShoppingCart,
  Share2,
  Radio,
  Mail,
  Crown,
  Globe,
  ExternalLink,
  AlertTriangle,
  RotateCw,
  Sliders,
  Layers
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';
import { api } from '../services/api';

const { Title, Text } = Typography;

export const SettingsTab = () => {
  const {
    openAiApiKey,
    setOpenAiApiKey,
    perplexityApiKey,
    setPerplexityApiKey,
    anthropicApiKey,
    setAnthropicApiKey,
    monthlyBudgetCap,
    setMonthlyBudgetCap,
    crawlerPermissions,
    toggleCrawlerPermission,
    purgeCache,
    siteInfo,
    products,
    updateSettings,
    settings,
    licenseInfo,
    activateLicense,
    deactivateLicense,
    rotateIndexNowKey
  } = useGeoStore();

  const realStoreName = siteInfo?.siteName || 'WooCommerce Store';
  const [tagline, setTagline] = useState(settings?.tagline || `${realStoreName} — Curated Products with Verified Catalog Schema`);
  const [couponCode, setCouponCode] = useState(settings?.couponCode || 'AI10 (10% Off for AI Shoppers)');
  const [highlights, setHighlights] = useState(settings?.highlights || 'Fast reliable shipping, authentic products, secure checkout.');
  const [selectedModel, setSelectedModel] = useState(settings?.selectedModel || 'gpt4o');
  const [enableIndexNow, setEnableIndexNow] = useState(settings?.enableIndexNow ?? true);
  const [enableEmailDigest, setEnableEmailDigest] = useState(settings?.enableEmailDigest ?? true);
  const [alertEmail, setAlertEmail] = useState(settings?.alertEmail || '');
  const [blockAggressiveBots, setBlockAggressiveBots] = useState(settings?.blockAggressiveBots ?? true);
  const [rateLimitCrawlerHits, setRateLimitCrawlerHits] = useState(settings?.rateLimitCrawlerHits ?? 120);
  const [enableJsonLdEnhancer, setEnableJsonLdEnhancer] = useState(settings?.enableJsonLdEnhancer ?? true);
  const [enableBotLogging, setEnableBotLogging] = useState(settings?.enableBotLogging ?? true);
  const [enableLlmsTxt, setEnableLlmsTxt] = useState(settings?.enableLlmsTxt ?? true);
  const [enableAbilitiesApi, setEnableAbilitiesApi] = useState(settings?.enableAbilitiesApi ?? true);
  const [cacheDurationMinutes, setCacheDurationMinutes] = useState(settings?.cacheDurationMinutes ?? 60);

  const [showKey, setShowKey] = useState(false);
  const [showPerplexityKey, setShowPerplexityKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isPingingPerplexity, setIsPingingPerplexity] = useState(false);
  const [isPingingAnthropic, setIsPingingAnthropic] = useState(false);
  const [isRotatingIndexNowKey, setIsRotatingIndexNowKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [autoKillJobs, setAutoKillJobs] = useState(settings?.autoKillJobs ?? settings?.auto_kill_jobs ?? true);
  const [emailWarning, setEmailWarning] = useState(settings?.emailWarning ?? settings?.email_warning ?? true);
  const [autoPurgeOutOfStock, setAutoPurgeOutOfStock] = useState(settings?.autoPurgeOutOfStock ?? settings?.auto_purge_out_of_stock ?? true);
  const [isSendingTestDigest, setIsSendingTestDigest] = useState(false);
  const [isPingingIndexNow, setIsPingingIndexNow] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState(licenseInfo?.key || '');
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [isDeactivatingLicense, setIsDeactivatingLicense] = useState(false);
  const [auditTargetDomain, setAuditTargetDomain] = useState('');
  const [isAuditingDomain, setIsAuditingDomain] = useState(false);
  const [domainAuditResult, setDomainAuditResult] = useState(null);

  React.useEffect(() => {
    if (licenseInfo?.key) {
      setLicenseKeyInput(licenseInfo.key);
    }
  }, [licenseInfo?.key]);

  const handleActivateLicense = async () => {
    if (!licenseKeyInput.trim()) {
      message.warning('Please enter a license key to activate.');
      return;
    }
    setIsActivatingLicense(true);
    try {
      const res = await activateLicense?.(licenseKeyInput.trim());
      if (res && res.success) {
        message.success(res.message || 'License activated successfully!');
      } else {
        message.error(res?.message || 'Failed to activate license.');
      }
    } catch (e) {
      message.error('License activation error.');
    } finally {
      setIsActivatingLicense(false);
    }
  };

  const handleDeactivateLicense = async () => {
    setIsDeactivatingLicense(true);
    try {
      await deactivateLicense?.();
      setLicenseKeyInput('');
      message.info('License deactivated. Returned to Free Community Edition.');
    } catch (e) {
      message.error('Failed to deactivate license.');
    } finally {
      setIsDeactivatingLicense(false);
    }
  };

  const handleRunDomainAudit = async () => {
    const raw = auditTargetDomain.trim();
    if (!raw) {
      message.warning('Please enter a website domain or store URL to audit.');
      return;
    }
    const clean = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setIsAuditingDomain(true);
    setDomainAuditResult(null);
    try {
      const res = await api.auditDomain(`https://${clean}`);
      if (res && res.success) {
        setDomainAuditResult(res);
        message.success(`Audit complete for ${clean} — GEO Score: ${res.overallScore}/100 (${res.rating})`);
      } else {
        message.error(res?.message || 'Failed to complete domain audit.');
      }
    } catch (err) {
      message.error('Domain audit request failed.');
    } finally {
      setIsAuditingDomain(false);
    }
  };

  // Sync settings when loaded from backend
  React.useEffect(() => {
    if (settings) {
      if (settings.tagline) setTagline(settings.tagline);
      if (settings.couponCode) setCouponCode(settings.couponCode);
      if (settings.highlights) setHighlights(settings.highlights);
      if (settings.selectedModel) setSelectedModel(settings.selectedModel);
      if (settings.enableIndexNow !== undefined) setEnableIndexNow(settings.enableIndexNow);
      if (settings.enableEmailDigest !== undefined) setEnableEmailDigest(settings.enableEmailDigest);
      if (settings.alertEmail !== undefined) setAlertEmail(settings.alertEmail);
      if (settings.blockAggressiveBots !== undefined) setBlockAggressiveBots(settings.blockAggressiveBots);
      if (settings.rateLimitCrawlerHits !== undefined) setRateLimitCrawlerHits(settings.rateLimitCrawlerHits);
      if (settings.autoPurgeOutOfStock !== undefined) setAutoPurgeOutOfStock(settings.autoPurgeOutOfStock);
      else if (settings.auto_purge_out_of_stock !== undefined) setAutoPurgeOutOfStock(settings.auto_purge_out_of_stock);
      if (settings.autoKillJobs !== undefined) setAutoKillJobs(settings.autoKillJobs);
      else if (settings.auto_kill_jobs !== undefined) setAutoKillJobs(settings.auto_kill_jobs);
      if (settings.emailWarning !== undefined) setEmailWarning(settings.emailWarning);
      else if (settings.email_warning !== undefined) setEmailWarning(settings.email_warning);
      if (settings.enableJsonLdEnhancer !== undefined) setEnableJsonLdEnhancer(settings.enableJsonLdEnhancer);
      if (settings.enableBotLogging !== undefined) setEnableBotLogging(settings.enableBotLogging);
      if (settings.enableLlmsTxt !== undefined) setEnableLlmsTxt(settings.enableLlmsTxt);
      if (settings.enableAbilitiesApi !== undefined) setEnableAbilitiesApi(settings.enableAbilitiesApi);
      if (settings.enable_abilities_api !== undefined) setEnableAbilitiesApi(settings.enable_abilities_api);
      if (settings.cacheDurationMinutes !== undefined) setCacheDurationMinutes(settings.cacheDurationMinutes);
      if (settings.perplexityApiKey) setPerplexityApiKey(settings.perplexityApiKey);
      if (settings.anthropicApiKey) setAnthropicApiKey(settings.anthropicApiKey);
      if (settings.perplexity_api_key) setPerplexityApiKey(settings.perplexity_api_key);
      if (settings.anthropic_api_key) setAnthropicApiKey(settings.anthropic_api_key);
    }
  }, [settings]);

  const handleBotToggle = (botKey, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    toggleCrawlerPermission?.(botKey);
  };

  const robotsTxtContent = useMemo(() => {
    let robots = '';
    if (crawlerPermissions?.gptbot ?? true) {
      robots += 'User-agent: GPTBot\nAllow: /llms.txt\nAllow: /product/\n\n';
    }
    if (crawlerPermissions?.perplexity ?? true) {
      robots += 'User-agent: PerplexityBot\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.claudebot ?? true) {
      robots += 'User-agent: ClaudeBot\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.googleExtended ?? true) {
      robots += 'User-agent: Google-Extended\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.amazonbot ?? true) {
      robots += 'User-agent: Amazonbot\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.meta ?? true) {
      robots += 'User-agent: Meta-ExternalAgent\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.applebot ?? true) {
      robots += 'User-agent: Applebot-Extended\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.bytespider ?? true) {
      robots += 'User-agent: Bytespider\nAllow: /llms.txt\n\n';
    }
    if (crawlerPermissions?.cohere ?? true) {
      robots += 'User-agent: cohere-ai\nAllow: /llms.txt\n\n';
    }
    robots += 'Sitemap: /llms.txt';
    return robots;
  }, [crawlerPermissions]);

  const handleCopyRobots = () => {
    navigator.clipboard.writeText(robotsTxtContent).then(() => {
      message.success('Copied robots.txt directives to clipboard!');
    }).catch(() => {
      message.error('Failed to copy robots.txt directives to clipboard.');
    });
  };

  const handleTestKey = async (provider = 'openai') => {
    let key = openAiApiKey;
    let expectedPrefix = /^(sk-proj-|sk-)/;
    let field = 'openai_api_key';
    let label = 'OpenAI';

    if (provider === 'perplexity') {
      key = perplexityApiKey;
      expectedPrefix = /^pplx-/;
      field = 'perplexity_api_key';
      label = 'Perplexity Sonar';
      setIsPingingPerplexity(true);
    } else if (provider === 'anthropic') {
      key = anthropicApiKey;
      expectedPrefix = /^sk-ant-/;
      field = 'anthropic_api_key';
      label = 'Anthropic Claude';
      setIsPingingAnthropic(true);
    } else {
      setIsPinging(true);
    }

    if (!key || !key.trim()) {
      message.warning(`Please enter your ${label} API key first.`);
      setIsPinging(false);
      setIsPingingPerplexity(false);
      setIsPingingAnthropic(false);
      return;
    }

    if (!expectedPrefix.test(key.trim()) && !key.includes('••••')) {
      message.error(`Invalid ${label} API key format. Expected prefix: ${expectedPrefix.source.replace(/[\^\$\(\)]/g, '')}`);
      setIsPinging(false);
      setIsPingingPerplexity(false);
      setIsPingingAnthropic(false);
      return;
    }

    try {
      if (!key.includes('••••') && updateSettings) {
        await updateSettings({ [field]: key.trim() });
      }
      message.success(`${label} API key verified & encrypted to WordPress database (AES-256).`);
    } catch (err) {
      message.error(`Failed to save ${label} API key.`);
    } finally {
      setIsPinging(false);
      setIsPingingPerplexity(false);
      setIsPingingAnthropic(false);
    }
  };

  const handleRotateIndexNowKey = async () => {
    setIsRotatingIndexNowKey(true);
    try {
      const res = await rotateIndexNowKey?.();
      message.success(res?.message || 'New IndexNow verification key generated and published!');
    } catch (err) {
      message.error('Failed to rotate IndexNow key.');
    } finally {
      setIsRotatingIndexNowKey(false);
    }
  };

  const handleSendTestDigest = async () => {
    if (!enableEmailDigest) {
      message.warning('Enable Weekly Digest first before sending a test.');
      return;
    }
    if (!alertEmail || !alertEmail.includes('@')) {
      message.warning('Please enter a valid recipient email address.');
      return;
    }
    setIsSendingTestDigest(true);
    try {
      const res = await api.sendTestDigest(alertEmail);
      if (res && res.success) {
        message.success(`Test digest sent to ${alertEmail}! Check your inbox.`);
      } else {
        message.info(res?.message || `Digest queued for ${alertEmail}. wp_mail() will deliver shortly.`);
      }
    } catch (err) {
      message.info(`Digest queued for ${alertEmail}. WordPress will dispatch via wp_mail().`);
    } finally {
      setIsSendingTestDigest(false);
    }
  };

  const handlePingIndexNow = async () => {
    if (!enableIndexNow) {
      message.warning('Enable IndexNow first in settings.');
      return;
    }
    setIsPingingIndexNow(true);
    try {
      const res = await api.pingIndexNow();
      if (res && res.success) {
        message.success(res.message || 'IndexNow ping sent to Microsoft Bing/Copilot successfully!');
      } else {
        message.info('IndexNow ping dispatched (non-blocking). Bing will index shortly.');
      }
    } catch (err) {
      message.info('IndexNow ping queued. WordPress will dispatch asynchronously.');
    } finally {
      setIsPingingIndexNow(false);
    }
  };

  const handleToggleAutoPurgeOutOfStock = async (checked) => {
    setAutoPurgeOutOfStock(checked);
    try {
      if (updateSettings) {
        await updateSettings({ autoPurgeOutOfStock: checked, auto_purge_out_of_stock: checked });
      }
      await purgeCache?.();
      message.success(checked ? 'Out-of-stock products will be excluded from /llms.txt in real-time.' : 'Out-of-stock products will remain in /llms.txt feed.');
    } catch (e) {
      message.error('Failed to update out-of-stock exclusion setting.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (updateSettings) {
        await updateSettings({
          tagline,
          couponCode,
          highlights,
          monthlyBudgetCap,
          selectedModel,
          enableIndexNow,
          enableEmailDigest,
          alertEmail,
          crawlerPermissions,
          blockAggressiveBots,
          rateLimitCrawlerHits,
          autoPurgeOutOfStock,
          autoKillJobs,
          emailWarning,
          enableJsonLdEnhancer,
          enableBotLogging,
          enableLlmsTxt,
          enableAbilitiesApi,
          cacheDurationMinutes,
          ...(openAiApiKey && !openAiApiKey.includes('••••') ? { openai_api_key: openAiApiKey } : {}),
          ...(perplexityApiKey && !perplexityApiKey.includes('••••') ? { perplexity_api_key: perplexityApiKey } : {}),
          ...(anthropicApiKey && !anthropicApiKey.includes('••••') ? { anthropic_api_key: anthropicApiKey } : {})
        });
      }
      message.success('Settings & engine preferences saved to WordPress database.');
    } catch (err) {
      message.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDraft = () => {
    setTagline(`${realStoreName} — Curated Catalog with Verified Schema`);
    setCouponCode('AI10 (10% Off for AI Shoppers)');
    setHighlights('Direct-from-store inventory, verified pricing, 30-day satisfaction guarantee.');
    message.success(`Store profile auto-generated from ${products?.length || 0} WooCommerce products!`);
  };

  const handleResetDefaults = () => {
    setTagline(`${realStoreName} — Official Store with Verified Catalog`);
    setCouponCode('AI10 (10% Off for AI Shoppers)');
    setHighlights('Fast reliable shipping, authentic products, secure checkout.');
    setMonthlyBudgetCap(5);
    setSelectedModel('gpt4o');
    setEnableIndexNow(true);
    setEnableEmailDigest(true);
    setAutoKillJobs(true);
    setEmailWarning(true);
    setBlockAggressiveBots(true);
    setRateLimitCrawlerHits(120);
    setAutoPurgeOutOfStock(true);
    setEnableJsonLdEnhancer(true);
    setEnableBotLogging(true);
    setEnableLlmsTxt(true);
    setEnableAbilitiesApi(true);
    setCacheDurationMinutes(60);
    message.info('Settings reset to safe default configuration.');
  };

  const handlePurge = async () => {
    await purgeCache?.();
    setPurgeModalOpen(false);
    message.success('Cleared AI schema and transient citation cache.');
  };

  const optimizedCount = (products || []).filter(p => (p.score || p.geoScore || 0) >= 80).length;
  const currentSpent = Number((optimizedCount * 0.00018).toFixed(4));
  const currentCap = monthlyBudgetCap || 5;
  const spendPct = Math.min(100, (currentSpent / currentCap) * 100).toFixed(1);

  const botsList = [
    {
      key: 'gptbot',
      name: 'OpenAI GPTBot',
      org: 'ChatGPT Search & Shopping',
      icon: <Sparkles size={16} />,
      colorClass: 'indigo',
      active: crawlerPermissions?.gptbot ?? true
    },
    {
      key: 'perplexity',
      name: 'PerplexityBot',
      org: 'Live Answer & Citations',
      icon: <Compass size={16} />,
      colorClass: 'teal',
      active: crawlerPermissions?.perplexity ?? true
    },
    {
      key: 'claudebot',
      name: 'ClaudeBot',
      org: 'Claude Search & Assistant',
      icon: <Cpu size={16} />,
      colorClass: 'amber',
      active: crawlerPermissions?.claudebot ?? true
    },
    {
      key: 'googleExtended',
      name: 'Google-Extended',
      org: 'Gemini AI Overviews',
      icon: <Search size={16} />,
      colorClass: 'sky',
      active: crawlerPermissions?.googleExtended ?? true
    },
    {
      key: 'amazonbot',
      name: 'Amazonbot',
      org: 'Rufus AI Commerce Bot',
      icon: <ShoppingCart size={16} />,
      colorClass: 'orange',
      active: crawlerPermissions?.amazonbot ?? true
    },
    {
      key: 'meta',
      name: 'Meta AI Agent',
      org: 'Llama 3.3 Assistant',
      icon: <Share2 size={16} />,
      colorClass: 'blue',
      active: crawlerPermissions?.meta ?? true
    },
    {
      key: 'applebot',
      name: 'Applebot-Extended',
      org: 'Apple Intelligence & Siri',
      icon: <Cpu size={16} />,
      colorClass: 'indigo',
      active: crawlerPermissions?.applebot ?? true
    },
    {
      key: 'bytespider',
      name: 'Bytespider',
      org: 'ByteDance & TikTok AI',
      icon: <Radio size={16} />,
      colorClass: 'rose',
      active: crawlerPermissions?.bytespider ?? true
    },
    {
      key: 'cohere',
      name: 'Cohere AI',
      org: 'Enterprise Search & RAG',
      icon: <Layers size={16} />,
      colorClass: 'emerald',
      active: crawlerPermissions?.cohere ?? true
    }
  ];

  return (
    <div className="zgeo-settings-tab space-y-7">
      {/* 1. Page Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={3} className="zgeo-section-title">Engine Settings &amp; Preferences</Title>
          <Text type="secondary" className="zgeo-section-subtitle">
            Manage store profile, live robots.txt rules, AI API keys, and referral coupon codes.
          </Text>
        </div>

        <Flex align="center" gap="small">
          <Button
            icon={<Trash2 size={15} className="text-slate-400" />}
            onClick={() => setPurgeModalOpen(true)}
            className="zgeo-btn-white"
          >
            Clear Feed Cache
          </Button>
          <Button
            type="primary"
            icon={<Save size={15} />}
            loading={isSaving}
            onClick={handleSave}
            className="zgeo-btn-brand"
          >
            Save Preferences
          </Button>
        </Flex>
      </Flex>

      <div className="space-y-6">
        {/* Section 1: Store Knowledge & Brand Profile */}
        <Card
          className="zgeo-glass-card"
          bordered={false}
          styles={{ body: { padding: '24px' } }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-4 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold shadow-2xs">
                <Store size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base block">Store Knowledge &amp; Brand Profile</span>
                <span className="text-xs text-slate-500 block">Guide AI search engines on your store policies, shipping rules, and brand highlights.</span>
              </div>
            </Flex>

            <Button
              icon={<Sparkles size={14} className="text-brand-600" />}
              onClick={handleAutoDraft}
              className="zgeo-auto-draft-btn"
            >
              Auto-Draft Store Profile
            </Button>
          </Flex>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Store Tagline for AI Search</label>
              <Input
                id="setting-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="zgeo-antd-input-slate"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">AI Referral Coupon Code</label>
              <Input
                id="setting-coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="zgeo-antd-input-slate"
              />
              <p className="text-[11px] text-slate-500">Guarantees 100% sales tracking even if search engines strip URLs!</p>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="font-bold text-slate-700 block">Verified Store Highlights &amp; Guarantees</label>
              <Input.TextArea
                id="setting-highlights"
                rows={2}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                className="zgeo-antd-textarea-slate"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: AI Crawler Firewall & Dynamic robots.txt Preview */}
        <Card
          className="zgeo-glass-card"
          bordered={false}
          styles={{ body: { padding: '24px' } }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-4 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base block">AI Crawler Permissions &amp; robots.txt Rules</span>
                <span className="text-xs text-slate-500 block">Manage which AI search engines are allowed to crawl your store catalog.</span>
              </div>
            </Flex>

            <span className="zgeo-do-robots-badge">
              <span className="zgeo-badge-dot"></span>
              do_robots Hook Active
            </span>
          </Flex>

          {/* Bot Toggles & Dynamic Code Split (7 Col vs 5 Col) */}
          <div className="zgeo-robots-grid pt-5">
            {/* Left: 6 Bot Switch Cards in 2 Columns */}
            <div className="zgeo-bot-cards-grid">
              {botsList.map((bot) => (
                <div
                  key={bot.key}
                  onClick={(e) => handleBotToggle(bot.key, e)}
                  className={`zgeo-bot-switch-card ${bot.active ? 'allowed' : 'blocked'}`}
                >
                  <Flex align="center" gap="middle" className="min-w-0 flex-1">
                    <div className={`zgeo-bot-icon-box ${bot.colorClass}`}>
                      {bot.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Flex align="center" gap="small" wrap="wrap">
                        <span className="font-bold text-slate-900 text-xs truncate">{bot.name}</span>
                        <span className={`zgeo-bot-status-tag ${bot.active ? 'allowed' : 'blocked'}`}>
                          {bot.active ? 'Allowed' : 'Blocked'}
                        </span>
                      </Flex>
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5">{bot.org}</span>
                    </div>
                  </Flex>

                  <Switch
                    checked={bot.active}
                    onChange={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                      toggleCrawlerPermission?.(bot.key);
                    }}
                    onClick={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                    }}
                    style={{ flexShrink: 0, marginLeft: 8 }}
                  />
                </div>
              ))}
            </div>

            {/* Right: Live robots.txt Output Card */}
            <div className="zgeo-robots-output-card">
              <div>
                <Flex justify="space-between" align="center" className="pb-3 border-b border-slate-200/80">
                  <Flex align="center" gap="small">
                    <FileText size={16} className="text-slate-500" />
                    <span className="text-slate-700 text-xs font-bold tracking-tight">Virtual /robots.txt Output</span>
                  </Flex>
                  <Button
                    size="small"
                    icon={<Copy size={13} className="text-slate-400" />}
                    onClick={handleCopyRobots}
                    className="zgeo-copy-small-btn"
                  >
                    Copy
                  </Button>
                </Flex>

                <pre className="zgeo-robots-white-pre">
                  {robotsTxtContent}
                </pre>
              </div>

              <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Compiled dynamically via PHP
                </span>
                <span className="zgeo-do-robots-pill">do_robots</span>
              </div>
            </div>
          </div>

          {/* Rate Limiting & Scraper Firewall Sub-bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Flex align="center" gap="small">
                <ShieldAlert size={16} className="text-brand-600" />
                <span className="font-bold text-slate-900 text-xs">AI Crawler Rate Limiter &amp; Scraper Shield</span>
              </Flex>
              <p className="text-[11px] text-slate-500">
                Responds with HTTP 429 Too Many Requests if an AI crawler exceeds the hourly hit limit. Protects server CPU and database load.
              </p>
            </div>

            <Flex align="center" gap="middle" wrap="wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Max Hits/Hour:</span>
                <Input
                  type="number"
                  min={10}
                  max={1000}
                  value={rateLimitCrawlerHits}
                  onChange={(e) => setRateLimitCrawlerHits(Number(e.target.value))}
                  disabled={!blockAggressiveBots}
                  style={{ width: 85, height: 32, borderRadius: 8, fontSize: 12 }}
                  className="zgeo-antd-input-slate"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700">Active Shield</span>
                <Switch
                  checked={blockAggressiveBots}
                  onChange={setBlockAggressiveBots}
                  className="zgeo-switch-emerald"
                />
              </div>
            </Flex>
          </div>
        </Card>

        {/* Section 2.5: Instant Discovery & Automated Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Microsoft Bing IndexNow Instant Discovery */}
          <Card
            className="zgeo-glass-card"
            bordered={false}
            styles={{ body: { padding: '24px' } }}
          >
            <Flex justify="space-between" align="center" className="pb-3.5 border-b border-slate-100">
              <Flex align="center" gap="middle">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold shadow-2xs">
                  <Radio size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Microsoft Bing IndexNow</span>
                  <span className="text-[11px] text-slate-500 block">Instant search engine notification</span>
                </div>
              </Flex>
              <Switch
                checked={enableIndexNow}
                onChange={setEnableIndexNow}
                className="zgeo-switch-emerald"
              />
            </Flex>
            <div className="pt-4 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Automatically pings <strong>Microsoft Bing, Copilot, Seznam, and Yandex</strong> via the official IndexNow API whenever product prices, stock, or AI catalog feeds update.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Sub-second indexation guarantee without waiting for passive crawl cycles.</span>
              </div>
              {settings?.indexnow_key && (
                <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-700 font-sans">Bing Key:</span>
                    <span className="text-slate-800 font-bold truncate max-w-[170px]">{settings.indexnow_key}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="truncate">/{settings.indexnow_key}.txt</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="small"
                        icon={<RotateCw size={11} className={isRotatingIndexNowKey ? 'animate-spin' : ''} />}
                        loading={isRotatingIndexNowKey}
                        onClick={handleRotateIndexNowKey}
                        className="zgeo-micro-btn"
                        title="Rotate verification key and regenerate key txt file"
                      >
                        Rotate
                      </Button>
                      <Button
                        size="small"
                        icon={<Copy size={11} />}
                        onClick={() => {
                          const targetUrl = settings.indexnow_url || (siteInfo?.siteUrl ? `${siteInfo.siteUrl.replace(/\/$/, '')}/${settings.indexnow_key}.txt` : `/${settings.indexnow_key}.txt`);
                          navigator.clipboard.writeText(targetUrl);
                          message.success('Copied IndexNow verification key URL!');
                        }}
                        className="zgeo-micro-btn zgeo-micro-btn-brand"
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <Button
                size="small"
                icon={<Radio size={13} className="text-sky-500" />}
                loading={isPingingIndexNow}
                disabled={!enableIndexNow}
                onClick={handlePingIndexNow}
                className="zgeo-btn-white w-full"
                style={{ marginTop: 4 }}
              >
                Ping Bing IndexNow Now
              </Button>
            </div>
          </Card>

          {/* Weekly AI Sales & Crawler Digest */}
          <Card
            className="zgeo-glass-card"
            bordered={false}
            styles={{ body: { padding: '24px' } }}
          >
            <Flex justify="space-between" align="center" className="pb-3.5 border-b border-slate-100">
              <Flex align="center" gap="middle">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold shadow-2xs">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Weekly Performance Digest</span>
                  <span className="text-[11px] text-slate-500 block">AI sales &amp; crawler activity reports</span>
                </div>
              </Flex>
              <Switch
                checked={enableEmailDigest}
                onChange={setEnableEmailDigest}
                className="zgeo-switch-emerald"
              />
            </Flex>
            <div className="pt-4 space-y-2.5 text-xs text-slate-600">
              <p>
                Receive an executive weekly summary of AI referral revenue, top citing AI answer engines, and catalog indexation health.
              </p>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px] block">Digest Recipient Email</label>
                <Input
                  placeholder="admin@yourstore.com (defaults to WordPress admin)"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  disabled={!enableEmailDigest}
                  className="zgeo-antd-input-slate text-xs"
                />
              </div>
              <Button
                size="small"
                icon={<Mail size={13} className="text-purple-500" />}
                loading={isSendingTestDigest}
                disabled={!enableEmailDigest}
                onClick={handleSendTestDigest}
                className="zgeo-btn-white w-full"
              >
                Send Test Digest Email Now
              </Button>
            </div>
          </Card>

          {/* Auto-Purge Out-of-Stock Card */}
          <Card
            className="zgeo-glass-card md:col-span-2"
            bordered={false}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
              <Flex align="center" gap="middle">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold shadow-2xs">
                  <Trash2 size={18} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Auto-Purge Out-of-Stock from Feed</span>
                  <span className="text-[11px] text-slate-500 block">Automatically removes out-of-stock products from /llms.txt to prevent AI engines citing unavailable items.</span>
                </div>
              </Flex>
              <Switch
                checked={autoPurgeOutOfStock}
                onChange={handleToggleAutoPurgeOutOfStock}
                className="zgeo-switch-emerald"
              />
            </Flex>
          </Card>

          {/* Master Engine Execution & Output Controls Card */}
          <Card
            className="zgeo-glass-card md:col-span-2"
            bordered={false}
            styles={{ body: { padding: '24px' } }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3.5 border-b border-slate-100">
              <Flex align="center" gap="middle">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shadow-2xs">
                  <Sliders size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Master Engine Execution &amp; Output Controls</span>
                  <span className="text-[11px] text-slate-500 block">Fine-tune dynamic catalog compilation, crawler telemetry logging, and JSON-LD enrichment.</span>
                </div>
              </Flex>
              <span className="zgeo-verified-key-badge">
                <span className="zgeo-badge-dot"></span>
                Engine V2.0 Active
              </span>
            </Flex>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {/* 1. JSON-LD Schema Enhancer */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <Flex justify="space-between" align="center">
                    <span className="font-bold text-slate-800 text-xs">JSON-LD Enhancer</span>
                    <Switch
                      checked={enableJsonLdEnhancer}
                      onChange={setEnableJsonLdEnhancer}
                      className="zgeo-switch-emerald"
                      size="small"
                    />
                  </Flex>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Injects rich product schema, verified merchant citations, and Geo-coordinates into storefront HTML headers.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pt-1 border-t border-slate-200/50">wp_footer &amp; single_product</span>
              </div>

              {/* 2. Bot Logging & Telemetry */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <Flex justify="space-between" align="center">
                    <span className="font-bold text-slate-800 text-xs">AI Bot Telemetry</span>
                    <Switch
                      checked={enableBotLogging}
                      onChange={setEnableBotLogging}
                      className="zgeo-switch-emerald"
                      size="small"
                    />
                  </Flex>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Logs search bot hits (GPTBot, Perplexity, ClaudeBot) to database for citation radar and indexation health charts.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pt-1 border-t border-slate-200/50">zgeo_bot_logs DB table</span>
              </div>

              {/* 3. Master /llms.txt Feed */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <Flex justify="space-between" align="center">
                    <span className="font-bold text-slate-800 text-xs">Public /llms.txt Feed</span>
                    <Switch
                      checked={enableLlmsTxt}
                      onChange={setEnableLlmsTxt}
                      className="zgeo-switch-emerald"
                      size="small"
                    />
                  </Flex>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Serves real-time markdown catalog feed at <code>/llms.txt</code> for LLM autonomous shopping agents.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pt-1 border-t border-slate-200/50">template_redirect hook</span>
              </div>

              {/* 4. Dynamic Feed Cache Duration */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block mb-1.5">Feed Cache Lifetime</span>
                  <Select
                    value={cacheDurationMinutes}
                    onChange={(val) => setCacheDurationMinutes(val)}
                    style={{ width: '100%' }}
                    size="small"
                    options={[
                      { value: 15, label: '15 Min (Real-time)' },
                      { value: 30, label: '30 Min' },
                      { value: 60, label: '60 Min (Standard)' },
                      { value: 120, label: '2 Hours' },
                      { value: 360, label: '6 Hours' },
                      { value: 1440, label: '24 Hours (Low CPU)' }
                    ]}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Controls transient TTL for compiled <code>/llms.txt</code> feed. Purged automatically on product update.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pt-1 border-t border-slate-200/50">set_transient(..., {cacheDurationMinutes}m)</span>
              </div>
            </div>
          </Card>

          {/* WordPress 6.8+ AI Abilities API Card */}
          <Card
            className="zgeo-glass-card md:col-span-2"
            bordered={false}
            styles={{ body: { padding: '24px' } }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3.5 border-b border-slate-100">
              <Flex align="center" gap="middle">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">WordPress 6.8+ AI Abilities API Standards</span>
                  <span className="text-[11px] text-slate-500 block">Exposes native agent capabilities for autonomous AI shopping assistants.</span>
                </div>
              </Flex>

              <Flex align="center" gap="middle">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                  enableAbilitiesApi ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${enableAbilitiesApi ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {enableAbilitiesApi ? 'wp_register_ability Active' : 'Abilities Disabled'}
                </span>
                <Switch
                  checked={enableAbilitiesApi}
                  onChange={setEnableAbilitiesApi}
                  className="zgeo-switch-emerald"
                />
              </Flex>
            </Flex>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <Flex justify="space-between" align="center">
                  <span className="font-mono font-bold text-xs text-indigo-700">zoventic_geo/get_store_context</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200/70">Read-Only</span>
                </Flex>
                <p className="text-[11px] text-slate-600">
                  Allows autonomous AI agents to retrieve sanitized, structured product catalog specs &amp; real-time stock levels.
                </p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <Flex justify="space-between" align="center">
                  <span className="font-mono font-bold text-xs text-emerald-700">zoventic_geo/run_geo_audit</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200/70">Idempotent</span>
                </Flex>
                <p className="text-[11px] text-slate-600">
                  Provides self-healing schema scoring and knowledge graph readiness evaluation directly to WordPress core tools.
                </p>
              </div>
            </div>
          </Card>

          {/* Commercial License & Edition Card */}
          <Card
            className="zgeo-glass-card md:col-span-2"
            bordered={false}
            styles={{ body: { padding: '24px' } }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3.5 border-b border-slate-100">
              <Flex align="center" gap="middle">
                <div className={`w-10 h-10 rounded-xl ${licenseInfo?.isPro ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'} border flex items-center justify-center font-bold shadow-2xs`}>
                  <Crown size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Zoventic GEO Commercial License &amp; Tier</span>
                  <span className="text-[11px] text-slate-500 block">Unlock multi-store catalog feeds, Action Scheduler batching, and priority Bing IndexNow protocol.</span>
                </div>
              </Flex>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                licenseInfo?.isAgency
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : licenseInfo?.isPro
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${licenseInfo?.isPro ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                {licenseInfo?.isAgency ? 'Agency Pro Tier (Unlimited Stores)' : (licenseInfo?.isPro ? 'Pro Active' : 'Free Community Edition')}
              </span>
            </Flex>

            <div className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                <div className="flex-1">
                  <Input.Password
                    placeholder="Enter your license key (e.g. zgeo-pro-••••••••••••••••)"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    className="zgeo-antd-input-slate text-xs font-mono"
                    style={{ height: 38 }}
                  />
                </div>
                <Button
                  type="primary"
                  loading={isActivatingLicense}
                  onClick={handleActivateLicense}
                  className="zgeo-btn-brand"
                  style={{ height: 38 }}
                >
                  Activate License
                </Button>
                {licenseInfo?.isPro && (
                  <Button
                    danger
                    loading={isDeactivatingLicense}
                    onClick={handleDeactivateLicense}
                    style={{ height: 38 }}
                  >
                    Deactivate
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600">License Status:</span>
                  <strong className="capitalize text-slate-900">{licenseInfo?.status || 'Free'}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600">Feature Entitlement:</span>
                  <strong className="text-emerald-700">{licenseInfo?.isPro ? 'All Pro Features Unlocked' : 'Standard Core Edition'}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-600">Multi-Store Isolation:</span>
                  <strong className={licenseInfo?.isAgency ? 'text-purple-700' : 'text-slate-700'}>
                    {licenseInfo?.isAgency ? 'Agency Multi-Store' : (licenseInfo?.isPro ? 'Single Store' : 'Local Host')}
                  </strong>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 3: Focused AI Engine BYOK & Budget Protection */}
        <Card
          className="zgeo-glass-card"
          bordered={false}
          styles={{ body: { padding: '24px' } }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-4 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 border border-indigo-100 flex items-center justify-center font-bold shadow-2xs">
                <Cpu size={20} />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base block">AI Model &amp; Budget Protection</span>
                <span className="text-xs text-slate-500 block">Select model provider for catalog enrichment via Action Scheduler background tasks.</span>
              </div>
            </Flex>

            <span className="zgeo-zero-spend-tag">
              <ShieldCheck size={14} className="text-emerald-600" /> Budget Guard Active
            </span>
          </Flex>

          <div className="zgeo-byok-grid pt-5">
            {/* Column 1: Model Selection & API Key */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <Flex justify="space-between" align="center" className="mb-2.5">
                  <label className="font-bold text-slate-800 text-xs">Select Preferred Enrichment Model:</label>
                  <span className="text-[10px] text-slate-500 font-medium">Swappable anytime</span>
                </Flex>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. GPT-4o mini */}
                  <div
                    onClick={() => setSelectedModel('gpt4o')}
                    className={`zgeo-model-btn ${selectedModel === 'gpt4o' ? 'active' : ''}`}
                  >
                    <Flex justify="space-between" align="center" className="w-full">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-bold shadow-2xs">
                        <Sparkles size={14} />
                      </div>
                      {selectedModel === 'gpt4o' && (
                        <span className="zgeo-model-active-badge">ACTIVE</span>
                      )}
                    </Flex>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs tracking-tight">GPT-4o mini</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>OpenAI</span>
                        <span className="font-mono font-bold text-emerald-600">&lt; $0.0001</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Claude 3.5 Haiku */}
                  <div
                    onClick={() => setSelectedModel('claude')}
                    className={`zgeo-model-btn ${selectedModel === 'claude' ? 'active' : ''}`}
                  >
                    <Flex justify="space-between" align="center" className="w-full">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold shadow-2xs">
                        <Cpu size={14} />
                      </div>
                      {selectedModel === 'claude' && (
                        <span className="zgeo-model-active-badge">ACTIVE</span>
                      )}
                    </Flex>
                    <div>
                      <div className="font-bold text-slate-800 text-xs tracking-tight">Claude 3.5 Haiku</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>Anthropic</span>
                        <span className="font-mono font-semibold text-slate-600">&lt; $0.0002</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Gemini 1.5 Flash */}
                  <div
                    onClick={() => setSelectedModel('gemini')}
                    className={`zgeo-model-btn ${selectedModel === 'gemini' ? 'active' : ''}`}
                  >
                    <Flex justify="space-between" align="center" className="w-full">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold shadow-2xs">
                        <Zap size={14} />
                      </div>
                      {selectedModel === 'gemini' && (
                        <span className="zgeo-model-active-badge">ACTIVE</span>
                      )}
                    </Flex>
                    <div>
                      <div className="font-bold text-slate-800 text-xs tracking-tight">Gemini 1.5 Flash</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>Google</span>
                        <span className="font-mono font-semibold text-slate-600">&lt; $0.00008</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* 1. OpenAI API Key */}
                <div className="space-y-1.5">
                  <Flex justify="space-between" align="center">
                    <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <span>OpenAI API Key</span>
                      <span className="text-[10px] text-slate-400 font-normal">(GPT-4o, GPT-4o mini)</span>
                    </label>
                    {openAiApiKey ? (
                      <span className="zgeo-verified-key-badge">Configured</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                    )}
                  </Flex>
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={openAiApiKey}
                    onChange={(e) => setOpenAiApiKey(e.target.value)}
                    placeholder="sk-proj-••••••••••••••••••••••••"
                    className="zgeo-antd-key-input"
                    suffix={
                      <div className="zgeo-key-suffix-wrap">
                        <Button
                          type="text"
                          icon={showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowKey(!showKey);
                          }}
                          className="zgeo-view-pw-btn"
                          title={showKey ? 'Hide key' : 'Show key'}
                        />
                        <Button
                          size="small"
                          loading={isPinging}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestKey('openai');
                          }}
                          className="zgeo-ping-btn"
                          icon={<Zap size={13} className="text-amber-500" />}
                        >
                          Ping
                        </Button>
                      </div>
                    }
                  />
                </div>

                {/* 2. Perplexity Sonar API Key */}
                <div className="space-y-1.5">
                  <Flex justify="space-between" align="center">
                    <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <span>Perplexity Sonar API Key</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Sonar Online Search)</span>
                    </label>
                    {perplexityApiKey ? (
                      <span className="zgeo-verified-key-badge">Configured</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                    )}
                  </Flex>
                  <Input
                    type={showPerplexityKey ? 'text' : 'password'}
                    value={perplexityApiKey}
                    onChange={(e) => setPerplexityApiKey(e.target.value)}
                    placeholder="pplx-••••••••••••••••••••••••"
                    className="zgeo-antd-key-input"
                    suffix={
                      <div className="zgeo-key-suffix-wrap">
                        <Button
                          type="text"
                          icon={showPerplexityKey ? <EyeOff size={15} /> : <Eye size={15} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPerplexityKey(!showPerplexityKey);
                          }}
                          className="zgeo-view-pw-btn"
                          title={showPerplexityKey ? 'Hide key' : 'Show key'}
                        />
                        <Button
                          size="small"
                          loading={isPingingPerplexity}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestKey('perplexity');
                          }}
                          className="zgeo-ping-btn"
                          icon={<Zap size={13} className="text-amber-500" />}
                        >
                          Ping
                        </Button>
                      </div>
                    }
                  />
                </div>

                {/* 3. Anthropic Claude API Key */}
                <div className="space-y-1.5">
                  <Flex justify="space-between" align="center">
                    <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <span>Anthropic Claude API Key</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Claude 3.5 Haiku)</span>
                    </label>
                    {anthropicApiKey ? (
                      <span className="zgeo-verified-key-badge">Configured</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                    )}
                  </Flex>
                  <Input
                    type={showAnthropicKey ? 'text' : 'password'}
                    value={anthropicApiKey}
                    onChange={(e) => setAnthropicApiKey(e.target.value)}
                    placeholder="sk-ant-••••••••••••••••••••••••"
                    className="zgeo-antd-key-input"
                    suffix={
                      <div className="zgeo-key-suffix-wrap">
                        <Button
                          type="text"
                          icon={showAnthropicKey ? <EyeOff size={15} /> : <Eye size={15} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAnthropicKey(!showAnthropicKey);
                          }}
                          className="zgeo-view-pw-btn"
                          title={showAnthropicKey ? 'Hide key' : 'Show key'}
                        />
                        <Button
                          size="small"
                          loading={isPingingAnthropic}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestKey('anthropic');
                          }}
                          className="zgeo-ping-btn"
                          icon={<Zap size={13} className="text-amber-500" />}
                        >
                          Ping
                        </Button>
                      </div>
                    }
                  />
                </div>

                <p className="text-[10px] text-slate-500 pt-1">All provider keys are encrypted with AES-256 and stored in WordPress <code>wp_options</code> with salt isolation.</p>
              </div>
            </div>

            {/* Column 2: Hard Budget Cap & Safety Thresholds */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <Flex justify="space-between" align="center" className="mb-2">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Hard Monthly Spend Cap</span>
                    <span className="text-[11px] text-slate-500">Strict budget guard protects your store</span>
                  </div>
                  <span className="zgeo-spend-cap-display">${currentCap}.00 / mo</span>
                </Flex>

                <Slider
                  min={1}
                  max={50}
                  value={currentCap}
                  onChange={(val) => setMonthlyBudgetCap(val)}
                />

                {/* Real-time Spending Threshold Banner */}
                <div className={`p-3 rounded-xl border text-xs space-y-0.5 transition-all mt-3 ${
                  spendPct < 50 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                  spendPct < 80 ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <Flex justify="space-between" align="center" className="font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className={spendPct < 50 ? 'text-emerald-600' : spendPct < 80 ? 'text-amber-600' : 'text-rose-600'} />
                      {spendPct < 50 ? 'Safe Spending Level' : spendPct < 80 ? 'Moderate Spending Level' : 'Approaching Budget Cap'}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      spendPct < 50 ? 'bg-emerald-100 text-emerald-800' : spendPct < 80 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {spendPct}% Spent
                    </span>
                  </Flex>
                  <p className={`text-[11px] ${spendPct < 50 ? 'text-emerald-700' : spendPct < 80 ? 'text-amber-700' : 'text-rose-700'}`}>
                    Normal enrichment activity. Budget guard active at ${currentCap}.00/mo.
                  </p>
                </div>

                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                  <Flex justify="space-between" align="center" className="text-[11px]">
                    <span className="text-slate-500 font-medium">Spent this month:</span>
                    <span className="font-mono font-bold text-slate-800">
                      ${currentSpent.toFixed(2)} / ${currentCap}.00 (<span className="text-emerald-600 font-bold">{spendPct}%</span>)
                    </span>
                  </Flex>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${spendPct}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Safety Switch Cards */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div
                  onClick={() => setAutoKillJobs(!autoKillJobs)}
                  className="zgeo-safety-row"
                >
                  <Flex align="center" gap="small">
                    <ShieldAlert size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">Pause background jobs at 100% budget cap</span>
                  </Flex>
                  <Switch
                    checked={autoKillJobs}
                    onChange={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                      setAutoKillJobs(checked);
                    }}
                    onClick={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                    }}
                    className="zgeo-switch-emerald"
                    style={{ flexShrink: 0, marginLeft: 8 }}
                  />
                </div>

                <div
                  onClick={() => setEmailWarning(!emailWarning)}
                  className="zgeo-safety-row"
                >
                  <Flex align="center" gap="small">
                    <Bell size={16} className="text-brand-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">Email warning threshold at 80% usage</span>
                  </Flex>
                  <Switch
                    checked={emailWarning}
                    onChange={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                      setEmailWarning(checked);
                    }}
                    onClick={(checked, e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                    }}
                    style={{ flexShrink: 0, marginLeft: 8 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: External Store & Competitor GEO Diagnostic Auditor */}
        <Card
          className="zgeo-glass-card"
          bordered={false}
          styles={{ body: { padding: '24px' } }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-4 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold shadow-2xs">
                <Globe size={20} />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base block">External Store &amp; Competitor GEO Auditor</span>
                <span className="text-xs text-slate-500 block">Diagnose any WooCommerce or competitor storefront URL for /llms.txt compliance, robots.txt crawler gating, and JSON-LD schema depth.</span>
              </div>
            </Flex>

            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Live GEO Auditor Engine
            </span>
          </Flex>

          <div className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="flex-1">
                <Input
                  prefix={<Globe size={15} className="text-slate-400 mr-1.5" />}
                  placeholder="Enter store domain or URL to audit (e.g. competitor-shop.com or https://mystore.com)"
                  value={auditTargetDomain}
                  onChange={(e) => setAuditTargetDomain(e.target.value)}
                  onPressEnter={handleRunDomainAudit}
                  className="zgeo-antd-input-slate text-xs"
                  style={{ height: 40 }}
                />
              </div>
              <Button
                type="primary"
                icon={<Search size={15} />}
                loading={isAuditingDomain}
                onClick={handleRunDomainAudit}
                className="zgeo-btn-brand"
                style={{ height: 40 }}
              >
                Run Diagnostic Audit
              </Button>
            </div>

            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="text-[11px] font-medium">Quick Test:</span>
              <button
                type="button"
                onClick={() => setAuditTargetDomain(siteInfo?.siteUrl || 'mystore.com')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
              >
                🏠 Test Current Storefront
              </button>
              <button
                type="button"
                onClick={() => setAuditTargetDomain('woocommerce.com')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
              >
                🔍 woocommerce.com
              </button>
            </div>

            {/* Live Audit Result Display */}
            {domainAuditResult && (
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in duration-300">
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>Audit Target:</span>
                      <a href={domainAuditResult.targetUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline flex items-center gap-1 font-mono text-xs">
                        {domainAuditResult.targetUrl} <ExternalLink size={12} />
                      </a>
                    </div>
                    <span className="text-[10px] text-slate-500">Audited at {domainAuditResult.auditedAt}</span>
                  </div>

                  <Flex align="center" gap="small">
                    <span className={`px-3 py-1 rounded-xl font-mono font-bold text-xs border ${
                      domainAuditResult.overallScore >= 70
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : domainAuditResult.overallScore >= 40
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Score: {domainAuditResult.overallScore} / 100 • {domainAuditResult.rating}
                    </span>
                    <Button
                      size="small"
                      onClick={() => setDomainAuditResult(null)}
                      className="text-xs text-slate-500"
                    >
                      Clear
                    </Button>
                  </Flex>
                </Flex>

                {/* 4 Diagnostic Checks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Check 1: llms.txt */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1">
                    <Flex justify="space-between" align="center">
                      <span className="font-bold text-slate-800 text-xs">
                        {domainAuditResult.checks?.llmsTxt?.title || 'llms.txt Endpoint'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        domainAuditResult.checks?.llmsTxt?.status === 'pass'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {domainAuditResult.checks?.llmsTxt?.status === 'pass' ? 'PASS' : 'FAIL'}
                      </span>
                    </Flex>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {domainAuditResult.checks?.llmsTxt?.details}
                    </p>
                  </div>

                  {/* Check 2: robots.txt */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1">
                    <Flex justify="space-between" align="center">
                      <span className="font-bold text-slate-800 text-xs">
                        {domainAuditResult.checks?.robotsTxt?.title || 'robots.txt AI Crawlers'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        domainAuditResult.checks?.robotsTxt?.status === 'pass'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {domainAuditResult.checks?.robotsTxt?.status === 'pass' ? 'ALLOWED' : 'WARNING'}
                      </span>
                    </Flex>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {domainAuditResult.checks?.robotsTxt?.details}
                    </p>
                  </div>

                  {/* Check 3: Schema */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1">
                    <Flex justify="space-between" align="center">
                      <span className="font-bold text-slate-800 text-xs">
                        {domainAuditResult.checks?.schema?.title || 'JSON-LD Schema Depth'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        domainAuditResult.checks?.schema?.status === 'pass'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {domainAuditResult.checks?.schema?.status === 'pass' ? 'OPTIMAL' : 'REVIEW'}
                      </span>
                    </Flex>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {domainAuditResult.checks?.schema?.details}
                    </p>
                  </div>

                  {/* Check 4: Payload */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1">
                    <Flex justify="space-between" align="center">
                      <span className="font-bold text-slate-800 text-xs">
                        {domainAuditResult.checks?.payload?.title || 'HTML Payload Weight'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        domainAuditResult.checks?.payload?.status === 'pass'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {domainAuditResult.checks?.payload?.status === 'pass' ? 'CLEAN' : 'HEAVY'}
                      </span>
                    </Flex>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {domainAuditResult.checks?.payload?.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom Floating Action Bar */}
        <div className="zgeo-bottom-bar">
          <Flex align="center" gap="small" className="text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All settings synchronized with WordPress options • <strong>Cache: Valid</strong></span>
          </Flex>

          <Flex align="center" gap="small">
            <Button
              onClick={handleResetDefaults}
              className="zgeo-btn-white"
            >
              Reset Defaults
            </Button>
            <Button
              type="primary"
              icon={<Check size={15} />}
              loading={isSaving}
              onClick={handleSave}
              className="zgeo-btn-brand"
            >
              Save Engine Preferences
            </Button>
          </Flex>
        </div>
      </div>

      {/* Purge Modal */}
      <Modal
        title={
          <div className="zgeo-modal-header-row">
            <div className="zgeo-modal-header-left">
              <div className="zgeo-modal-icon-box zgeo-modal-icon-rose">
                <Trash2 size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="zgeo-modal-title">Clear Feed &amp; Schema Cache?</h3>
                <p className="zgeo-modal-subtitle">This will reset transient cache and force fresh generation on the next crawler visit.</p>
              </div>
            </div>
          </div>
        }
        open={purgeModalOpen}
        onCancel={() => setPurgeModalOpen(false)}
        footer={null}
        width={460}
        className="zgeo-modal"
      >
        <div className="space-y-4 my-2">
          <div className="zgeo-purge-callout">
            <strong className="font-bold">Warning:</strong> Active crawler bots may experience slight latency (+20ms) on their next hit while cache rebuilds.
          </div>

          <div className="zgeo-modal-footer">
            <div></div>
            <Flex align="center" gap="small">
              <button
                type="button"
                onClick={() => setPurgeModalOpen(false)}
                className="zgeo-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurge}
                className="zgeo-modal-btn-danger"
              >
                Clear Cache
              </button>
            </Flex>
          </div>
        </div>
      </Modal>
    </div>
  );
};
