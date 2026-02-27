import { db } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc 
} from "firebase/firestore";

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
        return { ...app, status: newStatus };
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
          return { ...app, status: newStatus };
        }
        return app;
      });
      await updateDoc(studentRef, { appliedInternships: appliedList });
    }
  }
};