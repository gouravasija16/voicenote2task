import React, { useState } from 'react';
import {
  CategoryIcon,
  FlameIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  InfoIcon
} from './Icons';

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, onToast }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    let textToCopy = task.title;
    if (task.dueDate) textToCopy += ` (Due: ${task.dueDate})`;
    if (task.priority === 'high') textToCopy += ` [URGENT]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onToast) onToast('Copied task to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryMeta = task.categoryMeta || {};

  return (
    <div
      className={`glass-card task-card ${task.completed ? 'is-completed' : ''}`}
      id={`task-card-${task.id}`}
      style={{
        padding: '1.25rem 1.4rem',
        borderLeft: task.priority === 'high' 
          ? '4px solid #ef4444' 
          : `4px solid ${categoryMeta.color || 'var(--border-subtle)'}`,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Completion Checkbox */}
        <div style={{ paddingTop: '0.15rem' }}>
          <input
            type="checkbox"
            id={`checkbox-${task.id}`}
            className="task-checkbox"
            checked={!!task.completed}
            onChange={() => onToggleComplete(task.id)}
            title={task.completed ? 'Mark pending' : 'Mark completed'}
          />
        </div>

        {/* Task Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top badges: Priority & Category & Due Date */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            {/* Priority Badge */}
            {task.priority === 'high' && (
              <span className="badge badge-priority-high" id={`badge-priority-${task.id}`}>
                <FlameIcon size={13} />
                <span>Urgent</span>
              </span>
            )}
            {task.priority === 'normal' && (
              <span className="badge badge-priority-normal">
                <span>Normal</span>
              </span>
            )}
            {task.priority === 'low' && (
              <span className="badge badge-priority-low">
                <span>Low Priority</span>
              </span>
            )}

            {/* Category Badge */}
            <span
              className="badge"
              id={`badge-category-${task.id}`}
              style={{
                background: categoryMeta.badgeBg || 'rgba(100, 116, 139, 0.15)',
                color: categoryMeta.color || '#94a3b8',
                border: `1px solid ${categoryMeta.border || 'rgba(100, 116, 139, 0.3)'}`
              }}
            >
              <CategoryIcon name={task.category} size={13} />
              <span>{categoryMeta.label || task.category}</span>
            </span>

            {/* Due Date Badge */}
            {task.dueDate && (
              <span className="badge badge-due-date" id={`badge-due-${task.id}`} title={task.dueDateISO ? new Date(task.dueDateISO).toLocaleString() : ''}>
                <CalendarIcon size={13} />
                <span>{task.dueDate}</span>
              </span>
            )}
          </div>

          {/* Cleaned Task Title */}
          <h3
            className="task-title"
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              lineHeight: 1.45,
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              marginBottom: '0.6rem',
              wordBreak: 'break-word'
            }}
          >
            {task.title}
          </h3>

          {/* Original Sentence Toggle */}
          {task.originalSentence && (
            <div style={{ marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowOriginal(!showOriginal)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.55rem',
                  gap: '0.35rem',
                  color: 'var(--text-dim)'
                }}
              >
                <InfoIcon size={12} />
                <span>{showOriginal ? 'Hide original excerpt' : 'View original excerpt'}</span>
              </button>

              {showOriginal && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    fontStyle: 'italic'
                  }}
                >
                  "{task.originalSentence}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', alignSelf: 'flex-start' }}>
          <button
            type="button"
            className="btn btn-icon btn-outline"
            onClick={handleCopy}
            title="Copy task"
            id={`btn-copy-${task.id}`}
          >
            {copied ? <CheckIcon size={15} style={{ color: '#10b981' }} /> : <CopyIcon size={15} />}
          </button>

          <button
            type="button"
            className="btn btn-icon btn-outline"
            onClick={() => onEdit(task)}
            title="Edit task"
            id={`btn-edit-${task.id}`}
          >
            <EditIcon size={15} />
          </button>

          <button
            type="button"
            className="btn btn-icon btn-danger-outline"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            id={`btn-delete-${task.id}`}
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
