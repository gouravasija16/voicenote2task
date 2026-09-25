import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CheckIcon } from './components/Icons';

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Background ambient gradient orbs */}
        <div className="ambient-glow-mesh" aria-hidden="true">
          <div className="ambient-orb-1" />
          <div className="ambient-orb-2" />
          <div className="ambient-orb-3" />
        </div>

        <div className="app-layout">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home onToast={showToast} />} />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks onToast={showToast} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Auth Modal */}
          <AuthModal onToast={showToast} />

          {/* Global Toast Notification */}
          {toastMessage && (
            <div className="toast-container" role="status" aria-live="polite">
              <div className="toast">
                <CheckIcon size={16} style={{ color: '#10b981' }} />
                <span>{toastMessage}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              zIndex: 10
            }}
          >
            <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>VoiceNote2Task</span>
                <span>•</span>
                <span>Stream-of-consciousness to actionable tasks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                <span>🔒 100% Client-Side Privacy</span>
                <span>⚡ Zero API Keys Required</span>
                <span>📅 Instant ICS Export</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
