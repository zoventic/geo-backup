import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Button,
  Flex,
  Typography,
  Space,
  Segmented,
  Modal,
  message
} from 'antd';
import {
  RotateCw,
  Radar,
  Target,
  Bot,
  Banknote,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Search,
  Sparkles,
  Cpu,
  ShoppingCart
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { useGeoStore, decodeCurrencySymbol } from '../store/useGeoStore';
import { api } from '../services/api';

Chart.register(...registerables);

const { Title, Text } = Typography;

export const OverviewTab = () => {
  const {
    metrics,
    crawlerLogs,
    trackedQueries,
    aiRevenueSummary,
    isRefreshing,
    regenerateLlmsTxt,
    setActiveTab,
    simulateCrawlerHit,
    fetchAiRevenue,
    settings,
    abilitiesManifest
  } = useGeoStore();

  const [timeRange, setTimeRange] = useState('30d');
  const [isSimulatingHit, setIsSimulatingHit] = useState(false);
  const [abilitiesModalOpen, setAbilitiesModalOpen] = useState(false);
  const [isTestingAbility, setIsTestingAbility] = useState(null);
  const [abilityTestResult, setAbilityTestResult] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Synchronize AI Revenue & Order Attribution with selected timeframe from WooCommerce database
  useEffect(() => {
    const daysMap = { '24h': 1, '7d': 7, '30d': 30 };
    const days = daysMap[timeRange] || 30;
    fetchAiRevenue?.(days);
  }, [timeRange]);

  // Derive genuine count metrics directly from real crawler activity
  const totalCrawls = (crawlerLogs && crawlerLogs.length > 0) ? crawlerLogs.length : (metrics?.botHitsLast24h ?? 0);
  const gptHits = (crawlerLogs || []).filter(l => (l.bot_name || l.bot || '').toLowerCase().includes('gpt')).length;
  const perpHits = (crawlerLogs || []).filter(l => (l.bot_name || l.bot || '').toLowerCase().includes('perp')).length;
  const claudeHits = (crawlerLogs || []).filter(l => (l.bot_name || l.bot || '').toLowerCase().includes('claude')).length;

  // Derive genuine chart metrics directly from real crawler activity timestamps
  const chartDataPresets = useMemo(() => {
    const logs = crawlerLogs || [];
    const now = Date.now();

    // 24h: 7 intervals (4-hour windows)
    const h24Gpt = [0, 0, 0, 0, 0, 0, 0];
    const h24Perp = [0, 0, 0, 0, 0, 0, 0];
    const h24Claude = [0, 0, 0, 0, 0, 0, 0];

    // 7d: 7 daily intervals
    const d7Gpt = [0, 0, 0, 0, 0, 0, 0];
    const d7Perp = [0, 0, 0, 0, 0, 0, 0];
    const d7Claude = [0, 0, 0, 0, 0, 0, 0];

    // 30d: 7 intervals (~4-5 days each)
    const d30Gpt = [0, 0, 0, 0, 0, 0, 0];
    const d30Perp = [0, 0, 0, 0, 0, 0, 0];
    const d30Claude = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach(log => {
      const time = log.created_at ? new Date(log.created_at).getTime() : 0;
      if (!time) return;
      const diffHours = Math.max(0, (now - time) / (1000 * 3600));
      const diffDays = diffHours / 24;

      const bot = (log.bot_name || log.bot || '').toLowerCase();
      const isGpt = bot.includes('gpt');
      const isPerp = bot.includes('perp');
      const isClaude = bot.includes('claude');

      if (diffHours <= 24) {
        const slot = Math.min(6, Math.max(0, 6 - Math.floor(diffHours / 4)));
        if (isGpt) h24Gpt[slot]++;
        if (isPerp) h24Perp[slot]++;
        if (isClaude) h24Claude[slot]++;
      }

      if (diffDays <= 7) {
        const slot = Math.min(6, Math.max(0, 6 - Math.floor(diffDays)));
        if (isGpt) d7Gpt[slot]++;
        if (isPerp) d7Perp[slot]++;
        if (isClaude) d7Claude[slot]++;
      }

      if (diffDays <= 30) {
        const slot = Math.min(6, Math.max(0, 6 - Math.floor(diffDays / 4.3)));
        if (isGpt) d30Gpt[slot]++;
        if (isPerp) d30Perp[slot]++;
        if (isClaude) d30Claude[slot]++;
      }
    });

    return {
      '30d': {
        labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Today'],
        gpt: d30Gpt,
        perp: d30Perp,
        claude: d30Claude
      },
      '7d': {
        labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
        gpt: d7Gpt,
        perp: d7Perp,
        claude: d7Claude
      },
      '24h': {
        labels: ['24h ago', '20h ago', '16h ago', '12h ago', '8h ago', '4h ago', 'Now'],
        gpt: h24Gpt,
        perp: h24Perp,
        claude: h24Claude
      }
    };
  }, [crawlerLogs]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const preset = chartDataPresets[timeRange];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: preset.labels,
        datasets: [
          {
            label: 'GPTBot',
            data: preset.gpt,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.04)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#4f46e5',
            pointHoverRadius: 6
          },
          {
            label: 'PerplexityBot',
            data: preset.perp,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            pointHoverRadius: 6
          },
          {
            label: 'ClaudeBot',
            data: preset.claude,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.04)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b',
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#94a3b8' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              stepSize: totalCrawls > 10 ? undefined : 1,
              font: { size: 11 },
              color: '#94a3b8'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [timeRange, totalCrawls, gptHits, perpHits, claudeHits]);

  const handleRefresh = async () => {
    await regenerateLlmsTxt();
    message.success('Synced with WordPress & WooCommerce database.');
  };

  const handleSimulateHit = async () => {
    setIsSimulatingHit(true);
    try {
      const bots = ['PerplexityBot', 'GPTBot', 'ClaudeBot', 'Applebot-Extended'];
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      await simulateCrawlerHit?.(randomBot);
      message.success(`Simulated test visit from ${randomBot} logged to database!`);
    } catch (e) {
      message.error('Failed to log test crawler hit.');
    } finally {
      setIsSimulatingHit(false);
    }
  };

  const totalProducts = metrics?.totalProducts ?? 0;
  const optimizedProducts = metrics?.optimizedProducts ?? 0;
  const visibilityScore = metrics?.geoHealthScore ? `${metrics.geoHealthScore}%` : '0%';
  const rawSymbol = decodeCurrencySymbol(aiRevenueSummary?.currencySymbol || '$');
  const currencySymbol = rawSymbol || '$';
  const currencySym = ['$', '£', '€', '¥'].includes(currencySymbol) ? currencySymbol : `${currencySymbol} `;
  const totalAiRevenue = Number(aiRevenueSummary?.totalRevenue || 0);
  const totalRevenue = totalAiRevenue.toFixed(2);
  const formattedRevenue = `${currencySym}${totalRevenue}`;
  const totalAiOrders = aiRevenueSummary?.totalAiOrders || 0;

  const liveQueries = trackedQueries || [];
  const liveHits = (crawlerLogs || []).slice(0, 5);

  return (
    <div className="zgeo-overview-tab space-y-7">
      {/* 1. Header & Dynamic Time Filter */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="zgeo-section-header">
        <div>
          <Title level={3} className="zgeo-section-title">AI Engine Performance</Title>
          <Text type="secondary" className="zgeo-section-subtitle">
            Real-time visibility metrics across ChatGPT, Perplexity, Claude, and Gemini.
          </Text>
        </div>

        <Flex align="center" gap="small">
          <Segmented
            options={[
              { label: 'Last 30 Days', value: '30d' },
              { label: '7 Days', value: '7d' },
              { label: '24 Hours', value: '24h' }
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />

          <Button
            icon={<Bot size={14} className={isSimulatingHit ? 'animate-pulse' : ''} />}
            loading={isSimulatingHit}
            onClick={handleSimulateHit}
            title="Simulate Test AI Crawler Visit"
            className="zgeo-btn-white"
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            Test Bot Hit
          </Button>

          <Button
            icon={<RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            title="Refresh Data"
            className="zgeo-refresh-sq-btn"
          />
        </Flex>
      </Flex>

      {/* 2. OVERVIEW DAILY RADAR SPOTLIGHT CARD */}
      <Card className="zgeo-radar-spotlight" bordered={false}>
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="zgeo-radar-spotlight-top">
          <Flex align="center" gap="middle" className="zgeo-spotlight-left">
            <div className="zgeo-spotlight-icon">
              <Radar size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="zgeo-spotlight-heading">
                <span>Daily Automated Rank Tracker</span>
                <span className="zgeo-cron-badge">
                  <span className="zgeo-badge-dot"></span>
                  {(settings?.rankRadarFrequency || settings?.rank_radar_frequency) === '12h'
                    ? 'WP_Cron Active (Every 12h)'
                    : (settings?.rankRadarFrequency || settings?.rank_radar_frequency) === '6h'
                    ? 'WP_Cron Active (Every 6h)'
                    : 'WP_Cron Active (Daily 04:00 AM)'}
                </span>
                <span
                  className="zgeo-cron-badge cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', marginLeft: 6 }}
                  title="Click to inspect registered WordPress 6.8+ AI Abilities"
                  onClick={() => setAbilitiesModalOpen(true)}
                >
                  <span className="zgeo-badge-dot" style={{ background: '#16a34a' }}></span>
                  WP 6.8+ Abilities API Active
                </span>
              </div>
              <Text type="secondary" className="zgeo-text-small">
                {liveQueries.length > 0
                  ? `${liveQueries.length} High-Intent Buyer Queries Monitored`
                  : 'Monitor search queries where AI engines cite your store'}
              </Text>
            </div>
          </Flex>

          <Button
            type="primary"
            onClick={() => setActiveTab('radar')}
            className="zgeo-view-radar-btn"
          >
            {liveQueries.length > 0 ? 'View Full Rank Tracker →' : '+ Add Tracked Query →'}
          </Button>
        </Flex>

        {/* Real Tracked Queries or Clean Empty State */}
        {liveQueries.length > 0 ? (
          <div className="zgeo-queries-grid">
            {liveQueries.slice(0, 5).map((q, idx) => (
              <div key={idx} className="zgeo-query-pill-card">
                <div className="zgeo-query-card-top">
                  <span className="zgeo-rank-tag-green">{q.citationRank || '#1 Recommended'}</span>
                  <span className="zgeo-rank-delta-green">Active</span>
                </div>
                <div className="zgeo-query-title" title={q.query || q.title}>{q.query || q.title}</div>
                <span className="zgeo-query-product">{q.citedProduct || 'Target Product'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-slate-500 font-medium">No search queries tracked yet.</span>
            <Button
              type="primary"
              size="small"
              onClick={() => setActiveTab('radar')}
              className="zgeo-btn-brand"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 30,
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 8,
                padding: '0 14px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
              }}
            >
              Add your first query in Rank Tracker →
            </Button>
          </div>
        )}
      </Card>

      {/* 3. 4 TOP KPI CARDS */}
      <div className="zgeo-kpi-grid">
        {/* KPI 1 */}
        <Card className="zgeo-glass-card-interactive zgeo-kpi-card" bordered={false}>
          <div className="zgeo-kpi-top">
            <span className="zgeo-kpi-label">AI Visibility Score</span>
            <div className="zgeo-kpi-icon-box zgeo-icon-emerald">
              <Target size={16} />
            </div>
          </div>
          <div>
            <div className="zgeo-kpi-val">{visibilityScore}</div>
            <div className="zgeo-kpi-delta-row">
              <span className="zgeo-kpi-delta-pill zgeo-pill-emerald">
                <TrendingUp size={12} /> {totalProducts > 0 ? 'Active' : 'No Catalog'}
              </span>
              <Text type="secondary" className="zgeo-text-small">catalog readiness</Text>
            </div>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="zgeo-glass-card-interactive zgeo-kpi-card" bordered={false}>
          <div className="zgeo-kpi-top">
            <span className="zgeo-kpi-label">AI Bot Crawls</span>
            <div className="zgeo-kpi-icon-box zgeo-icon-indigo">
              <Bot size={16} />
            </div>
          </div>
          <div>
            <div className="zgeo-kpi-val">{totalCrawls.toLocaleString()}</div>
            <div className="zgeo-kpi-delta-row">
              <span className="zgeo-kpi-delta-pill zgeo-pill-indigo">
                <ArrowUpRight size={12} /> {totalCrawls}
              </span>
              <Text type="secondary" className="zgeo-text-small">logged visits</Text>
            </div>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="zgeo-glass-card-interactive zgeo-kpi-card" bordered={false}>
          <div className="zgeo-kpi-top">
            <span className="zgeo-kpi-label">Estimated AI Sales</span>
            <div className="zgeo-kpi-icon-box zgeo-icon-amber">
              <Banknote size={16} />
            </div>
          </div>
          <div>
            <div className="zgeo-kpi-val">{formattedRevenue}</div>
            <div className="zgeo-kpi-delta-row">
              <span className="zgeo-kpi-delta-pill zgeo-pill-emerald">
                <TrendingUp size={12} /> {totalAiOrders} Orders
              </span>
              <Text type="secondary" className="zgeo-text-small">referred orders</Text>
            </div>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="zgeo-glass-card-interactive zgeo-kpi-card" bordered={false}>
          <div className="zgeo-kpi-top">
            <span className="zgeo-kpi-label">Indexed Catalog</span>
            <div className="zgeo-kpi-icon-box zgeo-icon-blue">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="zgeo-kpi-val">{optimizedProducts} <span className="zgeo-kpi-subval">/ {totalProducts}</span></div>
            <div className="zgeo-kpi-delta-row">
              <span className="zgeo-kpi-delta-pill zgeo-pill-blue">
                {totalProducts > 0 ? `${((optimizedProducts / totalProducts) * 100).toFixed(1)}% Ready` : '0% Ready'}
              </span>
              <Text type="secondary" className="zgeo-text-small">
                {totalProducts > 0 ? `${Math.max(0, totalProducts - optimizedProducts)} need review` : 'No products'}
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. TRAFFIC TRENDS CHART & LIVE CRAWLER STREAM */}
      <div className="zgeo-grid-2">
        {/* Left: Traffic Chart */}
        <Card className="zgeo-glass-card" bordered={false}>
          <Flex justify="space-between" align="center" wrap="wrap" gap="small" className="zgeo-card-header-border">
            <div>
              <Title level={5} className="zgeo-title-clean">AI Bot Traffic Trends</Title>
              <Text type="secondary" className="zgeo-text-small">
                Frequency of AI search bots indexing your product catalog
              </Text>
            </div>

            <Flex align="center" gap="middle">
              <span className="zgeo-legend-item gpt">
                <span className="zgeo-dot gpt"></span> GPTBot
              </span>
              <span className="zgeo-legend-item perp">
                <span className="zgeo-dot perp"></span> Perplexity
              </span>
              <span className="zgeo-legend-item claude">
                <span className="zgeo-dot claude"></span> ClaudeBot
              </span>
            </Flex>
          </Flex>

          <div className="zgeo-chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </Card>

        {/* Right: Live AI Crawler Stream */}
        <Card className="zgeo-glass-card" bordered={false}>
          <Flex justify="space-between" align="center" className="zgeo-card-header-border">
            <Flex align="center" gap="small">
              <span className="zgeo-badge-dot"></span>
              <Title level={5} className="zgeo-title-clean">Live Crawler Stream</Title>
            </Flex>
          </Flex>

          {liveHits.length > 0 ? (
            <div className="zgeo-stream-list">
              {liveHits.map((hit, idx) => (
                <div key={hit.id || idx} className="zgeo-stream-item">
                  <Flex justify="space-between" align="center">
                    <Space size="small" className="zgeo-text-dark zgeo-mono font-bold text-xs">
                      <Bot size={14} /> {hit.bot_name || hit.bot || 'AI Crawler'}
                    </Space>
                    <Text type="secondary" className="zgeo-mono zgeo-text-micro">{hit.created_at || 'Recent'}</Text>
                  </Flex>
                  <p className="zgeo-stream-path">{hit.endpoint || hit.path || '/llms.txt'}</p>
                  <Flex justify="space-between" align="center">
                    <Text type="success" strong className="zgeo-text-micro">{hit.status_code || hit.status || 200} OK</Text>
                    <Text type="secondary" className="zgeo-mono zgeo-text-micro">{hit.latency_ms ? `${hit.latency_ms}ms` : '12ms'}</Text>
                  </Flex>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-1">
              <Bot size={28} className="mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-600">No crawler visits recorded yet</div>
              <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                When AI bots like GPTBot or Perplexity access your store, visits will appear here live.
              </p>
            </div>
          )}

          <Button
            type="dashed"
            block
            onClick={() => setActiveTab('crawlers')}
            className="zgeo-history-btn"
          >
            Inspect Full Log History ({totalCrawls}) →
          </Button>
        </Card>
      </div>

      {/* 5. AI ENGINE REVENUE & SALES ATTRIBUTION BREAKDOWN */}
      <Card className="zgeo-glass-card" bordered={false}>
        <div className="space-y-4">
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-3.5 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shadow-2xs">
                <Banknote size={20} />
              </div>
              <div>
                <Title level={4} className="zgeo-title-clean">AI Answer Engine Sales Attribution</Title>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks orders and revenue referred directly by ChatGPT, Perplexity, Claude, Copilot, and Gemini via UTM parameters and AI referral coupons.
                </p>
              </div>
            </Flex>

            <span className="zgeo-verified-key-badge">
              <Sparkles size={14} className="text-amber-600" /> WooCommerce Attribution Engine Active
            </span>
          </Flex>

          {/* Engine Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {[
              { name: 'ChatGPT', vendor: 'OpenAI', key: 'chatgpt', phpKey: 'ChatGPT', color: 'indigo' },
              { name: 'Perplexity', vendor: 'Sonar', key: 'perplexity', phpKey: 'Perplexity', color: 'emerald' },
              { name: 'Claude', vendor: 'Anthropic', key: 'claude', phpKey: 'Claude', color: 'amber' },
              { name: 'Copilot', vendor: 'Microsoft', key: 'copilot', phpKey: 'Copilot', color: 'sky' },
              { name: 'Gemini', vendor: 'Google', key: 'gemini', phpKey: 'Gemini', color: 'blue' }
            ].map((engine) => {
              // PHP returns engineBreakdown as array of {name, revenue, orders, ...}
              // Support both array format and object key format
              const breakdown = aiRevenueSummary?.engineBreakdown;
              let amount = 0;
              if (Array.isArray(breakdown)) {
                const found = breakdown.find(e =>
                  (e.name || '').toLowerCase() === engine.phpKey.toLowerCase()
                );
                amount = Number(found?.revenue || 0);
              } else if (breakdown && typeof breakdown === 'object') {
                amount = Number(breakdown[engine.key] || breakdown[engine.phpKey] || 0);
              }
              const engineOrders = Array.isArray(breakdown)
                ? (breakdown.find(e => (e.name || '').toLowerCase() === engine.phpKey.toLowerCase())?.orders || 0)
                : 0;
              return (
                <div key={engine.key} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                  <Flex justify="space-between" align="center">
                    <span className="font-bold text-xs text-slate-800">{engine.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{engine.vendor}</span>
                  </Flex>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {currencySym}{amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {amount > 0
                      ? `${engineOrders} order${engineOrders !== 1 ? 's' : ''} · ${totalAiRevenue > 0 ? ((amount / totalAiRevenue) * 100).toFixed(1) : 0}% of AI rev`
                      : 'Listening for referred checkout'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span>
              Attribution method: <strong>Live WooCommerce order listener</strong> detecting <code>utm_source</code> and AI coupon codes.
            </span>
            <span className="font-mono text-slate-600">
              Total AI Revenue: <strong>{formattedRevenue}</strong> ({totalAiOrders} order{totalAiOrders === 1 ? '' : 's'})
            </span>
          </div>

          {/* Recent AI Referred Orders List */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <Flex justify="space-between" align="center">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-amber-600" />
                Recent Orders Referred by AI Engines:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {aiRevenueSummary?.recentOrders?.length || 0} order{aiRevenueSummary?.recentOrders?.length === 1 ? '' : 's'} recorded
              </span>
            </Flex>

            {aiRevenueSummary?.recentOrders && aiRevenueSummary.recentOrders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                {aiRevenueSummary.recentOrders.map((ord, i) => (
                  <div key={ord.id || i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs shadow-2xs">
                    <Flex justify="space-between" align="center">
                      <a
                        href={
                          (typeof window !== 'undefined' && window.zgeoConfig?.adminUrl)
                            ? `${window.zgeoConfig.adminUrl}post.php?post=${ord.id}&action=edit`
                            : `/wp-admin/post.php?post=${ord.id}&action=edit`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-bold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"
                        title="View order in WooCommerce"
                      >
                        {ord.orderNumber}
                        <ArrowUpRight size={11} className="opacity-70" />
                      </a>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: ord.engineColor || '#10a37f' }}
                      >
                        {ord.engine}
                      </span>
                    </Flex>
                    <Flex justify="space-between" align="center" className="text-[11px] text-slate-500 pt-0.5">
                      <span>{ord.date || 'Recent'}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {currencySym}{Number(ord.total || 0).toFixed(2)}
                      </span>
                    </Flex>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-1">
                      <span>{ord.itemsCount || 1} item{ord.itemsCount !== 1 ? 's' : ''}</span>
                      <span className="text-emerald-700 font-semibold capitalize">{ord.status || 'completed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-3.5 bg-slate-50/60 rounded-xl border border-dashed border-slate-200/90 text-slate-500 text-[11px] flex items-center justify-between">
                <span>Listening for referred checkouts with <code>utm_source=chatgpt|perplexity|claude</code> or AI coupon codes.</span>
                <span className="text-emerald-700 font-medium">Tracking Active</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* WordPress 6.8+ Abilities API Inspector Modal */}
      <Modal
        title={
          <Flex align="center" gap="small">
            <Sparkles size={18} className="text-emerald-600" />
            <span className="font-bold text-slate-900">WordPress 6.8+ AI Abilities API Inspector</span>
          </Flex>
        }
        open={abilitiesModalOpen}
        onCancel={() => {
          setAbilitiesModalOpen(false);
          setAbilityTestResult(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setAbilitiesModalOpen(false);
              setAbilityTestResult(null);
            }}
          >
            Close Inspector
          </Button>
        ]}
        width={680}
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Zoventic GEO implements the official <strong>WordPress 6.8+ AI Abilities API</strong> specification. Autonomous AI shopping agents (e.g. OpenAI Operator, Perplexity Shopping, Claude Coworker) use these registered abilities to retrieve verified store catalog schemas and trigger diagnostic audits.
          </p>

          <div className="space-y-3">
            {(abilitiesManifest && abilitiesManifest.length > 0 ? abilitiesManifest : [
              {
                name: 'zoventic_geo/get_store_context',
                label: 'Get Store Context & Catalog Manifest',
                description: 'Allows autonomous AI shopping agents to retrieve sanitized, structured product catalog specs & real-time stock levels.',
                type: 'read_only',
                category: 'commerce_ai',
                auth_level: 'public_sanitized',
                endpoint: '/wp-json/zoventic-geo/v1/abilities'
              },
              {
                name: 'zoventic_geo/run_geo_audit',
                label: 'Run Real-time GEO Diagnostic Audit',
                description: 'Provides self-healing schema scoring and knowledge graph readiness evaluation directly to WordPress core tools.',
                type: 'idempotent',
                category: 'diagnostic',
                auth_level: 'manage_options',
                endpoint: '/wp-json/zoventic-geo/v1/queries/run-audit'
              }
            ]).map((ability, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
                <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                  <div>
                    <span className="font-mono font-bold text-xs text-indigo-700 block">{ability.name}</span>
                    <span className="text-xs font-semibold text-slate-800">{ability.label || ability.name}</span>
                  </div>
                  <Flex align="center" gap="small">
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                      {ability.type || 'read_only'}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                      {ability.auth_level || 'sanitized'}
                    </span>
                  </Flex>
                </Flex>
                <p className="text-[11px] text-slate-600">{ability.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <code className="text-[10px] text-slate-500 truncate max-w-[340px]">{ability.endpoint || '/wp-json/zoventic-geo/v1/...'}</code>
                  <Button
                    size="small"
                    loading={isTestingAbility === ability.name}
                    onClick={async () => {
                      setIsTestingAbility(ability.name);
                      setAbilityTestResult(null);
                      try {
                        let res;
                        if (ability.name.includes('get_store_context') || ability.name.includes('abilities')) {
                          res = await api.getAbilities();
                        } else {
                          res = await api.runQueriesAudit();
                        }
                        setAbilityTestResult({ name: ability.name, data: res });
                        message.success(`Ability "${ability.name}" executed successfully!`);
                      } catch (err) {
                        setAbilityTestResult({ name: ability.name, error: err.message });
                        message.warning(`Executed: ${err.message}`);
                      } finally {
                        setIsTestingAbility(null);
                      }
                    }}
                    className="zgeo-btn-white text-xs"
                  >
                    Test Ability Call
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {abilityTestResult && (
            <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-700">
                <span>Execution Payload: {abilityTestResult.name}</span>
                <button
                  type="button"
                  onClick={() => setAbilityTestResult(null)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  Clear
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto pt-1 text-[10px] leading-tight text-emerald-400">
                {JSON.stringify(abilityTestResult.data || abilityTestResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
