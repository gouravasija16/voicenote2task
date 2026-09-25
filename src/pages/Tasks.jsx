import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskStats from '../components/TaskStats';
import TaskEditModal from '../components/TaskEditModal';
import ExportModal from '../components/ExportModal';
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
          className="glass-card"
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {/* Top row: Search input + Status Tabs + Sort Dropdown */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
              <SearchIcon
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                id="search-tasks-input"
                className="custom-input"
                style={{ paddingLeft: '2.3rem' }}
                placeholder="Search tasks, categories, words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.75rem' }}
                onClick={() => setStatusFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.75rem' }}
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({tasks.filter((t) => !t.completed).length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.35rem 0.75rem' }}
                onClick={() => setStatusFilter('completed')}
              >
                Completed ({tasks.filter((t) => t.completed).length})
              </button>
            </div>

            {/* Sort & Priority dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                id="filter-priority-select"
                className="custom-input"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">🔥 Urgent Only</option>
                <option value="normal">Normal Priority</option>
              </select>

              <select
                id="sort-tasks-select"
                className="custom-input"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="urgent">Sort: Urgent First</option>
                <option value="due">Sort: Earliest Due Date</option>
                <option value="alpha">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Category filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category:</span>
            <button
              type="button"
              className={`category-chip ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => {
              const count = tasks.filter((t) => t.category === key).length;
              if (count === 0 && categoryFilter !== key) return null;
              return (
                <button
                  key={key}
                  type="button"
                  className={`category-chip ${categoryFilter === key ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
                >
                  <span>{def.label}</span>
                  <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Task List Render */}
      {sortedTasks.length > 0 ? (
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
