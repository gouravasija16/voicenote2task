import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckIcon,
  LogInIcon
} from './Icons';

import './AuthModal.css';

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
          return;
        }
        await signup({ name, email, role });
        if (onToast) onToast(`Welcome to VoiceNote2Task, ${name.split(' ')[0]}! ✨`);
        closeAuthModal();
      } else {
        if (!email.trim()) {
          setErrorMsg('Please enter your email.');
          return;
        }
        const res = await login(email, password);
        if (res.success) {
          if (onToast) onToast(`Signed in as ${res.user.name} 👋`);
          closeAuthModal();
        }
      }
    } catch {
      setErrorMsg('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (userId) => {
    loginAs(userId);
    const selected = demoUsers.find((demo) => demo.id === userId);
    if (onToast && selected) {
      onToast(`Switched account to ${selected.name} (${selected.role}) ✨`);
    }
    closeAuthModal();
  };

  const isSwitching = authModalTab === 'switch';
  const isSigningUp = authModalTab === 'signup';

  return (
    <div className="auth-backdrop" onClick={closeAuthModal}>
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="auth-story" aria-label="About VoiceNote2Task">
          <div className="auth-story-brand">
            <span className="auth-brand-icon"><SparklesIcon size={20} /></span>
            <span>VoiceNote<span>2</span>Task</span>
          </div>

          <div className="auth-story-copy">
            <span className="auth-eyebrow"><span /> YOUR THOUGHTS, IN ORDER</span>
            <h2>Make space for your next big idea.</h2>
            <p>Turn a messy brain dump into a clear, actionable plan in seconds.</p>
          </div>

          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-top">
              <span className="auth-preview-dot" />
              <span className="auth-preview-dot" />
              <span className="auth-preview-dot" />
              <span className="auth-preview-label">NOTE → PLAN</span>
            </div>
            <div className="auth-preview-note">
              <span className="auth-preview-mic"><span /></span>
              <div>
                <span className="auth-preview-caption">YOUR VOICE NOTE</span>
                <p>“Send the proposal, then book time with the team…”</p>
              </div>
            </div>
            <div className="auth-preview-divider"><SparklesIcon size={14} /><span>made actionable</span></div>
            <div className="auth-preview-task"><span className="auth-preview-check"><CheckIcon size={11} /></span><span>Send project proposal</span><b>TODAY</b></div>
            <div className="auth-preview-task"><span className="auth-preview-check"><CheckIcon size={11} /></span><span>Schedule team sync</span><b>1:1</b></div>
          </div>

          <div className="auth-story-foot">
            <ShieldCheckIcon size={16} />
            <span>Private by design. Your notes stay on this device.</span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <button
            type="button"
            className="auth-close"
            onClick={closeAuthModal}
            id="close-auth-modal"
            aria-label="Close sign in dialog"
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="auth-heading">
            <span className="auth-mobile-brand"><SparklesIcon size={18} /></span>
            <span className="auth-kicker">{isSwitching ? 'PICK UP WHERE YOU LEFT OFF' : 'WELCOME TO YOUR WORKSPACE'}</span>
            <h1 id="auth-title">
              {isSwitching ? 'Choose a profile' : isSigningUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p>
              {isSwitching
                ? 'Jump into a ready-made demo workspace.'
                : isSigningUp
                ? 'A little setup, then your thoughts are in motion.'
                : 'Sign in to keep your ideas moving forward.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={authModalTab === 'signin'}
              className={authModalTab === 'signin' ? 'is-active' : ''}
              onClick={() => { setErrorMsg(''); setAuthModalTab('signin'); }}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authModalTab === 'signup'}
              className={authModalTab === 'signup' ? 'is-active' : ''}
              onClick={() => { setErrorMsg(''); setAuthModalTab('signup'); }}
            >
              Create account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSwitching}
              className={isSwitching ? 'is-active' : ''}
              onClick={() => { setErrorMsg(''); setAuthModalTab('switch'); }}
            >
              Demo profiles
            </button>
          </div>

          {errorMsg && <div className="auth-error" role="alert">{errorMsg}</div>}

          {isSwitching ? (
            <div className="auth-demo-list">
              <p className="auth-section-label">CHOOSE A WORKSPACE</p>
              {demoUsers.map((demo) => (
                <button
                  type="button"
                  key={demo.id}
                  className={`auth-demo-card ${user?.id === demo.id ? 'is-current' : ''}`}
                  onClick={() => handleSelectDemo(demo.id)}
                  id={`demo-user-btn-${demo.id}`}
                >
                  <img src={demo.avatar} alt="" />
                  <span className="auth-demo-info">
                    <strong>{demo.name}</strong>
                    <span>{demo.role} · {demo.plan}</span>
                  </span>
                  <span className="auth-demo-arrow" aria-hidden="true">→</span>
                  {user?.id === demo.id && <span className="auth-current-badge">CURRENT</span>}
                </button>
              ))}
            </div>
          ) : (
            <>
              {!isSigningUp && (
                <div className="auth-demo-shortcut">
                  <div className="auth-demo-shortcut-heading">
                    <span className="auth-section-label">SKIP THE FORM</span>
                    <span>One-click demo</span>
                  </div>
                  <div className="auth-demo-shortcut-list">
                    {demoUsers.map((demo) => (
                      <button
                        type="button"
                        key={demo.id}
                        className="auth-demo-chip"
                        onClick={() => handleSelectDemo(demo.id)}
                        id={`demo-user-btn-${demo.id}`}
                        title={`Continue as ${demo.name}`}
                      >
                        <img src={demo.avatar} alt="" />
                        <span>{demo.name.split(' ')[0]}</span>
                        <span className="auth-demo-chip-arrow" aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="auth-form-divider"><span>{isSigningUp ? 'OR CREATE WITH EMAIL' : 'OR CONTINUE WITH EMAIL'}</span></div>

              {!isSigningUp && (
                <div className="auth-demo-notice">
                  <SparklesIcon size={15} />
                  <p><strong>Demo mode</strong> — use any email address. No real password is checked.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {isSigningUp && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="auth-name">Your name</label>
                      <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Jordan Hayes"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="auth-role">Role <span>(optional)</span></label>
                      <input
                        id="auth-role"
                        type="text"
                        placeholder="e.g. Product designer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isSigningUp && (
                  <div className="auth-field">
                    <label htmlFor="auth-password">Password <span>(optional in demo)</span></label>
                    <input
                      id="auth-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter anything, or leave blank"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" id="auth-submit-btn" className="auth-submit" disabled={isLoading}>
                  {isLoading ? (
                    <><span className="auth-spinner" />{isSigningUp ? 'Creating your space…' : 'Signing you in…'}</>
                  ) : isSigningUp ? (
                    <><UserIcon size={17} />Create free account</>
                  ) : (
                    <><LogInIcon size={17} />Continue to workspace</>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="auth-trust-row">
            <span><ShieldCheckIcon size={14} /> Client-side demo</span>
            <span><CheckIcon size={14} /> No real account needed</span>
          </div>
        </div>
      </section>
    </div>
  );
}
