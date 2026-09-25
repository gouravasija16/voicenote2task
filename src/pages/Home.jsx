import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SparklesIcon,
  MicIcon,
  MicOffIcon,
  CopyIcon,
  TrashIcon,
  InfoIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  CloudCheckIcon,
  ShieldCheckIcon,
  CheckIcon
} from '../components/Icons';
import { parseVoiceNote } from '../utils/parser';
import { SAMPLE_VOICE_NOTES } from '../utils/samples';
import {
  getStoredRawText,
  saveStoredRawText,
  saveStoredTasks,
  saveToHistory,
  getNoteHistory
} from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { ParseLoader } from '../components/Loader';
import heroIllustration from '../assets/hero_illustration.jpg';

export default function Home({ onToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const recognitionRef = useRef(null);

  // If redirected here from a protected route, auto-open auth modal
  useEffect(() => {
    if (location.state?.requiresAuth && !isAuthenticated) {
      openAuthModal('signin');
    }
  }, [location.state, isAuthenticated, openAuthModal]);

  // Load previous text if any
  useEffect(() => {
    const saved = getStoredRawText();
    if (saved) {
      setInputText(saved);
    }
    setHistory(getNoteHistory());

    // Setup Web Speech API if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText((prev) => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + transcript;
        });
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (onToast) onToast(`Microphone notice: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [onToast]);

  // Toggle voice dictation
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onToast) onToast('Speech recognition is not supported in this browser. Please type or paste your voice note.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
      if (onToast) onToast('Recording stopped');
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        if (onToast) onToast('Listening... Speak your stream of thoughts!');
      } catch (err) {
        console.error('Failed to start recording', err);
        setIsRecording(false);
        if (onToast) onToast('Could not access microphone. Please check permissions.');
      }
    }
  };

  // Quick preset loader
  const handleLoadSample = (sample) => {
    setInputText(sample.text);
    if (onToast) onToast(`Loaded "${sample.title}"`);
  };

  // Submit & Parse — action form handler
  const handleOrganize = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      if (onToast) onToast('Please enter or speak some thoughts first!');
      return;
    }

    // Require login before accessing /tasks
    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to organize and save your tasks 🔐');
      openAuthModal('signin');
      return;
    }

    // Stop recording if running
    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }

    // Show loader
    setIsParsing(true);

    // Simulate a brief processing delay so the loader is visible
    await new Promise((r) => setTimeout(r, 700));

    // Run pure client-side pattern matching NLP
    const result = parseVoiceNote(inputText);

    // Save to localStorage
    saveStoredRawText(inputText);
    saveStoredTasks(result.tasks);
    saveToHistory(inputText, result.tasks);

    setIsParsing(false);

    // Navigate to /tasks with results in state
    navigate('/tasks', {
      state: {
        tasks: result.tasks,
        rawText: inputText,
        stats: result.stats
      }
    });
  };

  const handleClear = () => {
    setInputText('');
    saveStoredRawText('');
    if (onToast) onToast('Cleared input text');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        if (onToast) onToast('Pasted from clipboard!');
      }
    } catch {
      if (onToast) onToast('Could not read clipboard. Please paste manually.');
    }
  };

  // Word & Duration count
  const words = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.round(words / 2.3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Parse Loading Overlay */}
      {isParsing && <ParseLoader message="Organising your voice note…" />}

      {/* Top Hero Section with Illustration */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Headlines & Context */}
          <div className="hero-text-content">
            {/* Status / Welcome Pill */}
            <div className="hero-badge">
              {isAuthenticated && user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>Welcome back, {user.name} • {user.workspace}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SparklesIcon size={14} />
                  <span>Natural Language Task Extraction • 100% Private & Offline</span>
                </div>
              )}
            </div>

            <h1 className="hero-title">
              Turn Messy Voice Memos into <span className="gradient-text">Actionable Tasks</span>
            </h1>

            <p className="hero-subtitle">
              Speak freely or dump your stream-of-consciousness transcript. Our smart heuristic engine
              automatically strips verbal clutter, detects urgency, calculates precise deadlines, and groups items by category.
            </p>

            {/* Feature Pills */}
            <div className="hero-feature-tags">
              <div className="hero-tag">
                <ShieldCheckIcon size={14} style={{ color: '#10b981' }} />
                <span>Zero Server Uploads</span>
              </div>
              <div className="hero-tag">
                <CheckIcon size={14} style={{ color: '#6366f1' }} />
                <span>Sub-second Parsing</span>
              </div>
              <div className="hero-tag">
                <CloudCheckIcon size={14} style={{ color: '#ec4899' }} />
                <span>ICS Calendar Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image with Glass Highlights */}
          <div className="hero-visual-card">
            <div className="hero-image-wrapper">
              <img
                src={heroIllustration}
                alt="Voice Note to Task AI Conversion Illustration"
                className="hero-image"
              />
              <div className="hero-image-glow" />

              {/* Floating Overlays */}
              <div className="floating-badge floating-badge-top">
                <span className="live-dot" />
                <span>Real-Time Voice Heuristics</span>
              </div>

              <div className="floating-badge floating-badge-bottom">
                <SparklesIcon size={14} style={{ color: '#a855f7' }} />
                <span>Automatic Due Date Extraction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Input Card */}
      <section className="glass-card" style={{ padding: '1.75rem', position: 'relative' }}>
        <form onSubmit={handleOrganize}>
          {/* Card Header & Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Rambling Transcript / Brain Dump
              </span>

              {/* Dictation Status */}
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="waveform-bars">
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>
                    Listening...
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Dictate Button */}
              <button
                type="button"
                id="btn-voice-dictate"
                className={`btn btn-sm ${isRecording ? 'btn-mic-recording' : 'btn-outline'}`}
                onClick={toggleRecording}
                title={isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
              >
                {isRecording ? <MicOffIcon size={15} /> : <MicIcon size={15} />}
                <span>{isRecording ? 'Stop Dictating' : 'Dictate Memo'}</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handlePaste}
                title="Paste from clipboard"
              >
                <CopyIcon size={14} />
                <span>Paste</span>
              </button>

              {inputText && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleClear}
                  title="Clear text"
                >
                  <TrashIcon size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Large Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              id="voice-note-textarea"
              className="custom-textarea"
              placeholder="e.g. Uh hey so I really need to call Sarah tomorrow morning about the Q3 budget report, and oh yeah don't forget to buy oat milk and eggs tonight on the way home, also urgent bug fix on the payment webhook ASAP before Friday..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={7}
            />

            {/* Word / Duration metadata inside textarea footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              <div>
                <span>{words} words</span>
                {words > 0 && (
                  <span style={{ marginLeft: '0.75rem' }}>
                    • Estimated spoken time: ~{estimatedSeconds < 60 ? `${estimatedSeconds}s` : `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`}
                  </span>
                )}
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <RefreshCwIcon size={12} />
                  <span>Recent Memos ({history.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent History Drawer */}
          {showHistory && history.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                Restore a Previous Voice Memo:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInputText(item.rawText);
                      setShowHistory(false);
                      if (onToast) onToast('Restored previous memo!');
                    }}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>{item.taskCount} tasks identified</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.preview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Presets Chips */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              💡 Or click to load a sample rambling voice note:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SAMPLE_VOICE_NOTES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  id={`sample-btn-${sample.id}`}
                  className="btn btn-outline btn-sm sample-preset-btn"
                  onClick={() => handleLoadSample(sample)}
                  style={{
                    fontSize: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-full)'
                  }}
                  title={sample.description}
                >
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Submit CTA */}
          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              id="organize-tasks-btn"
              className="btn btn-primary btn-lg"
              disabled={isParsing}
              style={{
                width: '100%',
                maxWidth: '320px',
                gap: '0.75rem',
                opacity: isParsing ? 0.75 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isParsing ? (
                <>
                  <span style={{ animation: 'spin 0.75s linear infinite', display: 'inline-block' }}>⚙️</span>
                  <span>Organising…</span>
                </>
              ) : !isAuthenticated ? (
                <>
                  <span>🔐</span>
                  <span>Sign In to Organise</span>
                  <ArrowRightIcon size={16} />
                </>
              ) : (
                <>
                  <SparklesIcon size={18} />
                  <span>Organise Tasks</span>
                  <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Feature Explanations */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="glass-card feature-highlight-card" style={{ padding: '1.5rem' }}>
          <div className="feature-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            🧠
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>
            Filler Stripping
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Removes conversational clutter like "uh", "um", "I really need to", and "don't forget to", keeping only crisp, actionable verb-first tasks.
          </p>
        </div>

        <div className="glass-card feature-highlight-card" style={{ padding: '1.5rem' }}>
          <div className="feature-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            📅
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>
            Due Date Resolution
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Detects natural language deadlines ("tomorrow morning", "next Tuesday at 3pm", "tonight") and calculates exact timestamps for calendar export.
          </p>
        </div>

        <div className="glass-card feature-highlight-card" style={{ padding: '1.5rem' }}>
          <div className="feature-icon-badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            🏷️
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>
            Smart Categorization
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Categorizes into Work, Dev/Tech, Finance, Shopping, Health, and Communication with automated priority scoring (Urgent/Normal/Low).
          </p>
        </div>
      </section>
    </div>
  );
}
