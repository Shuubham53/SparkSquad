import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { KEYS, get, set, remove, getList, addToList, generateId } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = get(KEYS.CURRENT_USER);
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const registerStudent = useCallback(({ name, email, password, phone, college, degree, year, interests, preferredRole, skills }) => {
    const students = getList(KEYS.STUDENTS);
    if (students.find(s => s.email === email)) throw new Error('Email already registered');
    const student = {
      id: generateId(), role: 'student', name, email, password, phone, college, degree, year,
      interests, preferredRole, skills: skills || [], extractedSkills: [], resumeText: '',
      resumeFile: null,
      resumeScore: 0,
      profileCompletion: 0,
      savedInternships: [],
      appliedInternships: [], // { internshipId, status }
      interviewChecklist: {}, // { [career]: { [item]: true/false } }
      experience: [],
      createdAt: new Date().toISOString(),
    };
    addToList(KEYS.STUDENTS, student);
    const userData = { ...student };
    delete userData.password;
    setUser(userData);
    set(KEYS.CURRENT_USER, userData);
    return userData;
  }, []);

  const registerCompany = useCallback(({ companyName, email, password, hrName, industry, website, description }) => {
    const companies = getList(KEYS.COMPANIES);
    if (companies.find(c => c.email === email)) throw new Error('Email already registered');
    const company = {
      id: generateId(), role: 'company', companyName, email, password, hrName, industry,
      website, description, name: hrName, createdAt: new Date().toISOString(),
    };
    addToList(KEYS.COMPANIES, company);
    const userData = { ...company };
    delete userData.password;
    setUser(userData);
    set(KEYS.CURRENT_USER, userData);
    return userData;
  }, []);

  const loginStudent = useCallback((email, password) => {
    const student = getList(KEYS.STUDENTS).find(s => s.email === email && s.password === password);
    if (!student) throw new Error('Invalid email or password');
    const userData = { ...student };
    delete userData.password;
    setUser(userData);
    set(KEYS.CURRENT_USER, userData);
    return userData;
  }, []);

  const loginCompany = useCallback((email, password) => {
    const company = getList(KEYS.COMPANIES).find(c => c.email === email && c.password === password);
    if (!company) throw new Error('Invalid email or password');
    const userData = { ...company };
    delete userData.password;
    setUser(userData);
    set(KEYS.CURRENT_USER, userData);
    return userData;
  }, []);

  const refreshUser = useCallback(() => {
    setUser(prev => {
      if (!prev) return null;
      const key = prev.role === 'student' ? KEYS.STUDENTS : KEYS.COMPANIES;
      const fresh = getList(key).find(u => u.id === prev.id);
      if (fresh) {
        const userData = { ...fresh };
        delete userData.password;
        set(KEYS.CURRENT_USER, userData);
        return userData;
      }
      return prev;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    remove(KEYS.CURRENT_USER);
  }, []);

  const value = useMemo(() => ({
    user, loading, isAuthenticated: !!user,
    registerStudent, registerCompany, loginStudent, loginCompany, refreshUser, logout,
  }), [user, loading, registerStudent, registerCompany, loginStudent, loginCompany, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
