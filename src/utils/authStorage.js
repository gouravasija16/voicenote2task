/**
 * LocalStorage helpers for Fake Authentication
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'voicenote2task_auth_user',
  REGISTERED_USERS: 'voicenote2task_registered_users'
};

// Default seed user if none exists in localStorage, so user can test immediately
const DEFAULT_TEST_USER = {
  id: 'usr_test_default',
  name: 'Taylor Swift',
  email: 'user@example.com',
  password: 'password123',
  role: 'Product Lead',
  createdAt: new Date().toISOString()
};

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) {
      // Seed default user for easy testing
      const initial = [DEFAULT_TEST_USER];
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read registered users from localStorage', err);
    return [DEFAULT_TEST_USER];
  }
}

export function saveRegisteredUser(user) {
  try {
    const users = getRegisteredUsers();
    // Check if user already exists
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    let updated;
    if (existingIndex >= 0) {
      updated = [...users];
      updated[existingIndex] = { ...updated[existingIndex], ...user };
    } else {
      updated = [...users, user];
    }
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save registered user', err);
    return false;
  }
}

export function getStoredAuthUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to read auth user from localStorage', err);
    return null;
  }
}

export function setStoredAuthUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to save auth user to localStorage', err);
  }
}

export function removeStoredAuthUser() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (err) {
    console.error('Failed to remove auth user from localStorage', err);
  }
}
