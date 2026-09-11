import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  message,
  Flex,
  Typography,
  Space,
  Modal
} from 'antd';
import {
  Download,
  Search,
  Bot,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';
import { api } from '../services/api';

const { Title, Text } = Typography;

export const CrawlerLogsTab = () => {
  const { crawlerLogs, clearCrawlerLogs, simulateCrawlerHit } = useGeoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [botFilter, setBotFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSimulatingHit, setIsSimulatingHit] = useState(false);

  const handleSimulateHit = async () => {
    setIsSimulatingHit(true);
    try {
      const bots = ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Amazonbot', 'Bytespider'];
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      if (simulateCrawlerHit) {
        await simulateCrawlerHit(randomBot);
      }
      message.success(`Simulated test visit from ${randomBot} logged to database!`);
      const logs = await api.getCrawlers();
      useGeoStore.setState({ crawlerLogs: Array.isArray(logs) ? logs : [] });
    } catch (err) {
      message.error('Failed to simulate test crawler visit.');
    } finally {
      setIsSimulatingHit(false);
    }
  };

  const handleReloadLogs = async () => {
    setIsReloading(true);
    try {
      const logs = await api.getCrawlers();
      useGeoStore.setState({ crawlerLogs: Array.isArray(logs) ? logs : [] });
      message.success('Crawler access logs refreshed from database.');
    } catch (e) {
      message.error('Failed to reload crawler logs.');
    } finally {
      setIsReloading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (isNaN(diff) || diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const normalizeLog = (log) => {
    const botName = log.bot || log.bot_name || 'AI Crawler';
    const botVendor = log.bot_vendor ? ` (${log.bot_vendor})` : '';
    const botLower = botName.toLowerCase();

    let dotColor = 'indigo';
    let textColor = 'text-indigo-700';
    if (botLower.includes('perp')) {
      dotColor = 'emerald';
      textColor = 'text-emerald-700';
    } else if (botLower.includes('claude')) {
      dotColor = 'amber';
      textColor = 'text-amber-700';
    } else if (botLower.includes('amazon') || botLower.includes('rufus')) {
      dotColor = 'purple';
      textColor = 'text-purple-700';
    } else if (botLower.includes('google') || botLower.includes('gemini')) {
      dotColor = 'blue';
      textColor = 'text-blue-700';
    } else if (botLower.includes('meta') || botLower.includes('face')) {
      dotColor = 'teal';
      textColor = 'text-teal-700';
    }

    const statusCode = Number(log.status || log.status_code || 200);
    let statusLabel = `${statusCode} OK`;
    if (statusCode === 304) {
      statusLabel = '304 Not Modified';
    } else if (statusCode === 429) {
      statusLabel = '429 Rate Limited';
      dotColor = 'rose';
      textColor = 'text-rose-700';
    } else if (statusCode === 403) {
      statusLabel = '403 Blocked';
      dotColor = 'amber';
      textColor = 'text-amber-700';
    } else if (statusCode !== 200) {
      statusLabel = `${statusCode} Accepted`;
    }

    return {
      id: String(log.id),
      bot: log.bot || `${botName}${botVendor}`,
      dotColor: log.dotColor || dotColor,
      textColor: log.textColor || textColor,
      userAgent: log.userAgent || log.user_agent || 'Mozilla/5.0 (compatible; AI Bot/1.0)',
      ip: log.ip || log.ip_address || '127.0.0.1',
      method: log.method || 'GET',
      path: log.path || log.endpoint || '/llms.txt',
      accept: log.accept || 'HTTP/2.0 • Accept: text/markdown',
      status: statusCode,
      statusLabel: log.statusLabel || statusLabel,
      meta: log.meta || (log.latency_ms ? `Clean MD • ${log.latency_ms}ms` : 'Clean MD • Verified'),
      time: log.time || (log.created_at ? formatTimeAgo(log.created_at) : 'Just now')
    };
  };

  const activeLogsSource = crawlerLogs || [];
  const normalizedLogs = activeLogsSource.map(normalizeLog);

  const filteredLogs = normalizedLogs.filter(log => {
    const matchesSearch = log.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.bot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBot = botFilter === 'all' || log.bot.toLowerCase().includes(botFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(log.status) === statusFilter;

    return matchesSearch && matchesBot && matchesStatus;
  });

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      message.warning('No crawler logs match your current filter to export.');
      return;
    }
    const headers = ['ID', 'Crawler', 'User Agent', 'IP Address', 'Method', 'Path', 'Status', 'Response Meta', 'Time'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${(l.bot || '').replace(/"/g, '""')}"`,
      `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      `"${(l.ip || '').replace(/"/g, '""')}"`,
      `"${(l.method || '').replace(/"/g, '""')}"`,
      `"${(l.path || '').replace(/"/g, '""')}"`,
      l.status,
      `"${(l.meta || '').replace(/"/g, '""')}"`,
      `"${(l.time || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zoventic-geo-crawler-logs-${botFilter !== 'all' ? botFilter + '-' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(`Exported ${filteredLogs.length} filtered crawler hits as CSV.`);
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      if (clearCrawlerLogs) {
        await clearCrawlerLogs();
      }
      setClearModalOpen(false);
      message.success('Crawler access logs cleared successfully.');
    } catch (err) {
      message.error('Failed to clear logs.');
    } finally {
      setIsClearing(false);
    }
  };

  const columns = [
    {
      title: 'CRAWLER IDENTITY',
      dataIndex: 'bot',
      key: 'bot',
      render: (text, record) => (
        <Flex align="center" gap="small" className="whitespace-nowrap font-bold text-xs">
          <span className={`zgeo-bot-dot ${record.dotColor}`}></span>
          <span className={record.textColor}>{text}</span>
        </Flex>
      )
    },
    {
      title: 'USER-AGENT TOKEN',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (ua, record) => (
        <div className="font-mono text-[11px] text-slate-500 max-w-[260px]">
          <div className="truncate" title={ua}>{ua}</div>
          <div className="text-[10px] text-slate-400">IP: {record.ip}</div>
        </div>
      )
    },
    {
      title: 'REQUESTED ENDPOINT',
      dataIndex: 'path',
      key: 'path',
      render: (path, record) => (
        <div className="font-mono font-bold text-slate-900 text-xs">
          <div className="truncate max-w-[220px]" title={`${record.method} ${path}`}>{record.method} {path}</div>
          <div className="text-[10px] text-slate-500 font-normal truncate max-w-[220px]">{record.accept}</div>
        </div>
      )
    },
    {
      title: 'RESPONSE STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div className="whitespace-nowrap inline-flex flex-col items-start">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-bold text-[11px] border whitespace-nowrap ${
            status === 200 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            status === 429 ? 'bg-rose-50 text-rose-700 border-rose-200' :
            status === 403 ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {record.statusLabel}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono mt-1 whitespace-nowrap">{record.meta}</span>
        </div>
      )
    },
    {
      title: 'TIME',
      dataIndex: 'time',
      key: 'time',
      align: 'right',
      render: (time) => (
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">{time}</span>
      )
    }
  ];

  return (
    <div className="zgeo-logs-tab space-y-7">
      {/* 1. Page Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={3} className="zgeo-section-title">AI Crawler Access Log Monitor</Title>
          <Text type="secondary" className="zgeo-section-subtitle">
            Live detection of GPTBot, PerplexityBot, ClaudeBot, and Google-Extended.
          </Text>
        </div>

        <Flex align="center" gap="small">
          <Button
            icon={<Bot size={14} className={isSimulatingHit ? 'animate-pulse' : ''} />}
            loading={isSimulatingHit}
            onClick={handleSimulateHit}
            className="zgeo-btn-white"
            title="Simulate a real-time AI crawler visit to verify logging"
          >
            Test Bot Hit
          </Button>
          <Button
            icon={<RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />}
            loading={isReloading}
            onClick={handleReloadLogs}
            className="zgeo-btn-white"
            title="Refresh logs from database"
          >
            Refresh Logs
          </Button>
          <Button
            icon={<Trash2 size={15} className="text-rose-500" />}
            onClick={() => setClearModalOpen(true)}
            className="zgeo-btn-white text-rose-600 hover:text-rose-700 hover:border-rose-300"
          >
            Clear Logs
          </Button>
          <Button
            icon={<Download size={15} className="text-slate-400" />}
            onClick={handleExportCsv}
            className="zgeo-btn-white"
          >
            Export CSV Log
          </Button>
        </Flex>
      </Flex>

      {/* 2. Filter Toolbar & Table Card */}
      <div className="glass-card rounded-2xl shadow-card overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative flex-1 max-w-md">
            <Input
              id="log-search-input"
              prefix={<Search size={15} className="text-slate-400 mr-1.5 flex-shrink-0" />}
              placeholder="Filter by endpoint, IP, or user-agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="zgeo-antd-search"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Crawler:</span>
              <Select
                id="log-bot-filter"
                value={botFilter}
                onChange={setBotFilter}
                className="zgeo-antd-select"
                style={{ width: 175 }}
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 210 }}
                options={[
                  { label: `All Crawlers (${activeLogsSource.length})`, value: 'all' },
                  { label: 'GPTBot (OpenAI)', value: 'gpt' },
                  { label: 'PerplexityBot', value: 'perplexity' },
                  { label: 'ClaudeBot (Anthropic)', value: 'claude' },
                  { label: 'Amazonbot (Rufus)', value: 'amazon' },
                  { label: 'Google-Extended', value: 'google' },
                  { label: 'Meta-ExternalAgent', value: 'meta' }
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <Select
                id="log-status-filter"
                value={statusFilter}
                onChange={setStatusFilter}
                className="zgeo-antd-select"
                style={{ width: 140 }}
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 160 }}
                options={[
                  { label: 'All Responses', value: 'all' },
                  { label: '200 OK', value: '200' },
                  { label: '304 Not Modified', value: '304' },
                  { label: '403 Blocked', value: '403' },
                  { label: '429 Rate Limited', value: '429' }
                ]}
              />
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="zgeo-pure-table"
          locale={{
            emptyText: (
              <div className="py-12 text-center text-slate-400">
                <Bot size={32} className="mx-auto text-slate-300 mb-2" />
                <div className="font-semibold text-slate-700 text-sm">No crawler activity recorded yet</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  AI bots (GPTBot, PerplexityBot, ClaudeBot, etc.) will appear here automatically when they index your products or /llms.txt feed.
                </p>
              </div>
            )
          }}
        />
      </div>

      {/* Clear Logs Confirmation Modal */}
      <Modal
        title={
          <div className="zgeo-modal-header-row">
            <div className="zgeo-modal-header-left">
              <div className="zgeo-modal-icon-box zgeo-modal-icon-rose">
                <Trash2 size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="zgeo-modal-title">Clear Crawler Access Logs?</h3>
                <p className="zgeo-modal-subtitle">This will permanently purge recorded bot hits from the database table.</p>
              </div>
            </div>
          </div>
        }
        open={clearModalOpen}
        onCancel={() => setClearModalOpen(false)}
        footer={null}
        width={460}
        className="zgeo-modal"
      >
        <div className="space-y-4 my-2">
          <div className="zgeo-purge-callout">
            <strong className="font-bold">Notice:</strong> This action clears the <code>wp_zgeo_crawler_logs</code> table. New crawler hits will continue to be recorded in real time.
          </div>

          <div className="zgeo-modal-footer">
            <div></div>
            <Flex align="center" gap="small">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="zgeo-modal-btn-cancel"
              >
                Cancel
              </button>
              <Button
                type="primary"
                danger
                loading={isClearing}
                onClick={handleClearLogs}
                className="zgeo-modal-btn-danger"
              >
                Clear All Logs
              </Button>
            </Flex>
          </div>
        </div>
      </Modal>
    </div>
  );
};
