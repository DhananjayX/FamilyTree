import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an external service here
    console.error('ErrorBoundary caught an error', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, border: '1px solid #f5c2c7', background: '#fff1f2' }}>
          <h3 style={{ marginTop: 0 }}>Something went wrong rendering the tree.</h3>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#611a15' }}>
            {String(this.state.error && this.state.error.toString())}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={this.reset} style={{ marginRight: 8 }}>Retry</button>
            <button onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
