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

// Defensive monkey patch to protect React Virtual DOM reconciliation from browser translation extensions (e.g. Google Translate)
if (typeof window !== 'undefined' && typeof Node !== 'undefined' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return originalInsertBefore.call(this, newNode, null);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}

const rootElement = document.getElementById('zgeo-root');

if (rootElement) {
  // Ensure the root container itself has translate="no" and notranslate
  rootElement.setAttribute('translate', 'no');
  rootElement.classList.add('notranslate');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ConfigProvider
        theme={antdTheme}
        getPopupContainer={() => document.getElementById('zgeo-root') || document.body}
      >
        <AntdApp>
          <ErrorBoundary>
            <div className="notranslate" translate="no">
              <App />
            </div>
          </ErrorBoundary>
        </AntdApp>
      </ConfigProvider>
    </React.StrictMode>
  );
}
