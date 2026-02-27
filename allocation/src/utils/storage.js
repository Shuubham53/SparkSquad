// Checklist progress helpers for interview prep
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
  students[idx].interviewChecklist = {
    ...students[idx].interviewChecklist,
    [career]: checklist,
  };
  set(KEYS.STUDENTS, students);
}
// LocalStorage utility helpers
const KEYS = {
  STUDENTS: 'students',
  COMPANIES: 'companies',
  INTERNSHIPS: 'internships',
  CURRENT_USER: 'currentUser',
  APPLICATIONS: 'applications',
};

function get(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key) {
  localStorage.removeItem(key);
}

// ---------- generic list helpers ----------
function getList(key) {
  return get(key) || [];
}

function addToList(key, item) {
  const list = getList(key);
  list.push(item);
  set(key, list);
  return list;
}

function updateInList(key, id, updates) {
  const list = getList(key).map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  set(key, list);
  return list;
}

function removeFromList(key, id) {
  const list = getList(key).filter((item) => item.id !== id);
  set(key, list);
  return list;
}

function findInList(key, predicate) {
  return getList(key).find(predicate) || null;
}

// ---------- ID generator ----------
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export { KEYS, get, set, remove, getList, addToList, updateInList, removeFromList, findInList, generateId };
