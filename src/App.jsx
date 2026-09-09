import React, { useEffect } from 'react';
import { Layout } from 'antd';
import {
  LayoutDashboard,
  Radar,
  ShieldCheck,
  Activity,
  Bot,
  FileCode2,
  SlidersHorizontal
} from 'lucide-react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { RankRadarTab } from './components/RankRadarTab';
import { GeoHealthTab } from './components/GeoHealthTab';
import { CrawlerLogsTab } from './components/CrawlerLogsTab';
import { SimulatorTab } from './components/SimulatorTab';
import { LlmsEngineTab } from './components/LlmsEngineTab';
import { SettingsTab } from './components/SettingsTab';
import { useGeoStore } from './store/useGeoStore';

const { Content } = Layout;

export const App = () => {
  const { activeTab, setActiveTab, metrics, crawlerLogs, loadInitialData } = useGeoStore();

  useEffect(() => {
    if (loadInitialData) {
      loadInitialData();
    }
  }, [loadInitialData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (['overview', 'radar', 'health', 'crawlers', 'simulator', 'llms', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveTab]);

  const totalProducts = metrics?.totalProducts ?? 0;
  const optimizedProducts = metrics?.optimizedProducts ?? 0;
  const totalLogs = (crawlerLogs && crawlerLogs.length > 0) ? crawlerLogs.length : (metrics?.botHitsLast24h ?? 0);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={15} />,
      badge: null
    },
    {
      id: 'radar',
      label: 'Rank Tracker',
      icon: <Radar size={15} />,
      badge: (
        <span className="zgeo-nav-pill-badge zgeo-badge-emerald">
          <span className="zgeo-badge-dot"></span> Daily
        </span>
      )
    },
    {
      id: 'health',
      label: 'GEO Health',
      icon: <ShieldCheck size={15} />,
      badge: <span className="zgeo-nav-pill-badge zgeo-badge-emerald">{totalProducts > 0 ? `${optimizedProducts}/${totalProducts}` : '0/0'}</span>
    },
    {
      id: 'crawlers',
      label: 'Crawler Logs',
      icon: <Activity size={15} />,
      badge: <span className="zgeo-nav-pill-badge zgeo-badge-slate">{totalLogs}</span>
    },
    {
      id: 'simulator',
      label: 'Search Test',
      icon: <Bot size={15} />,
      badge: <span className="zgeo-nav-pill-badge zgeo-badge-indigo">Live Test</span>
    },
    {
      id: 'llms',
      label: 'llms.txt Feed',
      icon: <FileCode2 size={15} />,
      badge: <span className="zgeo-nav-pill-badge zgeo-badge-slate">v1.1</span>
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SlidersHorizontal size={15} />,
      badge: <span className="zgeo-badge-dot"></span>
    }
  ];

  return (
    <Layout className="zgeo-admin-container">
      {/* Top Banner & Store Header */}
      <Header />

      {/* STICKY HORIZONTAL NAVIGATION TABS BAR (Matching preview.html) */}
      <div className="zgeo-nav-wrapper">
        <div className="zgeo-container-inner zgeo-nav-inner">
          <nav className="zgeo-nav-pills">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`zgeo-nav-pill ${isActive ? 'active' : ''}`}
                >
                  <span className="zgeo-nav-pill-icon">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTENT */}
      <Content className="zgeo-main-wrapper">
        <main className="zgeo-container-inner zgeo-main-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'radar' && <RankRadarTab />}
          {activeTab === 'health' && <GeoHealthTab />}
          {activeTab === 'crawlers' && <CrawlerLogsTab />}
          {activeTab === 'simulator' && <SimulatorTab />}
          {activeTab === 'llms' && <LlmsEngineTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </Content>
    </Layout>
  );
};
