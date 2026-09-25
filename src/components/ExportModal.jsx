import React, { useState } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './Icons';
import { downloadICS } from '../utils/icsGenerator';

export default function ExportModal({ tasks, onClose, onToast }) {
  const [activeTab, setActiveTab] = useState('markdown');
  const [copied, setCopied] = useState(false);

  // Formats
  const generateMarkdown = () => {
    return tasks.map(t => {
      const check = t.completed ? 'x' : ' ';
      let line = `- [${check}] ${t.title}`;
      if (t.priority === 'high') line += ' ⚡ [URGENT]';
      if (t.dueDate) line += ` (Due: ${t.dueDate})`;
      line += ` #${t.category}`;
      return line;
    }).join('\n');
  };

  const generatePlainText = () => {
    return tasks.map((t, i) => {
      const status = t.completed ? '[DONE]' : '[TODO]';
      let line = `${i + 1}. ${status} ${t.title}`;
      if (t.dueDate) line += ` | Due: ${t.dueDate}`;
      if (t.priority === 'high') line += ' | URGENT';
      return line;
    }).join('\n');
  };

  const generateJSON = () => {
    return JSON.stringify(tasks, null, 2);
  };

  const getContent = () => {
    if (activeTab === 'markdown') return generateMarkdown();
    if (activeTab === 'plain') return generatePlainText();
    return generateJSON();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    if (onToast) onToast('Copied exported list to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadICS = () => {
    const success = downloadICS(tasks);
    if (success) {
      if (onToast) onToast('Downloaded calendar .ics file!');
    } else {
      if (onToast) onToast('No tasks with detected due dates to export!');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Export Parsed Tasks
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Export your structured task list to Markdown, Calendar, or JSON
            </p>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-outline"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'markdown' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('markdown')}
          >
            Markdown Checklist
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'plain' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('plain')}
          >
            Plain Text
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'json' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('json')}
          >
            Raw JSON
          </button>
        </div>

        {/* Preview box */}
        <div style={{ marginBottom: '1.25rem' }}>
          <textarea
            readOnly
            value={getContent()}
            className="custom-textarea"
            style={{
              minHeight: '180px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleDownloadICS}
            id="btn-download-ics"
            title="Download .ics event file for Google Calendar, Apple Calendar, Outlook"
          >
            <DownloadIcon size={14} />
            <span>Download .ICS Calendar</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCopy} id="btn-copy-export">
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
