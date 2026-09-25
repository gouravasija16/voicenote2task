/**
 * LocalStorage helpers for VoiceNote2Task persistence
 */

const STORAGE_KEYS = {
  CURRENT_TASKS: 'voicenote2task_current_tasks',
  CURRENT_RAW_TEXT: 'voicenote2task_current_raw_text',
  HISTORY: 'voicenote2task_history',
  THEME: 'voicenote2task_theme'
};

export function getStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read tasks from localStorage', err);
    return [];
  }
}

export function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function getStoredRawText() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_RAW_TEXT) || '';
  } catch {
    return '';
  }
}

export function saveStoredRawText(text) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_RAW_TEXT, text);
  } catch (err) {
    console.error('Failed to save raw text to localStorage', err);
  }
}

export function getNoteHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(rawText, tasks) {
  if (!rawText || !rawText.trim()) return;
  try {
    const history = getNoteHistory();
    const newEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rawText: rawText.trim(),
      taskCount: tasks.length,
      highPriorityCount: tasks.filter(t => t.priority === 'high').length,
      preview: rawText.trim().slice(0, 100) + (rawText.length > 100 ? '...' : '')
    };
    // Keep last 10 entries
    const updated = [newEntry, ...history.filter(h => h.rawText !== rawText.trim())].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to history', err);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}
