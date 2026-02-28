import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile data refresh karne ke liye function
  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Hum auth user aur firestore data ko combine kar rahe hain
        setUser({ ...auth.currentUser, ...userData, id: auth.currentUser.uid });
        setUserRole(userData.role);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await refreshUser();
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginStudent = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await refreshUser();
      return result.user;
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    }
  };

  const loginCompany = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await refreshUser();
      return result.user;
    } catch (error) {
      console.error('Company login error:', error);
      throw error;
    }
  };

  const registerStudent = async (formData) => {
    try {
      const { email, password, ...profileData } = formData;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;
      
      await setDoc(doc(db, "users", userId), {
        ...profileData,
        email,
        role: 'student',
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appliedInternships: [],
        skills: profileData.skills || [],
        extractedSkills: [],
        profileCompletion: 0,
      });

      await refreshUser();
      return { id: userId, ...profileData, email, role: 'student' };
    } catch (error) {
      console.error('Student registration error:', error);
      throw error;
    }
  };

  const registerCompany = async (formData) => {
    try {
      const { email, password, companyName, hrName, ...profileData } = formData;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;
      
      await setDoc(doc(db, "users", userId), {
        ...profileData,
        email,
        companyName,
        hrName,
        role: 'company',
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await refreshUser();
      return { id: userId, companyName, email, role: 'company' };
    } catch (error) {
      console.error('Company registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      login, 
      loginStudent,
      loginCompany,
      registerStudent,
      registerCompany,
      logout, 
      loading, 
      refreshUser 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);