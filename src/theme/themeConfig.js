/**
 * Ant Design v6 Theme Configuration
 * Matching preview.html design tokens (Brand Indigo #4f46e5, Emerald #10b981, Plus Jakarta Sans)
 */
export const antdTheme = {
  token: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13,
    colorPrimary: '#4f46e5',
    colorPrimaryHover: '#4338ca',
    colorPrimaryActive: '#3730a3',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#4f46e5',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBgBase: '#ffffff',
    colorBorder: 'rgba(226, 232, 240, 0.85)',
    colorBorderSecondary: '#f1f5f9',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    controlHeight: 36,
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      colorBorderSecondary: 'rgba(226, 232, 240, 0.85)',
      boxShadowCard: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
      paddingLG: 20,
    },
    Table: {
      borderRadius: 12,
      headerBg: 'rgba(248, 250, 252, 0.85)',
      headerColor: '#64748b',
      headerSplitColor: 'transparent',
      borderColor: '#f1f5f9',
      rowHoverBg: 'rgba(248, 250, 252, 0.7)',
      fontSize: 12,
    },
    Button: {
      borderRadius: 10,
      fontWeight: 600,
      controlHeight: 36,
      defaultBorderColor: 'rgba(226, 232, 240, 0.9)',
      defaultColor: '#334155',
      defaultHoverBg: '#f8fafc',
    },
    Modal: {
      borderRadiusLG: 16,
      headerBg: '#ffffff',
    },
    Drawer: {
      borderRadiusLG: 16,
    },
    Progress: {
      remainingColor: '#e2e8f0',
    },
    Tag: {
      borderRadiusSM: 6,
      fontSize: 11,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 38,
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      activeBorderColor: '#4f46e5',
      hoverBorderColor: '#cbd5e1',
      activeShadow: '0 0 0 2px rgba(79, 70, 229, 0.15)',
      fontSize: 12,
      colorText: '#1e293b',
      colorTextPlaceholder: '#94a3b8',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      activeBorderColor: '#4f46e5',
      hoverBorderColor: '#cbd5e1',
      fontSize: 12,
      colorText: '#334155',
      optionSelectedBg: '#eef2ff',
      optionSelectedColor: '#4338ca',
      optionActiveBg: '#f8fafc',
    },
    Pagination: {
      itemSize: 32,
      borderRadius: 8,
      colorPrimary: '#4f46e5',
      colorPrimaryHover: '#4338ca',
      colorBgContainer: '#ffffff',
      fontSize: 12,
    },
    Switch: {
      colorPrimary: '#4f46e5',
      colorPrimaryHover: '#4338ca',
    },
    Slider: {
      colorPrimary: '#4f46e5',
      colorPrimaryBorder: '#4f46e5',
      trackBg: '#4f46e5',
      trackHoverBg: '#4338ca',
      handleColor: '#4f46e5',
      handleActiveColor: '#3730a3',
    },
    Segmented: {
      borderRadius: 10,
      itemSelectedBg: '#ffffff',
      itemSelectedColor: '#0f172a',
      trackBg: 'rgba(226, 232, 240, 0.7)',
    }
  }
};

