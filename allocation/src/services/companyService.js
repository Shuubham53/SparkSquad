/**
 * Get analytics for all internships posted by a company.
 * Returns: totalApplicants, avgMatch, highestScore, mostCommonSkill, growthData
 */
export function getInternshipAnalytics(companyId) {
  const internships = getList(KEYS.INTERNSHIPS).filter(i => i.companyId === companyId);
  let totalApplicants = 0;
  let matchSum = 0;
  let matchCount = 0;
  let highestScore = 0;
  const skillCounts = {};
  const growthData = [];

  internships.forEach(int => {
    (int.applicants || []).forEach(app => {
      totalApplicants++;
      // Find student for resumeScore, skills, etc.
      const students = getList(KEYS.STUDENTS);
      const student = students.find(s => s.id === app.studentId) || {};
      const allSkills = [
        ...new Set([
          ...(student.skills || []).map(s => s.toLowerCase()),
          ...(student.extractedSkills || []).map(s => s.toLowerCase()),
        ]),
      ];
      // Match %
      const { matchPercentage } = calculateMatch(allSkills, int.requiredSkills);
      matchSum += matchPercentage;
      matchCount++;
      // Highest score
      const resumeScore = typeof student.resumeScore === 'number' ? student.resumeScore : 0;
      const skillDensity = (student.resumeText && allSkills.length)
        ? Math.round((allSkills.length / student.resumeText.split(/\s+/).length) * 10000) / 100
        : 0;
      const finalScore = Math.round((matchPercentage * 0.5 + resumeScore * 0.3 + skillDensity * 0.2) * 100) / 100;
      if (finalScore > highestScore) highestScore = finalScore;
      // Skills
      allSkills.forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; });
      // Growth data
      if (app.appliedAt) {
        growthData.push({ date: app.appliedAt.split('T')[0], count: 1 });
      }
    });
  });

  // Most common skill
  let mostCommonSkill = '';
  let mostCount = 0;
  Object.entries(skillCounts).forEach(([skill, count]) => {
    if (count > mostCount) {
      mostCommonSkill = skill;
      mostCount = count;
    }
  });

  // Aggregate growth data by date
  const growthByDate = {};
  growthData.forEach(({ date, count }) => {
    growthByDate[date] = (growthByDate[date] || 0) + count;
  });
  const growthChart = Object.entries(growthByDate)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({ date, count }));

  return {
    totalApplicants,
    avgMatch: matchCount ? Math.round((matchSum / matchCount) * 10) / 10 : 0,
    highestScore,
    mostCommonSkill,
    growthChart,
  };
}
import { KEYS, getList, set, generateId } from '../utils/storage';
import { calculateMatch } from '../utils/skillDatabase';

/**
 * Get company profile by id.
 */
export function getCompanyProfile(companyId) {
  const company = getList(KEYS.COMPANIES).find((c) => c.id === companyId);
  if (!company) throw new Error('Company not found');
  const { password, ...profile } = company;
  return profile;
}

/**
 * Update company profile fields.
 */
export function updateCompanyProfile(companyId, updates) {
  const companies = getList(KEYS.COMPANIES);
  const idx = companies.findIndex((c) => c.id === companyId);
  if (idx === -1) throw new Error('Company not found');
  companies[idx] = { ...companies[idx], ...updates };
  set(KEYS.COMPANIES, companies);
  return companies[idx];
}

/**
 * Post a new internship.
 * Stores companyName so every student can see it globally.
 */
export function postInternship(companyId, data) {
  const companies = getList(KEYS.COMPANIES);
  const company = companies.find((c) => c.id === companyId);
  const internship = {
    id: generateId(),
    companyId,
    companyName: company?.companyName || 'Unknown',
    role: data.role,
    description: data.description,
    requiredSkills: data.requiredSkills || [],
    stipend: data.stipend || 'Unpaid',
    duration: data.duration || 'Not specified',
    location: data.location || 'Remote',
    isActive: true,
    applicants: [],
    createdAt: new Date().toISOString(),
  };
  const internships = getList(KEYS.INTERNSHIPS);
  internships.push(internship);
  set(KEYS.INTERNSHIPS, internships);
  return internship;
}

/**
 * Get internships posted by a company.
 */
export function getMyInternships(companyId) {
  return getList(KEYS.INTERNSHIPS).filter((i) => i.companyId === companyId);
}

/**
 * Update an internship.
 */
export function updateInternship(internshipId, updates) {
  const internships = getList(KEYS.INTERNSHIPS);
  const idx = internships.findIndex((i) => i.id === internshipId);
  if (idx === -1) throw new Error('Internship not found');
  internships[idx] = { ...internships[idx], ...updates };
  set(KEYS.INTERNSHIPS, internships);
  return internships[idx];
}

/**
 * Delete an internship and clean up all related data.
 */
export function deleteInternship(internshipId) {
  const internships = getList(KEYS.INTERNSHIPS);
  const internship = internships.find((i) => i.id === internshipId);
  const filtered = internships.filter((i) => i.id !== internshipId);
  set(KEYS.INTERNSHIPS, filtered);

  // Remove from each student's appliedInternships
  if (internship && internship.applicants?.length > 0) {
    const students = getList(KEYS.STUDENTS);
    let updated = false;
    for (const app of internship.applicants) {
      const stIdx = students.findIndex((s) => s.id === app.studentId);
      if (stIdx !== -1 && students[stIdx].appliedInternships) {
        students[stIdx].appliedInternships = students[stIdx].appliedInternships.filter(
          (a) => a.internshipId !== internshipId
        );
        updated = true;
      }
    }
    if (updated) set(KEYS.STUDENTS, students);
  }

  // Also clean legacy APPLICATIONS
  const applications = getList(KEYS.APPLICATIONS).filter((a) => a.internshipId !== internshipId);
  set(KEYS.APPLICATIONS, applications);
}

/**
 * Get all applicants for an internship.
 * Reads from internship.applicants[] (rich objects).
 */
export function getApplicants(internshipId) {
  const internships = getList(KEYS.INTERNSHIPS);
  const internship = internships.find((i) => i.id === internshipId);
  if (!internship) return [];

  const students = getList(KEYS.STUDENTS);

  // Helper: calculate skill density (skills per 100 words)
  function calcSkillDensity(skills, resumeText) {
    if (!resumeText || !skills?.length) return 0;
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount === 0) return 0;
    return Math.round((skills.length / wordCount) * 10000) / 100; // per 100 words, 2 decimals
  }

  // Compose applicant objects with ranking info
  let applicants = (internship.applicants || []).map((app) => {
    const student = students.find((s) => s.id === app.studentId) || {};
    const allSkills = [
      ...new Set([
        ...(student.skills || []).map((s) => s.toLowerCase()),
        ...(student.extractedSkills || []).map((s) => s.toLowerCase()),
      ]),
    ];
    const { matchPercentage, matchedSkills, missingSkills } = calculateMatch(allSkills, internship.requiredSkills);
    const resumeScore = typeof student.resumeScore === 'number' ? student.resumeScore : 0;
    const skillDensity = calcSkillDensity(allSkills, student.resumeText);
    // Weighted final score
    const finalScore = Math.round((matchPercentage * 0.5 + resumeScore * 0.3 + skillDensity * 0.2) * 100) / 100;
    return {
      id: app.studentId,
      name: app.studentName || student.name || 'Unknown',
      email: app.email || student.email,
      phone: student.phone,
      college: student.college,
      degree: student.degree,
      year: student.year,
      interests: student.interests,
      preferredRole: student.preferredRole,
      skills: student.skills || [],
      extractedSkills: student.extractedSkills || [],
      resumeFile: student.resumeFile || null,
      resumeText: student.resumeText || '',
      matchPercentage,
      matchedSkills,
      missingSkills,
      resumeScore,
      skillDensity,
      finalScore,
      applicationStatus: app.status === 'Applied' ? 'pending' : app.status,
    };
  });

  // Sort by finalScore descending
  applicants.sort((a, b) => b.finalScore - a.finalScore);

  // Assign ranking badges
  applicants = applicants.map((a, idx) => {
    let rankingBadge = '';
    if (idx === 0) rankingBadge = 'top';
    else if (idx === 1) rankingBadge = 'strong';
    else rankingBadge = 'potential';
    return { ...a, rankingBadge };
  });

  return applicants;
}

/**
 * Update applicant status (accepted / rejected).
 * Syncs across internship.applicants, student.appliedInternships, and APPLICATIONS.
 */
export function updateApplicantStatus(internshipId, studentId, status) {
  // Mock SMS notification
  try {
    const internships = getList(KEYS.INTERNSHIPS);
    const internship = internships.find(i => i.id === internshipId);
    const companies = getList(KEYS.COMPANIES);
    const company = companies.find(c => c.id === internship?.companyId);
    const students = getList(KEYS.STUDENTS);
    const student = students.find(s => s.id === studentId);
    if (student && company && internship) {
      const msg = `TalentFlow: ${company.companyName} has ${status === 'accepted' ? 'accepted' : 'rejected'} your application for the role '${internship.role}'.`;
      // Simulate SMS send (replace with real API call if needed)
      if (typeof window !== 'undefined') {
        if (window?.toast) window.toast(msg); // If toast is globally available
      }
      // Always log for demo
      console.log(`[SMS to ${student.phone || 'N/A'}]: ${msg}`);
    }
  } catch (e) { /* ignore mock errors */ }
  // 1. Update in internship.applicants
  const internships = getList(KEYS.INTERNSHIPS);
  const intIdx = internships.findIndex((i) => i.id === internshipId);
  if (intIdx === -1) throw new Error('Internship not found');
  const appIdx = (internships[intIdx].applicants || []).findIndex((a) => a.studentId === studentId);
  if (appIdx === -1) throw new Error('Applicant not found');
  internships[intIdx].applicants[appIdx].status = status;
  set(KEYS.INTERNSHIPS, internships);

  // 2. Update in student.appliedInternships
  const students = getList(KEYS.STUDENTS);
  const stIdx = students.findIndex((s) => s.id === studentId);
  if (stIdx !== -1 && students[stIdx].appliedInternships) {
    const appliedIdx = students[stIdx].appliedInternships.findIndex((a) => a.internshipId === internshipId);
    if (appliedIdx !== -1) {
      students[stIdx].appliedInternships[appliedIdx].status = status;
      set(KEYS.STUDENTS, students);
    }
  }

  // 3. Update legacy APPLICATIONS
  const applications = getList(KEYS.APPLICATIONS);
  const aIdx = applications.findIndex((a) => a.internshipId === internshipId && a.studentId === studentId);
  if (aIdx !== -1) {
    applications[aIdx].status = status;
    set(KEYS.APPLICATIONS, applications);
  }
}
