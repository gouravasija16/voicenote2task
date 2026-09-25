import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckIcon,
  LogInIcon
} from './Icons';

export default function AuthModal({ onToast }) {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    loginAs,
    signup,
    demoUsers,
    user
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Product Lead');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authModalTab === 'signup') {
        if (!name.trim() || !email.trim()) {
          setErrorMsg('Please enter both your name and email address.');
          setIsLoading(false);
          return;
        }
        await signup({ name, email, role });
        if (onToast) onToast(`Welcome to VoiceNote2Task, ${name.split(' ')[0]}! ✨`);
        closeAuthModal();
      } else {
        if (!email.trim()) {
          setErrorMsg('Please enter your email.');
          setIsLoading(false);
          return;
        }
        const res = await login(email, password);
        if (res.success) {
          if (onToast) onToast(`Signed in as ${res.user.name} 👋`);
          closeAuthModal();
        }
      }
    } catch (err) {
      setErrorMsg('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (userId) => {
    loginAs(userId);
    const selected = demoUsers.find((u) => u.id === userId);
    if (onToast && selected) {
      onToast(`Switched account to ${selected.name} (${selected.role}) ✨`);
    }
    closeAuthModal();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="glass-card auth-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
          background: 'linear-gradient(165deg, rgba(26, 31, 56, 0.95) 0%, rgba(13, 17, 33, 0.98) 100%)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          id="close-auth-modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Close modal"
        >
          ✕
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <SparklesIcon size={24} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
            {authModalTab === 'switch'
              ? 'Choose Workspace Account'
              : authModalTab === 'signup'
              ? 'Create Your VoiceNote Account'
              : 'Sign In to VoiceNote2Task'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Instant client-side task structuring & cross-device persistence
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${authModalTab === 'signin' ? 'btn-primary' : ''}`}
            onClick={() => setAuthModalTab('signin')}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              background: authModalTab === 'signin' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              color: authModalTab === 'signin' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${authModalTab === 'signup' ? 'btn-primary' : ''}`}
            onClick={() => setAuthModalTab('signup')}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              background: authModalTab === 'signup' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              color: authModalTab === 'signup' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`btn btn-sm ${authModalTab === 'switch' ? 'btn-primary' : ''}`}
            onClick={() => setAuthModalTab('switch')}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              background: authModalTab === 'switch' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              color: authModalTab === 'switch' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Demo Profiles
          </button>
        </div>

        {/* 1-Click Demo Profiles Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-dim)',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>⚡ 1-Click Instant Demo Login:</span>
            <span style={{ color: 'var(--accent-secondary)', fontSize: '0.7rem' }}>No password required</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {demoUsers.map((demo) => {
              const isCurrent = user?.id === demo.id;
              return (
                <div
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo.id)}
                  id={`demo-user-btn-${demo.id}`}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: isCurrent
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isCurrent
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCurrent
                      ? 'var(--accent-primary)'
                      : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <img
                    src={demo.avatar}
                    alt={demo.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {demo.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {demo.role}
                    </div>
                  </div>
                  {isCurrent && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 6px #10b981'
                      }}
                      title="Currently Active"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {authModalTab !== 'switch' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.25rem 0',
                gap: '0.75rem',
                color: 'var(--text-dim)',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              <span>OR ENTER CREDENTIALS</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {authModalTab === 'signup' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="e.g. Jordan Hayes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Role or Title
                    </label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="e.g. Engineering Lead, Founder"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="search-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="search-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontSize: '0.95rem'
                }}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : authModalTab === 'signup' ? (
                  <>
                    <UserIcon size={16} />
                    <span>Create Free Account</span>
                  </>
                ) : (
                  <>
                    <LogInIcon size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Security & Feature Badges */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-around',
            fontSize: '0.75rem',
            color: 'var(--text-dim)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheckIcon size={14} style={{ color: '#10b981' }} />
            <span>100% Client-side</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckIcon size={14} style={{ color: '#6366f1' }} />
            <span>Instant Sync</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <SparklesIcon size={14} style={{ color: '#ec4899' }} />
            <span>Zero Data Leak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
