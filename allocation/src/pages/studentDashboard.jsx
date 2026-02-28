import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import EmptyState from '../components/ui/EmptyState';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import InternshipCard from '../components/dashboard/InternshipCard';
import CareerPathRecommendation from '../components/dashboard/CareerPathRecommendation';
import {
  LayoutDashboard, Search, ClipboardList, User, Target, Send,
  Star, Upload, FileText, Sparkles, X, MapPin, GraduationCap, Building, Calendar, Briefcase, BookOpen, Mail, Phone
} from 'lucide-react';
import {
  getStudentProfile, updateStudentProfile, saveResumeSkills,
  getSuggestedInternships, applyToInternship, getAppliedInternships,
} from '../services/studentService';
import { extractTextFromPDF, processResumeAI } from '../utils/resumeParser';
import { extractSkillsFromText } from '../utils/skillDatabase';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [active, setActive] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [accepted, setAccepted] = useState([]);
  const fileRef = useRef();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const prof = await getStudentProfile(user.id);
      setProfile(prof);
      setEditForm(prof);
      const internships = await getSuggestedInternships(user.id);
      setInternships(internships);
      const appliedList = await getAppliedInternships(user.id);
      setApplied(appliedList);
      const acceptedList = appliedList.filter(app => app.applicationStatus === 'accepted');
      setAccepted(acceptedList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApply = useCallback(async (id) => {
    setApplying(id);
    try {
      await applyToInternship(user.id, id);
      toast.success('Applied successfully!');
      await loadData();
    } catch (err) {
      console.error('Error applying:', err);
      toast.error(err.message || 'Application failed');
    } finally {
      setApplying(null);
    }
  }, [user.id, loadData]);

const handleResumeUpload = useCallback(async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadingResume(true);
  try {
    const result = await processResumeAI(user.id, file);
    
    if (result.success) {
      await refreshUser();
      toast.success(`Resume processed by AI!`);
      await loadData();
    } else {
      toast.error(result.error);
    }
  } catch (err) {
    console.error('Error uploading resume:', err);
    toast.error('Resume parsing failed');
  } finally {
    setUploadingResume(false);
  }
}, [user.id, refreshUser, loadData]);

  const handleProfileUpdate = useCallback(async () => {
    try {
      const { profileCompletion, extractedSkills, resumeText, resumeFile, role, id, email, createdAt, ...rest } = editForm;
      await updateStudentProfile(user.id, rest);
      await refreshUser();
      toast.success('Profile updated!');
      setEditMode(false);
      await loadData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Update failed');
    }
  }, [editForm, user.id, refreshUser, loadData]);

  const addSkill = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const s = skillInput.trim().toLowerCase();
      if (s && !editForm.skills?.includes(s)) {
        setEditForm(prev => ({ ...prev, skills: [...(prev.skills || []), s] }));
      }
      setSkillInput('');
    }
  }, [skillInput, editForm.skills]);

  const removeSkill = useCallback((s) => {
    setEditForm(prev => ({ ...prev, skills: (prev.skills || []).filter(x => x !== s) }));
  }, []);

  const sidebarItems = useMemo(() => [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'internships', label: 'Find Internships', icon: Search, count: internships.length },
    { key: 'applied', label: 'Applied', icon: ClipboardList, count: applied.length },
    { key: 'accepted', label: 'Accepted', icon: Star, count: accepted.length },
    { key: 'career', label: 'Career Path Recommendation', icon: Target },
    { key: 'profile', label: 'Profile', icon: User },
  ], [internships.length, applied.length, accepted.length]);

  const appliedIds = useMemo(() => applied.map(i => i.id), [applied]);

  const avgMatch = useMemo(() => {
    if (!internships.length) return 0;
    return Math.round(internships.reduce((s, i) => s + i.matchPercentage, 0) / internships.length);
  }, [internships]);

  const allSkills = useMemo(() =>
    [...new Set([...(profile?.skills || []), ...(profile?.extractedSkills || [])])],
    [profile],
  );

  const topMatch = internships[0];

  if (loading) {
    return (
      <DashboardLayout role="student" items={sidebarItems} activeItem={active} onItemClick={setActive}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" items={sidebarItems} activeItem={active} onItemClick={setActive}>
      {/* ========== Overview ========== */}
      {active === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {profile?.name} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your internship overview.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Target} label="Matched Internships" value={internships.length} color="indigo" />
            <StatsCard icon={Send} label="Applications Sent" value={applied.length} color="violet" />
            <StatsCard icon={Star} label="Avg Match Score" value={`${avgMatch}%`} color="emerald" />
            <StatsCard icon={GraduationCap} label="Your CGPA" value={profile?.cgpa || 'N/A'} color="blue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resume Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-500" /> Resume
                </h2>
                <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs py-1.5">
                  <Upload size={14} /> {uploadingResume ? 'Parsing...' : 'Upload'}
                </button>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
              </div>
              {profile?.resumeText ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200">
                  <FileText size={24} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Resume Uploaded</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{(profile.extractedSkills || []).length} skills extracted</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center border-2 border-dashed border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => fileRef.current?.click()}>
                  <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-500 text-sm">Upload resume to extract skills</p>
                </div>
              )}
            </div>

            {/* Skills Card */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-violet-500" /> Skills ({allSkills.length})
              </h2>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {allSkills.length > 0 ? allSkills.map(s => <span key={s} className="badge badge-indigo text-xs">{s}</span>) : <p className="text-slate-400 text-sm">No skills found.</p>}
              </div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Profile Completion</h2>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{profile?.profileCompletion || 0}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${profile?.profileCompletion || 0}%` }} />
            </div>
          </div>
          
          {topMatch && (
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Target size={18} className="text-indigo-500" /> Best Match
              </h2>
              <InternshipCard
                internship={topMatch} onApply={handleApply}
                applying={applying === topMatch.id} isApplied={appliedIds.includes(topMatch.id)}
              />
            </div>
          )}
        </div>
      )}

      {/* ========== Profile ========== */}
      {active === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <div className="flex gap-2">
              {editMode && <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>}
              <button
                onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
                className={editMode ? 'btn-primary' : 'btn-secondary'}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="card">
            {editMode ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text' },
                    { key: 'phone', label: 'Phone', type: 'text' },
                    { key: 'college', label: 'College', type: 'text' },
                    { key: 'degree', label: 'Degree', type: 'text' },
                    { key: 'year', label: 'Year', type: 'text' },
                    { key: 'location', label: 'Location', type: 'text' },
                    { key: 'cgpa', label: 'CGPA', type: 'number' },
                    { key: 'preferredRole', label: 'Preferred Role', type: 'text' },
                    { key: 'interests', label: 'Interests', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input
                        type={f.type}
                        step={f.key === 'cgpa' ? '0.01' : undefined}
                        className="input-field" value={editForm[f.key] || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', value: profile?.name, icon: User },
                    { label: 'Email', value: profile?.email, icon: Mail },
                    { label: 'Phone', value: profile?.phone, icon: Phone },
                    { label: 'College', value: profile?.college, icon: Building },
                    { label: 'Degree', value: profile?.degree, icon: GraduationCap },
                    { label: 'Year', value: profile?.year, icon: Calendar },
                    { label: 'Location', value: profile?.location, icon: MapPin },
                    { label: 'CGPA', value: profile?.cgpa, icon: Sparkles },
                    { label: 'Preferred Role', value: profile?.preferredRole, icon: Briefcase },
                    { label: 'Interests', value: profile?.interests, icon: BookOpen },
                  ].map(f => (
                    <div key={f.label} className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <f.icon size={16} className="text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">
                          {f.label}
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {f.value || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}