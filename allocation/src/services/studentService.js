import { KEYS, getList, set, generateId } from '../utils/storage';
import { calculateMatch } from '../utils/skillDatabase';

/**
 * Get student profile by id.
 */
export function getStudentProfile(studentId) {
  const student = getList(KEYS.STUDENTS).find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found');
  const { password, ...profile } = student;
  // Modular profile completion calculation
  const fields = ['name', 'email', 'phone', 'college', 'degree', 'year', 'interests', 'preferredRole'];
  let completion = 0;
  if (fields.every(f => !!profile[f])) completion += 20;
  if ((profile.skills?.length || 0) + (profile.extractedSkills?.length || 0) > 0) completion += 20;
  if (profile.resumeFile || profile.resumeText) completion += 30;
  if (profile.interests && profile.interests.length > 0) completion += 10;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) completion += 20;
  profile.profileCompletion = Math.min(100, completion);
  return profile;
}

/**
 * Update student profile fields.
 */
export function updateStudentProfile(studentId, updates) {
  const students = getList(KEYS.STUDENTS);
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) throw new Error('Student not found');
  students[idx] = { ...students[idx], ...updates };
  set(KEYS.STUDENTS, students);
  return students[idx];
}

/**
 * Store extracted skills, resume text, and optional base64 resume file on a student.
 */
export function saveResumeSkills(studentId, extractedSkills, resumeText, resumeFile) {
  const students = getList(KEYS.STUDENTS);
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) throw new Error('Student not found');
  students[idx].extractedSkills = extractedSkills;
  students[idx].resumeText = resumeText;
  if (resumeFile !== undefined) students[idx].resumeFile = resumeFile;
  set(KEYS.STUDENTS, students);
  return students[idx];
}

/**
 * Get full student profile by id (for company HR viewing).
 * Includes all fields: skills, extractedSkills, resumeFile, resumeText, etc.
 */
export function getFullStudentProfile(studentId) {
  const student = getList(KEYS.STUDENTS).find((s) => s.id === studentId);
  if (!student) return null;
  const { password, ...profile } = student;
  return profile;
}

/**
 * Get all skills for a student (manual + extracted, deduplicated).
 */
export function getAllStudentSkills(studentId) {
  const student = getList(KEYS.STUDENTS).find((s) => s.id === studentId);
  if (!student) return [];
  const combined = new Set([
    ...(student.skills || []).map((s) => s.toLowerCase()),
    ...(student.extractedSkills || []).map((s) => s.toLowerCase()),
  ]);
  return [...combined];
}

/**
 * Get ALL active internships for the student, sorted by match %.
 * Every internship stored in LocalStorage is visible to every student.
 */
export function getSuggestedInternships(studentId) {
  const allSkills = getAllStudentSkills(studentId);
  const internships = getList(KEYS.INTERNSHIPS).filter((i) => i.isActive);
  const companies = getList(KEYS.COMPANIES);

  return internships
    .map((internship) => {
      const { matchPercentage, matchedSkills, missingSkills } = calculateMatch(allSkills, internship.requiredSkills);
      const company = companies.find((c) => c.id === internship.companyId) || {};
      return {
        ...internship,
        matchPercentage,
        matchedSkills,
        missingSkills,
        companyName: internship.companyName || company.companyName || 'Unknown',
        companyIndustry: company.industry || '',
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Apply to an internship.
 * Stores rich applicant object in internship.applicants[]
 * and tracking entry in student.appliedInternships[].
 */
export function applyToInternship(studentId, internshipId) {
  // 1. Get student
  const students = getList(KEYS.STUDENTS);
  const stIdx = students.findIndex((s) => s.id === studentId);
  if (stIdx === -1) throw new Error('Student not found');
  const student = students[stIdx];

  // 2. Check if already applied
  if (!student.appliedInternships) student.appliedInternships = [];
  if (student.appliedInternships.find((a) => a.internshipId === internshipId)) {
    throw new Error('Already applied to this internship');
  }

  // 3. Calculate match
  const allSkills = [
    ...new Set([
      ...(student.skills || []).map((s) => s.toLowerCase()),
      ...(student.extractedSkills || []).map((s) => s.toLowerCase()),
    ]),
  ];

  const internships = getList(KEYS.INTERNSHIPS);
  const intIdx = internships.findIndex((i) => i.id === internshipId);
  if (intIdx === -1) throw new Error('Internship not found');

  const { matchPercentage } = calculateMatch(allSkills, internships[intIdx].requiredSkills);

  // 4. Add rich applicant object to internship.applicants
  if (!internships[intIdx].applicants) internships[intIdx].applicants = [];
  internships[intIdx].applicants.push({
    studentId,
    studentName: student.name,
    email: student.email,
    extractedSkills: allSkills,
    matchPercentage,
    status: 'pending',
  });
  set(KEYS.INTERNSHIPS, internships);

  // 5. Add to student.appliedInternships
  student.appliedInternships.push({
    internshipId,
    status: 'pending',
  });
  students[stIdx] = student;
  set(KEYS.STUDENTS, students);

  // 6. Also store in APPLICATIONS for backward compatibility
  const applications = getList(KEYS.APPLICATIONS);
  applications.push({
    id: generateId(),
    studentId,
    internshipId,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  });
  set(KEYS.APPLICATIONS, applications);

  return { internshipId, status: 'pending' };
}

/**
 * Get all internships a student has applied to, with current status.
 * Reads from student.appliedInternships and syncs latest status
 * from internship.applicants[].
 */
export function getAppliedInternships(studentId) {
  const students = getList(KEYS.STUDENTS);
  const student = students.find((s) => s.id === studentId);
  if (!student) return [];

  // Primary source: student.appliedInternships
  let appliedList = student.appliedInternships || [];

  // Fallback: merge any entries only in legacy APPLICATIONS
  const legacyApps = getList(KEYS.APPLICATIONS).filter((a) => a.studentId === studentId);
  const existingIds = new Set(appliedList.map((a) => a.internshipId));
  for (const app of legacyApps) {
    if (!existingIds.has(app.internshipId)) {
      appliedList.push({ internshipId: app.internshipId, status: app.status });
    }
  }

  const internships = getList(KEYS.INTERNSHIPS);
  const companies = getList(KEYS.COMPANIES);
  const allSkills = getAllStudentSkills(studentId);

  return appliedList
    .map((app) => {
      const internship = internships.find((i) => i.id === app.internshipId);
      if (!internship) return null;
      const company = companies.find((c) => c.id === internship.companyId) || {};
      const { matchPercentage, matchedSkills, missingSkills } = calculateMatch(allSkills, internship.requiredSkills || []);

      // Get latest status from internship.applicants (source of truth for accept/reject)
      const applicantEntry = (internship.applicants || []).find((a) => a.studentId === studentId);
      const latestStatus = applicantEntry?.status || app.status;

      return {
        ...internship,
        applicationStatus: latestStatus,
        matchPercentage,
        matchedSkills,
        missingSkills,
        companyName: internship.companyName || company.companyName || 'Unknown',
        companyIndustry: company.industry || '',
      };
    })
    .filter(Boolean);
}
