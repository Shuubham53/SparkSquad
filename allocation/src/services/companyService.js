import { db } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  arrayUnion
} from "firebase/firestore";

/**
 * Get company profile from Firestore
 */
export async function getCompanyProfile(companyId) {
  try {
    const docRef = doc(db, "users", companyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) throw new Error('Company not found');
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
}

/**
 * Update company profile in Firestore
 */
export async function updateCompanyProfile(companyId, updates) {
  try {
    const companyRef = doc(db, "users", companyId);
    await updateDoc(companyRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: companyId, ...updates };
  } catch (error) {
    console.error('Error updating company profile:', error);
    throw error;
  }
}

/**
 * Post a new internship
 */
export async function postInternship(companyId, internshipData) {
  try {
    const internshipRef = collection(db, "internships");
    const docRef = await addDoc(internshipRef, {
      ...internshipData,
      companyId,
      isActive: true,
      applicants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...internshipData };
  } catch (error) {
    console.error('Error posting internship:', error);
    throw error;
  }
}

/**
 * Get all internships for a company
 */
export async function getMyInternships(companyId) {
  try {
    const q = query(collection(db, "internships"), where("companyId", "==", companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
}

/**
 * Update an internship
 */
export async function updateInternship(internshipId, updates) {
  try {
    const internshipRef = doc(db, "internships", internshipId);
    await updateDoc(internshipRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: internshipId, ...updates };
  } catch (error) {
    console.error('Error updating internship:', error);
    throw error;
  }
}

/**
 * Delete an internship
 */
export async function deleteInternship(internshipId) {
  try {
    const internshipRef = doc(db, "internships", internshipId);
    await deleteDoc(internshipRef);
    return { id: internshipId, deleted: true };
  } catch (error) {
    console.error('Error deleting internship:', error);
    throw error;
  }
}

/**
 * Get all applicants for an internship
 */
export async function getApplicants(internshipId) {
  try {
    const internshipRef = doc(db, "internships", internshipId);
    const snap = await getDoc(internshipRef);
    
    if (snap.exists()) {
      const data = snap.data();
      // Add id to each applicant for easier management
      return (data.applicants || []).map((app, idx) => ({
        ...app,
        id: app.studentId || `applicant-${idx}` // Use studentId as id if available
      })).sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
    return [];
  } catch (error) {
    console.error('Error fetching applicants:', error);
    throw error;
  }
}

/**
 * Kisi specific internship ke saare applicants fetch karna
 */
export const getInternshipApplicants = async (internshipId) => {
  const internshipRef = doc(db, "internships", internshipId);
  const snap = await getDoc(internshipRef);
  
  if (snap.exists()) {
    const data = snap.data();
    // Applicants ko match percentage ke hisaab se sort karna (Best match first)
    return (data.applicants || []).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
  return [];
};

/**
 * Applicant ka status update karna (Accept/Reject)
 */
export const updateApplicantStatus = async (internshipId, studentId, newStatus) => {
  const internshipRef = doc(db, "internships", internshipId);
  const snap = await getDoc(internshipRef);
  
  if (snap.exists()) {
    const applicants = snap.data().applicants.map(app => {
      if (app.studentId === studentId) {
        return { ...app, applicationStatus: newStatus };
      }
      return app;
    });

    await updateDoc(internshipRef, { applicants });
    
    // Student ki profile mein bhi status update karna (Optional but better UX)
    const studentRef = doc(db, "users", studentId);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      const appliedList = studentSnap.data().appliedInternships.map(app => {
        if (app.internshipId === internshipId) {
          return { ...app, applicationStatus: newStatus };
        }
        return app;
      });
      await updateDoc(studentRef, { appliedInternships: appliedList });
    }
  }
};