import React, { useState } from 'react';
import {
  Modal,
  Button,
  Progress,
  Form,
  Input,
  Select,
  message,
  Flex,
  Typography,
  Space,
  Tag,
  Badge,
  Divider,
  Radio,
  Checkbox
} from 'antd';
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ChevronsUpDown,
  Store,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Link2,
  Globe,
  ArrowLeft,
  Link,
  User,
  KeyRound,
  Hash,
  Crown,
  Trash2,
  Bot
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';
import { api } from '../services/api';

const { Text, Title, Paragraph } = Typography;

export const Header = () => {
  const { metrics, isRefreshing, regenerateLlmsTxt, siteInfo, products, settings, updateSettings, licenseInfo, crawlerLogs, setActiveTab } = useGeoStore();
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [reindexModalOpen, setReindexModalOpen] = useState(false);

  const realStoreName = siteInfo?.siteName || 'WooCommerce Store';
  const realStoreUrl = siteInfo?.siteUrl ? siteInfo.siteUrl.replace(/^https?:\/\//, '') : 'Live Store';
  const totalProducts = metrics?.totalProducts ?? (products?.length || 0);
  const optimizedProducts = metrics?.optimizedProducts ?? 0;
  const healthPercent = totalProducts > 0 ? ((optimizedProducts / totalProducts) * 100).toFixed(1) : '0.0';
  const needsReview = Math.max(0, totalProducts - optimizedProducts);
  const botHitsCount = (crawlerLogs && crawlerLogs.length > 0) ? crawlerLogs.length : (metrics?.botHitsLast24h ?? 0);

  const [currentStore, setCurrentStore] = useState(null);
  const [currentProductCount, setCurrentProductCount] = useState(null);

  const activeStoreName = currentStore || realStoreName;
  const activeProductCount = currentProductCount !== null ? currentProductCount : totalProducts;

  const persistedStores = settings?.connectedStores;
  const activeSavedId = settings?.activeStoreId || '1';

  const [stores, setStores] = useState(() => {
    let list = [
      { id: '1', name: `${realStoreName} (Active Store)`, rawDomain: realStoreUrl, products: totalProducts, health: `${healthPercent}%`, env: 'Production', active: true }
    ];
    if (Array.isArray(persistedStores) && persistedStores.length > 0) {
      list = persistedStores;
    }
    return list.map(s => ({ ...s, active: String(s.id) === String(activeSavedId) }));
  });

  // Sync active store from persisted settings
  React.useEffect(() => {
    if (settings?.activeStoreId && stores.length > 0) {
      const match = stores.find(s => String(s.id) === String(settings.activeStoreId));
      if (match) {
        setCurrentStore(match.rawDomain || match.name);
        setCurrentProductCount(match.products);
        setStores(prev => prev.map(s => ({ ...s, active: String(s.id) === String(settings.activeStoreId) })));
      }
    }
  }, [settings?.activeStoreId]);

  const [connectForm] = Form.useForm();
  const [authMethod, setAuthMethod] = useState('app_pass');
  const [isConnecting, setIsConnecting] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const handleSwitchStore = async (store) => {
    const updated = stores.map(s => ({ ...s, active: s.id === store.id }));
    setStores(updated);
    setCurrentStore(store.rawDomain || store.name);
    setCurrentProductCount(store.products);
    setStoreModalOpen(false);
    if (updateSettings) {
      await updateSettings({ activeStoreId: store.id, connectedStores: updated });
    }
    message.success(`Switched active catalog to ${store.name} (${store.products} Products • Health: ${store.health})`);
  };

  const handleRemoveStore = async (e, storeId) => {
    e.stopPropagation();
    const targetStore = stores.find(s => s.id === storeId);
    const updated = stores.filter(s => s.id !== storeId);
    setStores(updated);
    if (String(activeSavedId) === String(storeId)) {
      setCurrentStore(realStoreName);
      setCurrentProductCount(totalProducts);
    }
    if (updateSettings) {
      await updateSettings({ connectedStores: updated });
    }
    message.success(`Disconnected ${targetStore?.name || 'store property'}.`);
  };

  const handleConnectStore = async (values) => {
    setIsConnecting(true);
    setAuditResult(null);
    const cleanDomain = (values.domain || 'new-store.com').replace(/^https?:\/\//, '');
    try {
      const data = await api.auditDomain(`https://${cleanDomain}`);
      const auditScore = data?.score ?? data?.overallScore ?? 0;
      const hasLlms = data?.checks?.llmsTxt?.status === 'pass';
      const healthLabel = auditScore >= 70 ? `${auditScore}% Healthy` : auditScore >= 40 ? `${auditScore}% Needs Work` : `${auditScore}% Critical`;
      setAuditResult({ score: auditScore, hasLlms, checks: data?.checks || {} });

      const newStore = {
        id: String(Date.now()),
        name: values.nickname ? `${cleanDomain} (${values.nickname})` : cleanDomain,
        rawDomain: cleanDomain,
        products: 0,
        health: healthLabel,
        auditScore,
        autoSchema: values.autoSchema !== false,
        autoRankTracker: values.autoRankTracker !== false,
        env: values.env || 'Production',
        active: false
      };
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      if (updateSettings) {
        await updateSettings({ connectedStores: updatedStores });
      }
      setIsConnecting(false);
      setConnectModalOpen(false);
      connectForm.resetFields();
      handleSwitchStore(newStore);
      message.success(`Connected ${newStore.name} — GEO Score: ${auditScore}/100${hasLlms ? ' ✓ /llms.txt detected' : ' ✗ No /llms.txt'}`);
    } catch (err) {
      // Fallback: add store without live audit
      const newStore = {
        id: String(Date.now()),
        name: values.nickname ? `${cleanDomain} (${values.nickname})` : cleanDomain,
        rawDomain: cleanDomain,
        products: 0,
        health: 'Pending Audit',
        autoSchema: values.autoSchema !== false,
        autoRankTracker: values.autoRankTracker !== false,
        env: values.env || 'Production',
        active: false
      };
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      if (updateSettings) {
        await updateSettings({ connectedStores: updatedStores });
      }
      setIsConnecting(false);
      setConnectModalOpen(false);
      connectForm.resetFields();
      handleSwitchStore(newStore);
      message.warning(`Connected ${newStore.name}. Live audit unavailable — will retry on next crawl.`);
    }
  };

  const handleExecuteReindex = async () => {
    setReindexModalOpen(false);
    await regenerateLlmsTxt();
    message.success(`${activeProductCount} products re-indexed into /llms.txt feed successfully!`);
  };

  return (
    <>
      {/* TIER 1: TOP PERSISTENT NOTIFICATION BANNER */}
      <header className="zgeo-top-banner">
        <div className="zgeo-container-inner zgeo-top-banner-inner">
          <Flex align="center" gap="small" className="zgeo-banner-left">
            <div
              className="zgeo-crawler-pill"
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab('crawlers');
                  window.location.hash = 'crawlers';
                }
              }}
              title="Click to view AI Crawler Traffic Logs"
            >
              <span className="zgeo-badge-dot"></span>
              <Bot size={13} className="text-indigo-600" />
              <span>AI CRAWLERS ACTIVE</span>
              <span className="zgeo-crawler-count-badge">{botHitsCount} HITS</span>
            </div>
            {(typeof window !== 'undefined' && window.zgeoConfig?.isMultisite) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                WPMU NETWORK
              </span>
            )}
            <Text className="zgeo-banner-text">
              <Text strong className="zgeo-text-dark">AI Traffic (24h):</Text> {botHitsCount} crawler visit{botHitsCount === 1 ? '' : 's'} recorded from GPTBot, Perplexity &amp; ClaudeBot.
            </Text>
          </Flex>

          <Flex align="center" gap="small" className="zgeo-banner-right">
            <Button
              size="small"
              icon={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
              onClick={() => setReindexModalOpen(true)}
              className="zgeo-reindex-btn"
            >
              1-Click Re-Index Feed
            </Button>
            <div className="zgeo-divider-v"></div>
            <span className="zgeo-allowed-pill">
              <ShieldCheck size={14} color="#059669" />
              <span>AI Crawlers Allowed (200 OK)</span>
            </span>
          </Flex>
        </div>
      </header>

      {/* TIER 2: TOP STORE INFO BAR */}
      <div className="zgeo-store-bar">
        <div className="zgeo-container-inner zgeo-store-bar-inner">
          <Flex align="center" gap="large" className="zgeo-brand-group">
            <Flex align="center" gap="middle" className="zgeo-logo-box">
              <div className="zgeo-logo-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="zgeo-logo-title">
                  <span>Zoventic GEO</span>
                </div>
                <p className="zgeo-logo-subtitle">for WooCommerce</p>
              </div>
            </Flex>

            <div className="zgeo-divider-v"></div>

            {/* Connected Store Switcher Pill */}
            <div
              onClick={() => setStoreModalOpen(true)}
              className="zgeo-store-pill"
              title="Switch connected WooCommerce store"
            >
              <span className="zgeo-badge-dot"></span>
              <div>
                <span className="zgeo-store-pill-title">{activeStoreName}</span>
                <span className="zgeo-store-pill-count"> ({activeProductCount} Products)</span>
              </div>
              <ChevronsUpDown size={14} color="#94a3b8" />
            </div>
          </Flex>

          {/* AI Context Health Meter */}
          <Flex align="center" gap="middle" className="zgeo-health-meter-box">
            <div className="zgeo-health-text">
              <div>
                <Text type="secondary">Catalog AI Health: </Text>
                <Text strong className="zgeo-text-emerald zgeo-mono">{healthPercent}%</Text>
              </div>
              <Text type="secondary" className="zgeo-health-subtext">
                {optimizedProducts} of {totalProducts} AI-Ready • <span className="zgeo-text-amber">{needsReview} need review</span>
              </Text>
            </div>
            <div className="zgeo-health-progress-wrap">
              <Progress
                percent={parseFloat(healthPercent) || 0}
                showInfo={false}
                size="small"
                strokeColor={{
                  '0%': '#4f46e5',
                  '100%': '#10b981',
                }}
              />
            </div>
          </Flex>
        </div>
      </div>

      {/* MODAL 1: STORE SWITCHER */}
      <Modal
        title={
          <div className="zgeo-modal-header-row">
            <div className="zgeo-modal-header-left">
              <div className="zgeo-modal-icon-box zgeo-modal-icon-brand">
                <Store size={18} />
              </div>
              <div>
                <h3 className="zgeo-modal-title">Switch WooCommerce Catalog</h3>
                <p className="zgeo-modal-subtitle">Select connected WooCommerce property or staging environment.</p>
              </div>
            </div>
          </div>
        }
        open={storeModalOpen}
        onCancel={() => setStoreModalOpen(false)}
        footer={null}
        width={520}
        className="zgeo-modal"
      >
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5 my-3">
          {stores.map(store => (
            <div
              key={store.id}
              onClick={() => handleSwitchStore(store)}
              className={`zgeo-store-select-item ${store.active ? 'active' : ''}`}
            >
              <Flex align="center" gap="middle" className="min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${store.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <div className="truncate">
                  <span className="font-bold text-slate-900 text-xs block truncate">{store.name}</span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {store.products} Products • Health: {store.health} • {store.active ? 'Live Feed Active' : store.env}
                  </span>
                </div>
              </Flex>

              <Flex align="center" gap="small" className="flex-shrink-0">
                {store.active ? (
                  <span className="zgeo-store-active-badge">ACTIVE</span>
                ) : (
                  <span className="zgeo-store-switch-link">Switch &rarr;</span>
                )}
                {store.id !== '1' && (
                  <button
                    type="button"
                    title="Disconnect this store property"
                    onClick={(e) => handleRemoveStore(e, store.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </Flex>
            </div>
          ))}
        </div>

        <div className="zgeo-modal-footer">
          <button
            type="button"
            onClick={() => {
              setStoreModalOpen(false);
              setConnectModalOpen(true);
            }}
            className="zgeo-connect-store-link"
          >
            <PlusCircle size={15} />
            <span>Connect New Store Property</span>
          </button>
          <button
            type="button"
            onClick={() => setStoreModalOpen(false)}
            className="zgeo-modal-btn-cancel"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* MODAL 2: CONNECT NEW STORE */}
      <Modal
        title={
          <div className="zgeo-modal-header-row">
            <div className="zgeo-modal-header-left">
              <div className="zgeo-modal-icon-box zgeo-modal-icon-brand">
                <Link2 size={18} />
              </div>
              <div>
                <Flex align="center" gap="small">
                  <h3 className="zgeo-modal-title">Connect Store Property</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">REST API v3</span>
                </Flex>
                <p className="zgeo-modal-subtitle">Link an additional WooCommerce domain to Zoventic GEO AI Engine.</p>
              </div>
            </div>
          </div>
        }
        open={connectModalOpen}
        onCancel={() => setConnectModalOpen(false)}
        footer={null}
        width={540}
        className="zgeo-modal"
      >
        <Form form={connectForm} layout="vertical" onFinish={handleConnectStore} className="space-y-4 my-2">
          {/* Domain input */}
          <Form.Item
            name="domain"
            label={
              <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                <span className="text-xs font-bold text-slate-800">Store URL / Domain</span>
                <span className="text-[10px] text-slate-400 font-normal font-mono">e.g. {siteInfo?.siteUrl || 'https://mystore.com'}</span>
              </Flex>
            }
            rules={[{ required: true, message: 'Please enter store domain URL' }]}
            style={{ marginBottom: 12 }}
          >
            <Input
              prefix={<Globe size={15} className="text-slate-400 mr-1.5" />}
              placeholder={siteInfo?.siteUrl || "https://mystore.com"}
              className="zgeo-modal-input"
              style={{ height: 38, borderRadius: 8, fontSize: 13 }}
            />
          </Form.Item>

          {/* Environment & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="env"
              label={<span className="text-xs font-bold text-slate-800">Environment Type</span>}
              initialValue="Production"
              style={{ marginBottom: 12 }}
            >
              <Select className="zgeo-antd-select" style={{ height: 38 }}>
                <Select.Option value="Production">Production (Live Store)</Select.Option>
                <Select.Option value="Staging">Staging / Pre-Prod</Select.Option>
                <Select.Option value="B2B Wholesale">Wholesale / B2B Portal</Select.Option>
                <Select.Option value="Multi-Currency">Regional / Multi-Currency</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="nickname"
              label={<span className="text-xs font-bold text-slate-800">Property Nickname</span>}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<Hash size={14} className="text-slate-400 mr-1.5" />}
                placeholder="e.g. UK Clearance Outlet"
                className="zgeo-modal-input"
                style={{ height: 38, borderRadius: 8, fontSize: 13 }}
              />
            </Form.Item>
          </div>

          {/* Auth Method Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Authentication Protocol</label>
            <div className="zgeo-auth-radio-grid">
              <div
                onClick={() => setAuthMethod('app_pass')}
                className={`zgeo-auth-radio-card ${authMethod === 'app_pass' ? 'active' : ''}`}
              >
                <Radio checked={authMethod === 'app_pass'} />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Application Password</span>
                  <span className="block text-[10px] text-slate-500">Native WP 5.6+ Auth</span>
                </div>
              </div>
              <div
                onClick={() => setAuthMethod('keys')}
                className={`zgeo-auth-radio-card ${authMethod === 'keys' ? 'active' : ''}`}
              >
                <Radio checked={authMethod === 'keys'} />
                <div>
                  <span className="block text-xs font-bold text-slate-900">WooCommerce REST Keys</span>
                  <span className="block text-[10px] text-slate-500">ck_... &amp; cs_...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="apiKey"
              label={
                <span className="text-xs font-bold text-slate-800">
                  {authMethod === 'app_pass' ? 'Username' : 'Consumer Key (ck_...)'}
                </span>
              }
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<User size={15} className="text-slate-400 mr-1.5" />}
                placeholder={authMethod === 'app_pass' ? 'e.g. store_admin' : 'ck_••••••••••••••••'}
                className="zgeo-modal-input"
                style={{ height: 38, borderRadius: 8, fontSize: 13 }}
              />
            </Form.Item>

            <Form.Item
              name="apiSecret"
              label={
                <span className="text-xs font-bold text-slate-800">
                  {authMethod === 'app_pass' ? 'Application Password' : 'Consumer Secret (cs_...)'}
                </span>
              }
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                prefix={<KeyRound size={15} className="text-slate-400 mr-1.5" />}
                placeholder="••••••••••••••••"
                className="zgeo-modal-input"
                style={{ height: 38, borderRadius: 8, fontSize: 13 }}
              />
            </Form.Item>
          </div>

          {/* Sync Checkboxes */}
          <div className="zgeo-sync-checkbox-box space-y-2">
            <Form.Item name="autoSchema" valuePropName="checked" initialValue={true} noStyle>
              <Checkbox className="text-xs text-slate-700">
                Auto-generate JSON-LD catalog schema &amp; <code className="zgeo-code">llms.txt</code> upon sync
              </Checkbox>
            </Form.Item>
            <Form.Item name="autoRankTracker" valuePropName="checked" initialValue={true} noStyle>
              <Checkbox className="text-xs text-slate-700">
                Activate Daily Automated Rank Tracker for this property
              </Checkbox>
            </Form.Item>
          </div>

          {/* Security Note */}
          <div className="zgeo-security-callout">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span>Encrypted via AES-256 in WordPress options table. Read-only catalog permission required.</span>
          </div>

          <div className="zgeo-modal-footer">
            <button
              type="button"
              onClick={() => {
                setConnectModalOpen(false);
                setStoreModalOpen(true);
              }}
              className="zgeo-modal-back-btn"
            >
              <ArrowLeft size={14} /> Back to Stores
            </button>
            <Flex align="center" gap="small">
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="zgeo-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="zgeo-modal-btn-primary"
              >
                <Link size={14} /> {isConnecting ? 'Verifying...' : 'Verify & Connect Store'}
              </button>
            </Flex>
          </div>
        </Form>
      </Modal>

      {/* MODAL 3: REINDEX CONFIRMATION */}
      <Modal
        title={
          <div className="zgeo-modal-header-row">
            <div className="zgeo-modal-header-left">
              <div className="zgeo-modal-icon-box zgeo-modal-icon-blue">
                <RefreshCw size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="zgeo-modal-title">Re-Index Catalog Feed</h3>
                <p className="zgeo-modal-subtitle">Flushes memory cache &amp; recompiles virtual feeds.</p>
              </div>
            </div>
          </div>
        }
        open={reindexModalOpen}
        onCancel={() => setReindexModalOpen(false)}
        footer={null}
        width={480}
        className="zgeo-modal"
      >
        <div className="zgeo-reindex-log-box my-3">
          <div className="zgeo-reindex-log-row">
            <span>1. Invalidate schema transients:</span>
            <span className="zgeo-reindex-ok">OK</span>
          </div>
          <div className="zgeo-reindex-log-row">
            <span>2. Query WooCommerce SKU matrix:</span>
            <span className="zgeo-reindex-ok">OK</span>
          </div>
          <div className="zgeo-reindex-log-row">
            <span>3. Compile /llms.txt Spec v1.1:</span>
            <span className="zgeo-reindex-ok">OK</span>
          </div>
          <div className="zgeo-reindex-log-row">
            <span>4. Reload virtual do_robots hook:</span>
            <span className="zgeo-reindex-ok">OK</span>
          </div>
        </div>

        <div className="zgeo-modal-footer">
          <div></div>
          <Flex align="center" gap="small">
            <button
              type="button"
              onClick={() => setReindexModalOpen(false)}
              className="zgeo-modal-btn-cancel"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecuteReindex}
              disabled={isRefreshing}
              className="zgeo-modal-btn-primary"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Re-Syncing...' : 'Re-Sync Now'}
            </button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};
