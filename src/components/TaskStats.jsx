import React from 'react';
import { FlameIcon, CalendarIcon, CheckCircleIcon, SparklesIcon } from './Icons';

export default function TaskStats({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const urgent = tasks.filter(t => t.priority === 'high').length;
  const withDates = tasks.filter(t => t.dueDate).length;
  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Stat 1: Total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SparklesIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1 }}>{total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks Extracted</div>
          </div>
        </div>

        {/* Stat 2: Urgent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FlameIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1, color: urgent > 0 ? '#f87171' : 'inherit' }}>
              {urgent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent / High</div>
          </div>
        </div>

        {/* Stat 3: With Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1 }}>{withDates}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadlines Found</div>
          </div>
        </div>

        {/* Stat 4: Completed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1 }}>
              {completed}/{total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed ({percentCompleted}%)</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.07)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${percentCompleted}%`,
              height: '100%',
              background: percentCompleted === 100 
                ? '#10b981' 
                : 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
              transition: 'width 0.4s ease',
              borderRadius: 'var(--radius-full)'
            }}
          />
        </div>
      )}
    </div>
  );
}
