import { useEffect, useState } from 'react';
import './App.css';

type ConnectionState = 'checking' | 'online' | 'offline';

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
  const [backendMessage, setBackendMessage] = useState('Đang kiểm tra kết nối backend...');

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

  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="brand-pill">ControlCenter Hub</div>
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

      <footer className="connection-footer">
        <span className={`status-dot ${connectionState}`} />
        <span className="connection-label">Backend connection:</span>
        <strong>{backendMessage}</strong>
      </footer>
    </main>
  );
}

export default App;
