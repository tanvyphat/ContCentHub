import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type ConnectionState = 'checking' | 'online' | 'offline';

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
  const [backendMessage, setBackendMessage] = useState('Đang kiểm tra kết nối backend...');
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('cch-review-auth') === '1',
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

    fetch(`${apiBaseUrl}/api`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.text();
        setBackendMessage(data);
        setConnectionState('online');
      })
      .catch(() => {
        setBackendMessage('Không kết nối được backend');
        setConnectionState('offline');
      });
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.trim().length > 0 && password.length >= 8) {
      sessionStorage.setItem('cch-review-auth', '1');
      setIsAuthenticated(true);
      setLoginError('');
      return;
    }

    setLoginError('Please enter the review account credentials provided for testing.');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cch-review-auth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  return (
    <main className="landing-page">
      {!isAuthenticated ? (
        <section className="login-shell">
          <div className="login-copy">
            <div className="brand-pill">ControlCenter Hub</div>
            <h1>ContCentHub</h1>
            <p>
              Multi-marketplace operations platform for centralized warehouse,
              order and analytics management.
            </p>
            <div className="login-tags">
              <span>Warehouse Management</span>
              <span>Data Analytics</span>
              <span>Shopee Integration</span>
            </div>
          </div>

          <form className="login-card" onSubmit={handleLogin}>
            <span className="section-label">Reviewer Access</span>
            <h2>Sign in to ContCentHub</h2>
            <p className="login-helper">
              Use the review credentials provided in the Shopee Open Platform application.
            </p>

            <label>
              Username
              <input
                type="email"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="review@example.com"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={8}
                required
              />
            </label>

            {loginError && <div className="login-error">{loginError}</div>}

            <button type="submit">Sign in</button>
          </form>
        </section>
      ) : (
        <>
          <section className="hero-section dashboard-hero">
            <div className="topbar">
              <div className="brand-pill">ControlCenter Hub</div>
              <button className="logout-button" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>

            <h1>ContCentHub</h1>
            <p className="hero-copy">
              Nền tảng quản trị đa sàn tập trung cho vận hành thương mại điện tử,
              giúp quản lý cửa hàng, đơn hàng, tồn kho và dữ liệu trên một hệ thống duy nhất.
            </p>

            <div className="integration-row" aria-label="Marketplace integrations">
              <span>Shopee Integration</span>
              <span>TikTok Shop Ready</span>
              <span>Centralized Operations</span>
            </div>
          </section>

          <section className="features-section">
            <article className="feature-card">
              <div className="feature-index">01</div>
              <h2>Warehouse Management</h2>
              <p>
                Theo dõi tồn kho, vận hành kho và luồng xử lý hàng hóa tập trung cho nhiều kênh bán hàng.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-index">02</div>
              <h2>Order Operations</h2>
              <p>
                Chuẩn hóa quy trình quản lý đơn hàng, trạng thái xử lý và dữ liệu cửa hàng từ nhiều marketplace.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-index">03</div>
              <h2>Data Analytics</h2>
              <p>
                Tổng hợp dữ liệu bán hàng và vận hành để hỗ trợ theo dõi hiệu suất và ra quyết định nhanh hơn.
              </p>
            </article>
          </section>

          <section className="review-section">
            <div>
              <span className="section-label">Platform Preview</span>
              <h2>Built for scalable marketplace operations</h2>
            </div>
            <p>
              ContCentHub đang được phát triển theo kiến trúc API-first để tích hợp chính thức với các nền tảng thương mại điện tử.
            </p>
          </section>
        </>
      )}

      <footer className="connection-footer">
        <span className={`status-dot ${connectionState}`} />
        <span className="connection-label">Backend connection:</span>
        <strong>{backendMessage}</strong>
      </footer>
    </main>
  );
}

export default App;
