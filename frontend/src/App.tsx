import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Đang kết nối backend...');

  useEffect(() => {
    fetch('http://localhost:8080/api')
        .then((response) => response.text())
        .then((data) => setMessage(data))
        .catch(() => setMessage('Không kết nối được backend'));
  }, []);

  return (
      <main style={{ padding: 40 }}>
        <h1>ContCentHub</h1>
        <p>Backend response:</p>
        <strong>{message}</strong>
      </main>
  );
}

export default App;