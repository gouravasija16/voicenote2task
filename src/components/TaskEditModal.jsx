import React, { useState } from 'react';
import { CATEGORY_DEFINITIONS } from '../utils/parser';

export default function TaskEditModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [category, setCategory] = useState(task?.category || 'work');
  const [priority, setPriority] = useState(task?.priority || 'normal');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      category,
      categoryMeta: CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.general,
      priority,
      dueDate: dueDate.trim() || null
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            {task?.id ? 'Edit Parsed Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            className="btn btn-icon btn-outline"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Cleaned Task Title *
            </label>
            <input
              type="text"
              id="edit-task-title"
              className="custom-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call Sarah regarding Q3 budget report"
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                id="edit-task-category"
                className="custom-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key} style={{ background: '#111726', color: '#f8fafc' }}>
                    {def.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Priority
              </label>
              <select
                id="edit-task-priority"
                className="custom-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="high" style={{ background: '#111726', color: '#f87171' }}>🔥 Urgent / High</option>
                <option value="normal" style={{ background: '#111726', color: '#60a5fa' }}>Normal</option>
                <option value="low" style={{ background: '#111726', color: '#94a3b8' }}>🌱 Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Detected Due Date / Time
            </label>
            <input
              type="text"
              id="edit-task-duedate"
              className="custom-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Tomorrow morning (9:00 AM) or Next Tuesday"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
              Leave blank if no deadline applies
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="save-task-btn" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
