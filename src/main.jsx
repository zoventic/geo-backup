import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntdApp, Result, Button } from 'antd';
import { App } from './App';
import { antdTheme } from './theme/themeConfig';
import './theme/zgeo.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Zoventic GEO UI Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="zgeo-error-wrapper">
          <Result
            status="error"
            title="Zoventic GEO Dashboard"
            subTitle={this.state.error?.message || 'An unexpected rendering error occurred.'}
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload Dashboard
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('zgeo-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ConfigProvider
        theme={antdTheme}
        getPopupContainer={() => document.getElementById('zgeo-root') || document.body}
      >
        <AntdApp>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AntdApp>
      </ConfigProvider>
    </React.StrictMode>
  );
}
