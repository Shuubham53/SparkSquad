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
  Star, Upload, FileText, Sparkles, X,
} from 'lucide-react';
import {
  getStudentProfile, updateStudentProfile, saveResumeSkills,
  getSuggestedInternships, applyToInternship, getAppliedInternships,
} from '../services/studentService';
import { extractTextFromPDF } from '../utils/resumeParser';
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

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const prof = getStudentProfile(user.id);
      setProfile(prof);
      setEditForm(prof);
      setInternships(getSuggestedInternships(user.id));
      const appliedList = getAppliedInternships(user.id);
      setApplied(appliedList);
      // Filter accepted applications - applicationStatus is already synced from internship.applicants
      const acceptedList = appliedList.filter(app => app.applicationStatus === 'accepted');
      setAccepted(acceptedList);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApply = useCallback((id) => {
    setApplying(id);
    try {
      applyToInternship(user.id, id);
      toast.success('Applied successfully!');
      loadData();
    } catch (err) {
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
      const text = await extractTextFromPDF(file);
      const extracted = extractSkillsFromText(text);
      // Convert PDF to base64 data URL for storage and preview
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resumeBase64 = await base64Promise;
      saveResumeSkills(user.id, extracted, text, resumeBase64);
      refreshUser();
      toast.success(`${extracted.length} skills extracted!`);
      loadData();
    } catch {
      toast.error('Resume parsing failed');
    } finally {
      setUploadingResume(false);
    }
  }, [user.id, refreshUser, loadData]);

  const handleProfileUpdate = useCallback(() => {
    try {
      const { profileCompletion, extractedSkills, resumeText, resumeFile, role, id, email, createdAt, ...rest } = editForm;
      updateStudentProfile(user.id, rest);
      refreshUser();
      toast.success('Profile updated!');
      setEditMode(false);
      loadData();
    } catch {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard icon={Target} label="Matched Internships" value={internships.length} color="indigo" />
            <StatsCard icon={Send} label="Applications Sent" value={applied.length} color="violet" />
            <StatsCard icon={Star} label="Avg Match Score" value={`${avgMatch}%`} color="emerald" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resume */}
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
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10
                                rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                  <FileText size={24} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Resume Uploaded</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {(profile.extractedSkills || []).length} skills extracted
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-center
                                border-2 border-dashed border-slate-200 dark:border-slate-600
                                hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                     onClick={() => fileRef.current?.click()}>
                  <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Upload resume to extract skills</p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-violet-500" /> Skills ({allSkills.length})
              </h2>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {allSkills.length > 0 ? allSkills.map(s => (
                  <span key={s} className="badge badge-indigo text-xs">{s}</span>
                )) : (
                  <p className="text-slate-400 text-sm">Upload resume or add skills in profile.</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile completion */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Profile Completion</h2>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {profile?.profileCompletion || 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${profile?.profileCompletion || 0}%` }}
              />
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

      {/* ========== Find Internships ========== */}
      {active === 'internships' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find Internships</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All internships, sorted by skill match</p>
            </div>
            <span className="badge badge-indigo">{internships.length} matches</span>
          </div>

          {internships.length === 0 ? (
            <EmptyState
              icon={Search} title="No Matches Yet"
              description="Upload your resume and add skills to get matched."
              action={() => setActive('profile')} actionLabel="Update Profile"
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {internships.map(i => (
                <InternshipCard
                  key={i.id} internship={i} onApply={handleApply}
                  applying={applying === i.id} isApplied={appliedIds.includes(i.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Applied ========== */}
      {active === 'applied' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applied Internships</h1>
            <span className="badge badge-indigo">{applied.length}</span>
          </div>

          {applied.length === 0 ? (
            <EmptyState
              icon={ClipboardList} title="No Applications"
              description="Browse internships and apply."
              action={() => setActive('internships')} actionLabel="Browse"
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {applied.map(i => (
                <InternshipCard key={i.id} internship={i} isApplied applicationStatus={i.applicationStatus} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Accepted ========== */}
      {active === 'accepted' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accepted Internships</h1>
            <span className="badge badge-emerald">{accepted.length}</span>
          </div>
          {accepted.length === 0 ? (
            <EmptyState
              icon={Star} title="No Accepted Offers"
              description="Accepted internships will appear here."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {accepted.map(i => (
                <InternshipCard key={i.id} internship={i} isApplied applicationStatus={i.applicationStatus} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Career Path Recommendation ========== */}
      {active === 'career' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Path Recommendation</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Personalized career paths based on your skills</p>
          </div>
          <CareerPathRecommendation skills={allSkills} />
        </div>
      )}

      {/* ========== Profile ========== */}
      {active === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <button
              onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
              className={editMode ? 'btn-primary' : 'btn-secondary'}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="card">
            {editMode ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'college', label: 'College' },
                    { key: 'degree', label: 'Degree' },
                    { key: 'year', label: 'Year' },
                    { key: 'preferredRole', label: 'Preferred Role' },
                    { key: 'interests', label: 'Interests' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input
                        className="input-field" value={editForm[f.key] || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Skills (Press Enter to add)</label>
                  <div className="input-field !p-2 flex flex-wrap gap-2 min-h-[46px] !ring-0
                                  focus-within:!ring-2 focus-within:!ring-indigo-500/40
                                  focus-within:!border-indigo-500">
                    {(editForm.skills || []).map(s => (
                      <span key={s} className="badge badge-indigo flex items-center gap-1">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className="outline-none bg-transparent text-sm flex-1 min-w-[120px] px-1
                                 text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Add skill..." value={skillInput}
                      onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Resume</label>
                  <div className="flex items-center gap-3">
                    {profile?.resumeFile ? (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Resume Uploaded</span>
                    ) : (
                      <span className="text-slate-400 text-sm">No resume uploaded</span>
                    )}
                    <button
                      type="button"
                      className="btn-secondary text-xs py-1.5 px-3"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingResume}
                    >
                      <Upload size={14} /> {profile?.resumeFile ? 'Replace Resume' : 'Upload Resume'}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                  </div>
                  {uploadingResume && <p className="text-xs text-indigo-500 mt-1">Parsing and extracting skills...</p>}
                </div>
                <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', value: profile?.name },
                    { label: 'Email', value: profile?.email },
                    { label: 'Phone', value: profile?.phone },
                    { label: 'College', value: profile?.college },
                    { label: 'Degree', value: profile?.degree },
                    { label: 'Year', value: profile?.year },
                    { label: 'Preferred Role', value: profile?.preferredRole },
                    { label: 'Interests', value: profile?.interests },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                        {f.label}
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{f.value || '—'}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Manual Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.skills || []).length > 0 ? (
                      profile.skills.map(s => <span key={s} className="badge badge-indigo text-xs">{s}</span>)
                    ) : (
                      <p className="text-slate-400 text-sm">No skills added</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Resume Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.extractedSkills || []).filter(s => !profile?.skills?.includes(s)).length > 0 ? (
                      profile.extractedSkills
                        .filter(s => !profile?.skills?.includes(s))
                        .map(s => <span key={s} className="badge badge-purple text-xs">{s}</span>)
                    ) : (
                      <p className="text-slate-400 text-sm">Upload resume to extract skills</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
