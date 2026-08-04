import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in Game:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#181824',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '70px', marginBottom: '1rem' }}>😵‍💫</span>
          <h1 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '0.5rem' }}>
            Đã Xảy Ra Lỗi Bất Ngờ!
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Đừng lo lắng, dữ liệu kho đồ và số xu của bạn vẫn an toàn trong localStorage.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-cute" 
              onClick={() => window.location.reload()}
              style={{ background: '#10b981' }}
            >
              🔄 Tải Lại Trang Web
            </button>
            <button 
              className="btn-cute" 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ background: '#ef4444' }}
            >
              🗑️ Reset Dữ Liệu Ban Đầu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
