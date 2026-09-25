import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskStats from '../components/TaskStats';
import TaskEditModal from '../components/TaskEditModal';
import ExportModal from '../components/ExportModal';
import { TaskSkeletonCard, TaskStatsSkeleton } from '../components/Loader';
import {
  ArrowLeftIcon,
  PlusIcon,
  DownloadIcon,
  SearchIcon,
  TrashIcon,
  SparklesIcon,
  RefreshCwIcon,
  CloudCheckIcon
} from '../components/Icons';
import { getStoredTasks, saveStoredTasks, getStoredRawText } from '../utils/storage';
import { CATEGORY_DEFINITIONS } from '../utils/parser';
import { useAuth } from '../context/AuthContext';
import emptyTasksImg from '../assets/empty_tasks.jpg';

export default function Tasks({ onToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Initialize tasks from router state or fallback to localStorage
  const [tasks, setTasks] = useState(() => {
    if (location.state?.tasks && location.state.tasks.length > 0) {
      return location.state.tasks;
    }
    return getStoredTasks();
  });

  const [rawText, setRawText] = useState(() => {
    return location.state?.rawText || getStoredRawText() || '';
  });

  // Modals
  const [editingTask, setEditingTask] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'normal'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'urgent' | 'due' | 'alpha'

  // Loading skeleton — show for a brief moment on initial mount
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Persist tasks to localStorage on change
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Task actions
  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          if (onToast) onToast(updated ? 'Task completed! 🎉' : 'Marked task as pending');
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (onToast) onToast('Task deleted');
  };

  const handleSaveEdit = (updatedTask) => {
    if (updatedTask.id && tasks.some((t) => t.id === updatedTask.id)) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      if (onToast) onToast('Task updated!');
    } else {
      const newTask = {
        ...updatedTask,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks((prev) => [newTask, ...prev]);
      if (onToast) onToast('New task added!');
    }
    setEditingTask(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all tasks?')) {
      setTasks([]);
      saveStoredTasks([]);
      if (onToast) onToast('All tasks cleared');
    }
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    if (onToast) onToast('Cleared completed tasks');
  };

  // Filter and Sort Logic
  const filteredTasks = tasks.filter((task) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      const matchRaw = task.rawSentence?.toLowerCase().includes(q);
      const matchDate = task.dueDateNatural?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchRaw && !matchDate) return false;
    }

    // Status filter
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;

    // Priority filter
    if (priorityFilter === 'high' && task.priority !== 'high') return false;
    if (priorityFilter === 'normal' && task.priority === 'high') return false;

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'urgent') {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    }
    if (sortBy === 'due') {
      if (!a.dueDateISO && !b.dueDateISO) return 0;
      if (!a.dueDateISO) return 1;
      if (!b.dueDateISO) return -1;
      return new Date(a.dueDateISO) - new Date(b.dueDateISO);
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    // Default: incomplete first, then original order
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
            id="btn-back-memo"
          >
            <ArrowLeftIcon size={14} />
            <span>Back to Voice Memo</span>
          </button>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0 }}>
            Organized Tasks
          </h1>

          {isAuthenticated && user && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.75rem',
                color: '#c7d2fe'
              }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>{user.name.split(' ')[0]}'s Workspace</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.05rem 0.35rem',
                  borderRadius: '3px'
                }}
              >
                {user.plan}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            id="btn-add-task"
            className="btn btn-primary btn-sm"
            onClick={() => setEditingTask({})}
          >
            <PlusIcon size={14} />
            <span>Add Task</span>
          </button>

          <button
            type="button"
            id="btn-open-export"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsExportOpen(true)}
            disabled={tasks.length === 0}
          >
            <DownloadIcon size={14} />
            <span>Export & Sync</span>
          </button>

          {tasks.some((t) => t.completed) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleClearCompleted}
              title="Clear completed tasks"
            >
              <span>Clear Done</span>
            </button>
          )}

          {tasks.length > 0 && (
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={handleClearAll}
              title="Clear all tasks"
            >
              <TrashIcon size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      {tasks.length > 0 && <TaskStats tasks={tasks} />}

      {/* Filter, Search & Controls Bar */}
      {tasks.length > 0 && (
        <div
          className="glass-card filter-bar-card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Row 1: Search + Sort */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '360px' }}>
              <SearchIcon
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                id="search-tasks-input"
                className="custom-input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
                placeholder="Search tasks, categories, dates…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.7rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: '0.2rem'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Pills */}
            <div className="filter-pill-group" style={{ marginLeft: 'auto' }}>
              <span className="filter-pill-label">Sort</span>
              {[
                { value: 'default', icon: '⬇️', label: 'Default' },
                { value: 'urgent', icon: '🔥', label: 'Urgent' },
                { value: 'due', icon: '📅', label: 'Due Date' },
                { value: 'alpha', icon: '🔤', label: 'A–Z' }
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  id={`sort-${s.value}`}
                  className={`filter-pill ${sortBy === s.value ? 'filter-pill--active' : ''}`}
                  onClick={() => setSortBy(s.value)}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Status + Priority filter pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="filter-pill-label">Status</span>

            {[
              { value: 'all', icon: '🗂️', label: 'All', count: tasks.length },
              { value: 'pending', icon: '⏳', label: 'Pending', count: tasks.filter((t) => !t.completed).length },
              { value: 'completed', icon: '✅', label: 'Done', count: tasks.filter((t) => t.completed).length }
            ].map((s) => (
              <button
                key={s.value}
                type="button"
                id={`status-filter-${s.value}`}
                className={`filter-pill ${statusFilter === s.value ? 'filter-pill--active' : ''}`}
                onClick={() => setStatusFilter(s.value)}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                <span className={`filter-pill-count ${statusFilter === s.value ? 'filter-pill-count--active' : ''}`}>
                  {s.count}
                </span>
              </button>
            ))}

            <div className="filter-divider" />

            <span className="filter-pill-label">Priority</span>
            {[
              { value: 'all', icon: '🎯', label: 'All' },
              { value: 'high', icon: '🔥', label: 'Urgent' },
              { value: 'normal', icon: '🔵', label: 'Normal' }
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                id={`priority-filter-${p.value}`}
                className={`filter-pill ${priorityFilter === p.value ? 'filter-pill--active' : ''}`}
                onClick={() => setPriorityFilter(p.value)}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Row 3: Category Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <span className="filter-pill-label">Category</span>
              {categoryFilter !== 'all' && (
                <button
                  type="button"
                  className="filter-pill filter-pill--clear"
                  onClick={() => setCategoryFilter('all')}
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                className={`category-chip-v2 ${categoryFilter === 'all' ? 'category-chip-v2--active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                <span className="cat-chip-icon">🗂️</span>
                <span>All</span>
                <span className="cat-chip-count">{tasks.length}</span>
              </button>
              {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => {
                const count = tasks.filter((t) => t.category === key).length;
                if (count === 0 && categoryFilter !== key) return null;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`category-chip-v2 ${categoryFilter === key ? 'category-chip-v2--active' : ''}`}
                    onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
                  >
                    <span className="cat-chip-icon">{def.label.split(' ')[0]}</span>
                    <span>{def.label.split(' ').slice(1).join(' ') || def.label}</span>
                    <span className="cat-chip-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filters summary */}
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{sortedTasks.length}</strong> of {tasks.length} tasks
              </span>
              <button
                type="button"
                className="filter-pill filter-pill--clear"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}
              >
                <RefreshCwIcon size={12} />
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task List Render */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => <TaskSkeletonCard key={i} />)}
        </div>
      ) : sortedTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={() => setEditingTask(task)}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        /* Polished Empty State with Visual Illustration */
        <div
          className="glass-card empty-tasks-container"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 3D Visual Graphic */}
          <div className="empty-state-visual-wrapper">
            <img
              src={emptyTasksImg}
              alt="Empty Task List"
              style={{
                width: '130px',
                height: '130px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                boxShadow: '0 12px 35px -5px rgba(99, 102, 241, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)'
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'white' }}>
              {tasks.length === 0 ? 'No tasks parsed yet' : 'No tasks match current filters'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {tasks.length === 0
                ? 'Speak or paste a rambling stream-of-consciousness voice memo to let our pattern-matching engine organize it into structured tasks.'
                : 'Try adjusting your search query, status tabs, or category filters to see more tasks.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {tasks.length === 0 ? (
              <Link to="/" className="btn btn-primary" id="btn-empty-create-note">
                <PlusIcon size={16} />
                <span>Create Voice Note</span>
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}
              >
                <RefreshCwIcon size={14} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit / Create Task Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal
          tasks={tasks}
          rawText={rawText}
          onClose={() => setIsExportOpen(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
}
