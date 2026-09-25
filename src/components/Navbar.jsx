import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SparklesIcon,
  PlusIcon,
  UserIcon,
  LogOutIcon,
  LogInIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  CloudCheckIcon,
  RefreshCwIcon
} from './Icons';
import { getStoredTasks } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const tasks = getStoredTasks();
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-link" id="brand-home-link">
          <div className="brand-logo-icon">
            <SparklesIcon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">VoiceNote2Task</span>
              <span className="brand-tag">Client-side NLP</span>
            </div>
          </div>
        </Link>

        <nav className="nav-actions">
          <Link
            to="/"
            id="nav-new-note"
            className={`btn btn-sm ${location.pathname === '/' ? 'btn-primary' : 'btn-outline'}`}
          >
            <PlusIcon size={15} />
            <span>New Voice Note</span>
          </Link>

          <Link
            to="/tasks"
            id="nav-view-tasks"
            className={`btn btn-sm ${location.pathname === '/tasks' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ position: 'relative' }}
          >
            <span>My Tasks</span>
            {tasks.length > 0 && (
              <span
                style={{
                  background: pendingCount > 0 ? 'var(--accent-primary)' : '#10b981',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginLeft: '0.3rem'
                }}
              >
                {tasks.length}
              </span>
            )}
          </Link>

          {/* Authentication Section */}
          {isAuthenticated && user ? (
            <div className="user-profile-menu-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                id="user-profile-btn"
                className="btn btn-outline btn-sm user-nav-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.6rem 0.25rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  borderColor: isDropdownOpen ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
                  background: isDropdownOpen ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)'
                }}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div style={{ position: 'relative', width: '26px', height: '26px' }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '1.5px solid #0f172a'
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDownIcon
                  size={13}
                  style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    color: 'var(--text-muted)'
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="glass-card user-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.15)',
                    background: 'linear-gradient(170deg, rgba(23, 27, 48, 0.98) 0%, rgba(13, 17, 33, 0.98) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  {/* User Profile Card */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-primary)'
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </div>
                      <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            color: 'white'
                          }}
                        >
                          {user.plan || 'PRO'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sync Status Info */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                      <CloudCheckIcon size={14} />
                      <span style={{ fontWeight: 500 }}>Workspace Synced</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>0ms latency</span>
                  </div>

                  {/* Action Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                      type="button"
                      id="switch-profile-action"
                      className="btn btn-outline btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        padding: '0.5rem 0.65rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)'
                      }}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openAuthModal('switch');
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <RefreshCwIcon size={14} style={{ color: 'var(--accent-secondary)' }} />
                      <span>Switch Demo Profile</span>
                    </button>

                    <button
                      type="button"
                      id="sign-out-action"
                      className="btn btn-outline btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        padding: '0.5rem 0.65rem',
                        border: 'none',
                        background: 'transparent',
                        color: '#f87171'
                      }}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOutIcon size={14} />
                      <span>Sign Out (Guest Mode)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                id="nav-login-btn"
                className="btn btn-outline btn-sm"
                onClick={() => openAuthModal('signin')}
                style={{ gap: '0.4rem' }}
              >
                <LogInIcon size={14} />
                <span>Log In</span>
              </button>
              <button
                type="button"
                id="nav-demo-account-btn"
                className="btn btn-primary btn-sm"
                onClick={() => openAuthModal('switch')}
                style={{ gap: '0.4rem' }}
              >
                <SparklesIcon size={14} />
                <span>Demo Profiles</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
