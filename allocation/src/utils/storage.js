// 1. LocalStorage Keys definition
export const KEYS = {
  STUDENTS: 'students',
  COMPANIES: 'companies',
  INTERNSHIPS: 'internships',
  CURRENT_USER: 'currentUser',
  APPLICATIONS: 'applications',
};

// 2. Core LocalStorage utility helpers
export function get(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(key);
}

// 3. Generic List Helpers
export function getList(key) {
  return get(key) || [];
}

export function addToList(key, item) {
  const list = getList(key);
  list.push(item);
  set(key, list);
  return list;
}

export function updateInList(key, id, updates) {
  const list = getList(key).map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  set(key, list);
  return list;
}

export function removeFromList(key, id) {
  const list = getList(key).filter((item) => item.id !== id);
  set(key, list);
  return list;
}

export function findInList(key, predicate) {
  return getList(key).find(predicate) || null;
}

// 4. Checklist Progress Helpers for Interview Prep
export function getChecklistProgress(studentId, career) {
  const students = getList(KEYS.STUDENTS);
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) return {};
  return students[idx].interviewChecklist?.[career] || {};
}

export function setChecklistProgress(studentId, career, checklist) {
  const students = getList(KEYS.STUDENTS);
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) return;

  const updatedStudents = [...students];
  updatedStudents[idx] = {
    ...updatedStudents[idx],
    interviewChecklist: {
      ...updatedStudents[idx].interviewChecklist,
      [career]: checklist,
    },
  };
  set(KEYS.STUDENTS, updatedStudents);
}

// 5. ID Generator
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}