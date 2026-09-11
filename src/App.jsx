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
  const { activeTab, setActiveTab, metrics, crawlerLogs, loadInitialData, isLoadingData } = useGeoStore();

  useEffect(() => {
    if (loadInitialData) {
      loadInitialData();
    }
  }, [loadInitialData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].toLowerCase();
      if (['overview', 'radar', 'health', 'crawlers', 'simulator', 'llms', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveTab]);

  useEffect(() => {
    // Normalize URL in browser address bar to standard format: ?page=zoventic-geo#<tab>
    try {
      const url = new URL(window.location.href);
      const pageParam = url.searchParams.get('page')?.toLowerCase();
      if (pageParam && pageParam.startsWith('zoventic-geo-')) {
        const subTab = pageParam.replace('zoventic-geo-', '');
        if (['overview', 'radar', 'health', 'crawlers', 'simulator', 'llms', 'settings'].includes(subTab)) {
          url.searchParams.set('page', 'zoventic-geo');
          url.hash = subTab;
          window.history.replaceState({}, '', url.toString());
          setActiveTab(subTab);
        }
      }
    } catch (e) {}
  }, [setActiveTab]);

  useEffect(() => {
    // Keep WordPress admin left sidebar active submenu in sync with activeTab
    try {
      const menuLinks = document.querySelectorAll('#adminmenu a[href*="page=zoventic-geo"]');
      menuLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const parentLi = link.closest('li');

        // Rewrite href to direct hash link for seamless hover preview & bookmarks
        if (href.includes('page=zoventic-geo-health')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#health');
        } else if (href.includes('page=zoventic-geo-radar')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#radar');
        } else if (href.includes('page=zoventic-geo-crawlers')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#crawlers');
        } else if (href.includes('page=zoventic-geo-llms')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#llms');
        } else if (href.includes('page=zoventic-geo-simulator')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#simulator');
        } else if (href.includes('page=zoventic-geo-settings')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#settings');
        } else if (href.includes('page=zoventic-geo') && !href.includes('-')) {
          link.setAttribute('href', 'admin.php?page=zoventic-geo#overview');
        }

        const currentHref = link.getAttribute('href') || '';
        const isMatch = (activeTab === 'overview')
          ? (currentHref.includes('#overview') || (currentHref.includes('page=zoventic-geo') && !currentHref.includes('#') && !currentHref.includes('page=zoventic-geo-')))
          : (currentHref.includes(`#${activeTab}`) || currentHref.includes(`page=zoventic-geo-${activeTab}`));

        if (isMatch) {
          parentLi?.classList.add('current');
          link.classList.add('current');
          link.setAttribute('aria-current', 'page');
        } else {
          // Only remove current from zoventic sub-items
          if (currentHref.includes('page=zoventic-geo')) {
            parentLi?.classList.remove('current');
            link.classList.remove('current');
            link.removeAttribute('aria-current');
          }
        }
      });
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    // Intercept clicks on WordPress left sidebar menu items for zoventic-geo for instant tab switching
    const handleMenuClick = (e) => {
      const targetLink = e.target.closest('a');
      if (!targetLink) return;
      const href = targetLink.getAttribute('href') || '';
      if (!href.includes('page=zoventic-geo')) return;

      let targetTab = null;
      if (href.includes('#')) {
        const h = href.split('#')[1]?.split('?')[0]?.toLowerCase();
        if (['overview', 'radar', 'health', 'crawlers', 'simulator', 'llms', 'settings'].includes(h)) {
          targetTab = h;
        }
      } else if (href.includes('page=zoventic-geo-')) {
        const match = href.match(/page=zoventic-geo-([a-z0-9_-]+)/i);
        if (match && ['overview', 'radar', 'health', 'crawlers', 'simulator', 'llms', 'settings'].includes(match[1])) {
          targetTab = match[1];
        }
      } else if (href.includes('page=zoventic-geo')) {
        targetTab = 'overview';
      }

      if (targetTab) {
        if (window.location.search.includes('page=zoventic-geo')) {
          e.preventDefault();
          setActiveTab(targetTab);
          window.location.hash = targetTab;
        }
      }
    };

    const adminMenu = document.getElementById('adminmenu');
    if (adminMenu) {
      adminMenu.addEventListener('click', handleMenuClick);
      return () => adminMenu.removeEventListener('click', handleMenuClick);
    }
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
    <Layout className="zgeo-admin-container relative">
      {isLoadingData && <div className="zgeo-top-loading-bar" />}
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
                  style={isActive ? {
                    backgroundColor: '#ffffff',
                    color: '#4338ca',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                  } : {}}
                >
                  <span className="zgeo-nav-pill-icon" style={isActive ? { color: '#4f46e5' } : {}}>
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
