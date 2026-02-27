import { db } from '../config/firebase'; 
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc,
  arrayUnion 
} from 'firebase/firestore';
import { calculateMatch } from '../utils/skillDatabase';

/**
 * Get student profile from Firestore.
 */
export async function getStudentProfile(studentId) {
  const docRef = doc(db, "users", studentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) throw new Error('Student not found');
  
  const profile = docSnap.data();
  
  // Profile completion logic (Updated to include Location and CGPA)
  const fields = ['name', 'email', 'phone', 'college', 'degree', 'year', 'interests', 'preferredRole', 'location', 'cgpa'];
  let completion = 0;
  
  // Checking basic fields
  const filledFields = fields.filter(f => !!profile[f]);
  completion += (filledFields.length / fields.length) * 30; // 30% for basic info

  if ((profile.skills?.length || 0) + (profile.extractedSkills?.length || 0) > 0) completion += 20;
  if (profile.resumeFile || profile.resumeText) completion += 30;
  if (profile.interests && profile.interests.length > 0) completion += 10;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) completion += 10;
  
  return { ...profile, id: studentId, profileCompletion: Math.min(100, Math.round(completion)) };
}

/**
 * Update student profile in Firestore.
 */
export async function updateStudentProfile(studentId, updates) {
  const studentRef = doc(db, "users", studentId);
  await updateDoc(studentRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  return { id: studentId, ...updates };
}

/**
 * Get Suggested Internships based on AI Match (including Location & CGPA).
 */
export async function getSuggestedInternships(studentId) {
  // 1. Get student profile with new fields
  const student = await getStudentProfile(studentId);
  const allSkills = [
    ...new Set([
      ...(student.skills || []).map(s => s.toLowerCase()),
      ...(student.extractedSkills || []).map(s => s.toLowerCase())
    ])
  ];

  // 2. Get active internships from Firestore
  const q = query(collection(db, "internships"), where("isActive", "==", true));
  const querySnapshot = await getDocs(q);
  
  const internships = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 3. Map and Sort by Match % using Skills, Location, and CGPA
  return internships
    .map((internship) => {
      // Skill Match
      const { matchPercentage, matchedSkills, missingSkills } = calculateMatch(allSkills, internship.requiredSkills || []);
      
      let finalMatchScore = matchPercentage;

      // Location Match Bonus (+10% score if location matches)
      if (student.location && internship.location && 
          student.location.toLowerCase().includes(internship.location.toLowerCase())) {
        finalMatchScore += 10;
      }

      // CGPA criteria (Basic check: if student CGPA is >= 8.0, slight boost)
      if (parseFloat(student.cgpa) >= 8.0) {
        finalMatchScore += 5;
      }

      return {
        ...internship,
        matchPercentage: Math.min(100, Math.round(finalMatchScore)),
        matchedSkills,
        missingSkills,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Apply to an internship.
 */
export async function applyToInternship(studentId, internshipId) {
  const studentRef = doc(db, "users", studentId);
  const internshipRef = doc(db, "internships", internshipId);

  const studentSnap = await getDoc(studentRef);
  const internshipSnap = await getDoc(internshipRef);

  if (!studentSnap.exists() || !internshipSnap.exists()) throw new Error('Data not found');

  const student = studentSnap.data();
  const internship = internshipSnap.data();

  // Check if already applied
  if (student.appliedInternships?.some(app => app.internshipId === internshipId)) {
    throw new Error('Already applied to this internship');
  }

  // Calculate Match % including new factors for the application record
  const allSkills = [...new Set([...(student.skills || []), ...(student.extractedSkills || [])])];
  let { matchPercentage } = calculateMatch(allSkills, internship.requiredSkills || []);
  
  // Add Location Bonus to application record
  if (student.location && internship.location && 
      student.location.toLowerCase().includes(internship.location.toLowerCase())) {
    matchPercentage = Math.min(100, matchPercentage + 10);
  }

  const applicationData = {
    studentId,
    studentName: student.name,
    email: student.email,
    location: student.location || 'Not Provided',
    cgpa: student.cgpa || 'N/A',
    matchPercentage: Math.round(matchPercentage),
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  // Update Firestore (Atomic Updates)
  await updateDoc(internshipRef, {
    applicants: arrayUnion(applicationData)
  });

  await updateDoc(studentRef, {
    appliedInternships: arrayUnion({
      internshipId,
      status: 'pending',
      appliedAt: new Date().toISOString()
    })
  });

  return { internshipId, status: 'pending' };
}

/**
 * Save Resume Skills and update Firestore.
 */
export async function saveResumeSkills(studentId, skills, text, resumeBase64) {
  const studentRef = doc(db, "users", studentId);
  await updateDoc(studentRef, {
    extractedSkills: skills,
    resumeText: text,
    resumeFile: resumeBase64,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Get Applied Internships for a student.
 */
export async function getAppliedInternships(studentId) {
  const studentRef = doc(db, "users", studentId);
  const studentSnap = await getDoc(studentRef);
  
  if (!studentSnap.exists()) return [];
  
  const studentData = studentSnap.data();
  const applied = studentData.appliedInternships || [];
  
  if (applied.length === 0) return [];
  
  // Fetch full internship details for each application
  const fullAppliedList = await Promise.all(
    applied.map(async (app) => {
      const iRef = doc(db, "internships", app.internshipId);
      const iSnap = await getDoc(iRef);
      if (iSnap.exists()) {
        const internshipData = iSnap.data();
        // Sync application status from the internship's applicant list if needed
        return { 
          ...internshipData, 
          id: app.internshipId, 
          applicationStatus: app.status, 
          appliedAt: app.appliedAt 
        };
      }
      return null;
    })
  );
  
  return fullAppliedList.filter(Boolean);
}