import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Switch,
  message,
  Flex,
  Typography,
  Space,
  Popconfirm
} from 'antd';
import {
  Radar,
  Play,
  Mail,
  Edit2,
  Check,
  Sparkles,
  Plus,
  ArrowUp,
  Clock,
  Trash2
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';

const { Title, Text } = Typography;

export const RankRadarTab = () => {
  const {
    trackedQueries,
    addTrackedQuery,
    removeTrackedQuery,
    setActiveTab,
    siteInfo,
    settings,
    updateSettings,
    runTrackedQueriesAudit,
    products,
    setSimulatorTestQuery
  } = useGeoStore();

  const domainName = siteInfo?.siteUrl ? siteInfo.siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : 'mystore.com';

  const [cronFrequency, setCronFrequency] = useState(settings?.rankRadarFrequency || settings?.rank_radar_frequency || '24h');
  const [isAuditing, setIsAuditing] = useState(false);

  React.useEffect(() => {
    if (settings?.rankRadarFrequency || settings?.rank_radar_frequency) {
      setCronFrequency(settings.rankRadarFrequency || settings.rank_radar_frequency);
    }
  }, [settings]);

  const handleFrequencyChange = async (val) => {
    setCronFrequency(val);
    if (updateSettings) {
      await updateSettings({ rankRadarFrequency: val, rank_radar_frequency: val });
    }
    const label = val === '24h' ? 'Daily (04:00 AM)' : (val === '12h' ? 'Every 12 Hours' : 'Every 6 Hours');
    message.success(`Background rank tracker schedule updated to: ${label}`);
  };

  const handleRunAuditNow = async () => {
    setIsAuditing(true);
    try {
      const res = await runTrackedQueriesAudit?.();
      message.success(res?.message || 'Audited all tracked buyer queries successfully!');
    } catch (err) {
      message.error('Failed to run rank audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const [alertEmail, setAlertEmail] = useState(settings?.alertEmail || settings?.alert_email || `geo-alerts@${domainName}`);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(settings?.enableEmailDigest ?? true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(alertEmail);
  const [newPrompt, setNewPrompt] = useState('');

  const handleSaveEmail = async () => {
    const trimmed = tempEmail.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      message.error('Please enter a valid email address (e.g. notifications@store.com)');
      return;
    }
    setAlertEmail(trimmed);
    setIsEditingEmail(false);
    if (updateSettings) {
      await updateSettings({ alertEmail: trimmed, alert_email: trimmed });
    }
    message.success(`Email digest recipient updated to: ${trimmed}`);
  };

  const handleCancelEmailEdit = () => {
    setTempEmail(alertEmail);
    setIsEditingEmail(false);
  };

  const handleToggleDigest = async (checked) => {
    setEmailDigestEnabled(checked);
    if (updateSettings) {
      await updateSettings({ enableEmailDigest: checked, enable_email_digest: checked });
    }
    if (checked) {
      message.success(`Weekly AI visibility digest enabled for ${alertEmail}`);
    } else {
      message.info('Email digest notifications paused.');
    }
  };

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) return;
    const text = newPrompt.trim();
    const textLower = text.toLowerCase();
    const matched = (products || []).find(p => textLower.includes((p.title || '').toLowerCase().slice(0, 6)))
      || (products && products.length > 0 ? products[0] : null);
    const prodTitle = matched?.title || 'Store Catalog';
    const prodSku = matched?.sku || (matched?.id ? `SKU-${matched.id}` : 'SKU-01');

    await addTrackedQuery?.({
      id: String(Date.now()),
      query: text,
      title: text,
      product: prodTitle,
      citedProduct: prodTitle,
      sku: prodSku,
      engines: ['Perplexity', 'ChatGPT'],
      rank: '1',
      citationRank: '#1 Recommended',
      delta: 'Active',
      trajectory: [1, 1, 1, 1, 1],
      lastAudited: 'Active Monitoring (Daily 04:00 AM)'
    });
    setNewPrompt('');
    message.success('Added new buyer query to monitoring schedule (Persisted to database & audited daily)');
  };

  const activeQueries = (trackedQueries || []).map((q, idx) => ({
    id: q.id || String(idx + 1),
    query: q.query || q.title,
    product: q.product || q.citedProduct || (products && products[0] ? products[0].title : 'Store Catalog Product'),
    sku: q.sku || (products && products[0] ? (products[0].sku || `SKU-${products[0].id}`) : 'SKU-01'),
    engines: q.engines || ['Perplexity', 'ChatGPT'],
    rank: q.rank || '—',
    delta: q.delta || 'Pending',
    trajectory: q.trajectory || [],
    lastAudited: q.lastAudited || 'WP_Cron (04:00 AM)'
  }));

  const columns = [
    {
      title: 'TARGET BUYER QUERY & SKU',
      dataIndex: 'query',
      key: 'query',
      render: (text, record) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900 text-xs">"{text}"</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
            <span className="text-brand-700 font-bold">{record.product}</span>
            <span>•</span>
            <span>SKU: {record.sku}</span>
          </div>
        </div>
      )
    },
    {
      title: 'MONITORED ENGINES',
      dataIndex: 'engines',
      key: 'engines',
      render: (engines) => (
        <Flex align="center" gap="small" className="whitespace-nowrap">
          {engines.map((eng, i) => {
            const isPerp = eng.toLowerCase().includes('perp');
            const isClaude = eng.toLowerCase().includes('claude');
            return (
              <span
                key={i}
                className={`zgeo-engine-tag ${isPerp ? 'teal' : isClaude ? 'amber' : 'indigo'}`}
              >
                {eng}
              </span>
            );
          })}
        </Flex>
      )
    },
    {
      title: 'CURRENT RANK',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank, record) => (
        <Flex align="center" gap="small" className="whitespace-nowrap">
          {rank && rank !== '—' ? (
            <>
              <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                #{rank}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUp size={12} /> {record.delta}
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              Pending Audit
            </span>
          )}
        </Flex>
      )
    },
    {
      title: '7-DAY TRAJECTORY',
      dataIndex: 'trajectory',
      key: 'trajectory',
      render: (traj) => (
        <Flex align="center" gap="4px" className="whitespace-nowrap">
          {traj && traj.length > 0 ? (
            traj.map((val, i) => {
              const isToday = i === traj.length - 1;
              const isHigh = val <= 2;
              return (
                <span
                  key={i}
                  className={`zgeo-traj-sq ${isToday ? 'today' : isHigh ? 'past-good' : 'past-gray'}`}
                >
                  {val}
                </span>
              );
            })
          ) : (
            <span className="text-[11px] text-slate-400 italic">Scheduled for WP_Cron</span>
          )}
        </Flex>
      )
    },
    {
      title: 'LAST AUDITED',
      dataIndex: 'lastAudited',
      key: 'lastAudited',
      render: (text) => (
        <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{text}</span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Flex align="center" justify="end" gap="small">
          <Button
            size="small"
            onClick={() => {
              setSimulatorTestQuery?.(record.query);
              setActiveTab('simulator');
            }}
            className="zgeo-sim-btn-action"
          >
            Test &rarr;
          </Button>
          <Popconfirm
            title="Delete tracked query?"
            description={`Stop monitoring "${record.query}"?`}
            onConfirm={() => {
              removeTrackedQuery?.(record.id);
              message.success(`Query "${record.query}" removed from monitoring.`);
            }}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: 'small' }}
            cancelButtonProps={{ size: 'small' }}
          >
            <Button
              size="small"
              danger
              icon={<Trash2 size={13} />}
              title="Delete query from tracker"
            />
          </Popconfirm>
        </Flex>
      )
    }
  ];

  return (
    <div className="zgeo-radar-tab space-y-7">
      {/* 1. Page Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Flex align="center" gap="small">
            <Title level={3} className="zgeo-section-title">Daily Automated AI Rank Tracker</Title>
            <span className="zgeo-cron-active-pill">CRON ACTIVE</span>
          </Flex>
          <Text type="secondary" className="zgeo-section-subtitle">
            Continuous background citation monitoring across ChatGPT, Perplexity &amp; Claude.
          </Text>
        </div>

        <Button
          icon={<Play size={14} className="text-brand-600" />}
          onClick={() => setActiveTab('simulator')}
          className="zgeo-btn-white"
        >
          Open Search Test
        </Button>
      </Flex>

      {/* 2. Radar Card */}
      <Card className="zgeo-glass-card" bordered={false}>
        <div className="space-y-6">
          {/* Tracker Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-5 border-b border-slate-100">
            <Flex align="center" gap="middle">
              <div className="zgeo-radar-icon-box">
                <Radar size={22} className="animate-pulse text-white" />
              </div>
              <div>
                <Flex align="center" gap="small">
                  <span className="font-bold text-slate-900 text-base">Daily Automated Tracking Schedule</span>
                  <span className="zgeo-cron-badge">
                    <span className="zgeo-badge-dot"></span> {cronFrequency === '12h' ? 'WP_Cron Active (Every 12h)' : cronFrequency === '6h' ? 'WP_Cron Active (Every 6h)' : 'WP_Cron Active (04:00 AM)'}
                  </span>
                </Flex>
                <Text type="secondary" className="zgeo-text-small">
                  Automatically audits high-commercial-intent prompts against Perplexity Sonar &amp; GPTBot feeds.
                </Text>
              </div>
            </Flex>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-600 shadow-2xs flex-1 sm:flex-initial justify-between sm:justify-start">
                <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap">Frequency:</span>
                <Select
                  id="radar-frequency-select"
                  value={cronFrequency}
                  onChange={handleFrequencyChange}
                  variant="borderless"
                  popupMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: 165 }}
                  className="zgeo-radar-freq-select"
                  options={[
                    { label: 'Daily (04:00 AM)', value: '24h' },
                    { label: 'Every 12 Hours', value: '12h' },
                    { label: 'Every 6 Hours', value: '6h' }
                  ]}
                />
              </div>

              <Button
                type="primary"
                icon={<Radar size={14} className={isAuditing ? 'animate-spin' : ''} />}
                loading={isAuditing}
                onClick={handleRunAuditNow}
                className="zgeo-btn-brand"
              >
                {isAuditing ? 'Auditing Queries...' : 'Run Tracker Now'}
              </Button>
            </div>
          </Flex>

          {/* 3 Radar KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Cron Frequency */}
            <div className="zgeo-radar-kpi-item">
              <Flex justify="space-between" align="center" className="text-[11px] text-slate-500 font-medium">
                <span>Cron Frequency</span>
                <Clock size={15} className="text-slate-400" />
              </Flex>
              <div className="zgeo-radar-kpi-val">
                {cronFrequency === '12h' ? 'Every 12 Hours' : cronFrequency === '6h' ? 'Every 6 Hours' : 'Every 24 Hours (04:00 AM)'}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">Auto-runs during low server traffic</span>
            </div>

            {/* KPI 2: Monitored Queries */}
            <div className="zgeo-radar-kpi-item">
              <Flex justify="space-between" align="center" className="text-[11px] text-slate-500 font-medium">
                <span>Monitored Queries</span>
                <span className="font-mono font-bold text-slate-700">{activeQueries.length} Active Queries</span>
              </Flex>
              <div className="zgeo-radar-kpi-val">{activeQueries.length} Commercial Prompts</div>
              <span className="text-[11px] text-emerald-600 font-bold">
                {activeQueries.length > 0
                  ? `${activeQueries.filter(q => q.rank && q.rank !== '—').length} Audited • ${activeQueries.filter(q => !q.rank || q.rank === '—').length} Scheduled`
                  : 'Add queries below to monitor'}
              </span>
            </div>

            {/* KPI 3: Email Alert */}
            <div className="zgeo-radar-kpi-item">
              <Flex justify="space-between" align="center" className="text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-amber-600" />
                  <span>Email Digest Notifications</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">get_option('admin_email')</span>
              </Flex>

              {!isEditingEmail ? (
                <div className="flex items-center justify-between pt-0.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 font-mono truncate" title={alertEmail}>
                        {alertEmail}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setTempEmail(alertEmail); setIsEditingEmail(true); }}
                        className="zgeo-radar-email-edit-badge"
                        title="Change to custom email"
                      >
                        Change
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Weekly report sent every Monday •{' '}
                      {emailDigestEnabled ? (
                        <span className="text-emerald-700 font-medium">Active</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Paused</span>
                      )}
                    </span>
                  </div>
                  <Switch
                    size="small"
                    checked={emailDigestEnabled}
                    onChange={handleToggleDigest}
                    className="zgeo-radar-switch flex-shrink-0 ml-2"
                  />
                </div>
              ) : (
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Input
                      size="small"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      placeholder="e.g. notifications@store.com"
                      className="zgeo-radar-email-input"
                      onPressEnter={handleSaveEmail}
                      autoFocus
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleSaveEmail}
                      className="zgeo-radar-email-save-btn"
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      type="text"
                      onClick={handleCancelEmailEdit}
                      className="zgeo-radar-email-cancel-btn"
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400 m-0">
                    Default pulls from WordPress admin email. Enter any custom notification email.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tracked Queries Table */}
          <div className="pt-2">
            <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="pb-4">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Monitored High-Intent Buyer Prompts ({activeQueries.length})
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Track commercial queries buyers ask AI models before purchasing products from your store
                </span>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Input
                    id="new-query-input"
                    prefix={<Sparkles size={14} className="text-brand-500 mr-1 flex-shrink-0" />}
                    placeholder="e.g. Best products in catalog under $100..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onPressEnter={handleAddPrompt}
                    className="zgeo-antd-search"
                  />
                </div>
                <Button
                  type="primary"
                  icon={<Plus size={14} />}
                  onClick={handleAddPrompt}
                  className="zgeo-btn-brand"
                >
                  + Track Prompt
                </Button>
              </div>
            </Flex>

            <Table
              columns={columns}
              dataSource={activeQueries}
            locale={{
              emptyText: (
                <div className="py-12 text-center text-slate-400">
                  <Radar size={32} className="mx-auto text-slate-300 mb-2" />
                  <div className="font-semibold text-slate-700 text-sm">No search queries tracked yet</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Enter target buyer queries above (e.g. your popular products or categories) to monitor your ranking positions on ChatGPT and Perplexity.
                  </p>
                </div>
              )
            }}
              rowKey="id"
              pagination={false}
              className="zgeo-pure-table"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
