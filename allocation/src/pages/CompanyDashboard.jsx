import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import ApplicantCard from '../components/dashboard/ApplicantCard';
import ApplicantProfileModal from '../components/dashboard/ApplicantProfileModal';
import {
  LayoutDashboard, PlusCircle, Briefcase, CheckCircle, Users, Building2,
  Pin, ArrowLeft, X,
} from 'lucide-react';
import {
  getCompanyProfile, updateCompanyProfile, postInternship as postInternshipSvc,
  getMyInternships, updateInternship as updateInternshipSvc, deleteInternship as deleteInternshipSvc,
  getApplicants, updateApplicantStatus,
} from '../services/companyService';

const SKILL_SUGGESTIONS = [
  'javascript', 'react', 'nodejs', 'python', 'java', 'mongodb', 'sql',
  'css', 'html', 'git', 'docker', 'aws', 'machine learning', 'data analysis',
  'typescript', 'angular', 'vue', 'flask', 'django', 'spring boot',
];

export default function CompanyDashboard() {
  const { user, refreshUser } = useAuth();
  const [active, setActive] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [deleteModal, setDeleteModal] = useState(null);
  const [profileApplicant, setProfileApplicant] = useState(null);
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);

  const [postForm, setPostForm] = useState({
    role: '', description: '', stipend: '', duration: '', location: 'Remote',
  });
  const [postSkills, setPostSkills] = useState([]);
  const [postSkillInput, setPostSkillInput] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const prof = getCompanyProfile(user.id);
      setProfile(prof);
      setEditForm(prof);
      const myInternships = getMyInternships(user.id);
      setInternships(myInternships);
      // Collect all accepted applicants across all internships using getApplicants for full details
      const accepted = [];
      myInternships.forEach(int => {
        const apps = getApplicants(int.id);
        apps.forEach(app => {
          if (app.applicationStatus === 'accepted') {
            accepted.push({ ...app, internship: int });
          }
        });
      });
      setAcceptedApplicants(accepted);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ────── Internship Actions ────── */

  const handlePostInternship = useCallback((e) => {
    e.preventDefault();
    if (postSkills.length === 0) return toast.error('Add at least one required skill');
    setPosting(true);
    try {
      postInternshipSvc(user.id, { ...postForm, requiredSkills: postSkills });
      toast.success('Internship posted!');
      setPostForm({ role: '', description: '', stipend: '', duration: '', location: 'Remote' });
      setPostSkills([]);
      loadData();
      setActive('manage');
    } catch (err) {
      toast.error(err.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  }, [postForm, postSkills, user.id, loadData]);

  const addPostSkill = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const s = postSkillInput.trim().toLowerCase();
      if (s && !postSkills.includes(s)) setPostSkills(prev => [...prev, s]);
      setPostSkillInput('');
    }
  }, [postSkillInput, postSkills]);

  const handleViewApplicants = useCallback((internship) => {
    setSelectedInternship(internship);
    setActive('applicants');
    try {
      setApplicants(getApplicants(internship.id));
    } catch {
      toast.error('Failed to load applicants');
    }
  }, []);

  const handleApplicantStatus = useCallback((studentId, status) => {
    if (!selectedInternship) return;
    try {
      updateApplicantStatus(selectedInternship.id, studentId, status);
      toast.success(`Applicant ${status}`);
      setApplicants(prev => prev.map(a => a.id === studentId ? { ...a, applicationStatus: status } : a));
      // Also update if profile modal is open for this student
      setProfileApplicant(prev => prev && prev.id === studentId ? { ...prev, applicationStatus: status } : prev);
    } catch {
      toast.error('Failed to update');
    }
  }, [selectedInternship]);

  const confirmDeleteInternship = useCallback(() => {
    if (!deleteModal) return;
    try {
      deleteInternshipSvc(deleteModal);
      toast.success('Internship deleted');
      setDeleteModal(null);
      loadData();
    } catch {
      toast.error('Delete failed');
    }
  }, [deleteModal, loadData]);

  const handleToggleActive = useCallback((internship) => {
    try {
      updateInternshipSvc(internship.id, { isActive: !internship.isActive });
      toast.success(internship.isActive ? 'Deactivated' : 'Activated');
      loadData();
    } catch {
      toast.error('Update failed');
    }
  }, [loadData]);

  const handleProfileUpdate = useCallback(() => {
    try {
      const { role, id, email, createdAt, password, ...rest } = editForm;
      updateCompanyProfile(user.id, rest);
      refreshUser();
      toast.success('Profile updated!');
      setEditMode(false);
      loadData();
    } catch {
      toast.error('Update failed');
    }
  }, [editForm, user.id, refreshUser, loadData]);

  /* ────── Computed ────── */

  const totalApplicants = useMemo(() =>
    internships.reduce((s, i) => s + (i.applicants?.length || 0), 0), [internships]);
  const activeCount = useMemo(() =>
    internships.filter(i => i.isActive).length, [internships]);

  const sidebarItems = useMemo(() => [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'post', label: 'Post Internship', icon: PlusCircle },
    { key: 'manage', label: 'My Internships', icon: Briefcase, count: internships.length },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle, count: acceptedApplicants.length },
    { key: 'applicants', label: 'Applicants', icon: Users, hidden: !selectedInternship },
    { key: 'profile', label: 'Company Profile', icon: Building2 },
  ], [internships.length, selectedInternship, acceptedApplicants.length]);

  if (loading) {
    return (
      <DashboardLayout role="company" items={sidebarItems} activeItem={active} onItemClick={setActive}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="company" items={sidebarItems} activeItem={active} onItemClick={setActive}>
      {/* Applicant Profile Modal */}
      <ApplicantProfileModal
        isOpen={!!profileApplicant}
        onClose={() => setProfileApplicant(null)}
        applicant={profileApplicant}
        internship={selectedInternship}
        onAccept={(id) => handleApplicantStatus(id, 'accepted')}
        onReject={(id) => handleApplicantStatus(id, 'rejected')}
      />

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Internship" size="sm">
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
          Are you sure? This will also remove all related applications. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={confirmDeleteInternship} className="btn-danger text-sm">Delete</button>
        </div>
      </Modal>

      {/* ========== Overview ========== */}
      {active === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {profile?.hrName} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {profile?.companyName} — {profile?.industry || 'Company'} Dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard icon={Pin} label="Total Internships" value={internships.length} color="violet" />
            <StatsCard icon={CheckCircle} label="Active Postings" value={activeCount} color="emerald" />
            <StatsCard icon={Users} label="Total Applicants" value={totalApplicants} color="indigo" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Recent Postings</h2>
              <button onClick={() => setActive('post')} className="btn-purple text-sm py-1.5 px-4">
                <PlusCircle size={16} /> Post New
              </button>
            </div>

            {internships.length === 0 ? (
              <EmptyState
                icon={Briefcase} title="No Internships Yet"
                description="Post your first internship to start receiving applications."
                action={() => setActive('post')} actionLabel="Post Internship"
              />
            ) : (
              <div className="space-y-3">
                {internships.slice(0, 3).map(i => (
                  <div key={i.id} className="card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{i.role}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {i.applicants?.length || 0} applicants · {i.duration} · {i.stipend}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`badge ${i.isActive ? 'badge-green' : 'badge-red'}`}>
                        {i.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleViewApplicants(i)} className="btn-secondary text-xs py-1 px-3">
                        Applicants
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== Post Internship ========== */}
      {active === 'post' && (
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post an Internship</h1>

          <div className="card">
            <form onSubmit={handlePostInternship} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Role / Position *</label>
                  <input className="input-field" placeholder="Frontend Developer Intern" required
                         value={postForm.role}
                         onChange={e => setPostForm(prev => ({ ...prev, role: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Stipend</label>
                  <input className="input-field" placeholder="₹10,000/month"
                         value={postForm.stipend}
                         onChange={e => setPostForm(prev => ({ ...prev, stipend: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input className="input-field" placeholder="3 months"
                         value={postForm.duration}
                         onChange={e => setPostForm(prev => ({ ...prev, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <select className="input-field" value={postForm.location}
                          onChange={e => setPostForm(prev => ({ ...prev, location: e.target.value }))}>
                    {['Remote', 'On-site', 'Hybrid'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea className="input-field resize-none" rows={4} required
                          placeholder="Describe the internship role, responsibilities..."
                          value={postForm.description}
                          onChange={e => setPostForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div>
                <label className="label">Required Skills * (Press Enter to add)</label>
                <div className="input-field !p-2 flex flex-wrap gap-2 min-h-[46px] !ring-0
                                focus-within:!ring-2 focus-within:!ring-violet-500/40
                                focus-within:!border-violet-500">
                  {postSkills.map(s => (
                    <span key={s} className="badge badge-purple flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => setPostSkills(prev => prev.filter(x => x !== s))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="outline-none bg-transparent text-sm flex-1 min-w-[120px] px-1
                               text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="Add skill..." value={postSkillInput}
                    onChange={e => setPostSkillInput(e.target.value)} onKeyDown={addPostSkill}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SKILL_SUGGESTIONS.filter(s => !postSkills.includes(s)).slice(0, 10).map(s => (
                    <button key={s} type="button"
                            onClick={() => setPostSkills(prev => [...prev, s])}
                            className="badge badge-slate hover:badge-purple transition-colors cursor-pointer text-xs">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-purple w-full py-3" disabled={posting}>
                {posting ? 'Posting...' : 'Post Internship'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== Manage Internships ========== */}
      {active === 'manage' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Internships</h1>
            <button onClick={() => setActive('post')} className="btn-purple text-sm">
              <PlusCircle size={16} /> Post New
            </button>
          </div>

          {internships.length === 0 ? (
            <EmptyState
              icon={Briefcase} title="No Internships"
              description="Post your first internship to start receiving applications."
              action={() => setActive('post')} actionLabel="Post Internship"
            />
          ) : (
            <div className="space-y-4">
              {internships.map(i => (
                <div key={i.id} className="card-hover">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{i.role}</h3>
                        <span className={`badge ${i.isActive ? 'badge-green' : 'badge-red'}`}>
                          {i.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span>💰 {i.stipend || '—'}</span>
                        <span>⏱️ {i.duration || '—'}</span>
                        <span>📍 {i.location}</span>
                        <span>👥 {i.applicants?.length || 0} applicants</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(i.requiredSkills || []).map(s => (
                          <span key={s} className="badge badge-slate text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleViewApplicants(i)}
                              className="btn-purple text-xs py-1.5 px-3">
                        <Users size={14} /> {i.applicants?.length || 0}
                      </button>
                      <button onClick={() => handleToggleActive(i)}
                              className="btn-secondary text-xs py-1.5 px-3">
                        {i.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => setDeleteModal(i.id)}
                              className="btn-danger text-xs py-1.5 px-3">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Applicants ========== */}
      {active === 'applicants' && selectedInternship && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <button onClick={() => setActive('manage')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                               text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                               hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicants</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
                for {selectedInternship.role}
              </p>
            </div>
            <span className="badge badge-purple">{applicants.length} candidates</span>
          </div>

          {applicants.length === 0 ? (
            <EmptyState
              icon={Users} title="No Applicants"
              description="No one has applied to this internship yet."
            />
          ) : (
            <div className="space-y-4">
              {applicants.map(a => (
                <ApplicantCard
                  key={a.id} applicant={a}
                  onAccept={(id) => handleApplicantStatus(id, 'accepted')}
                  onReject={(id) => handleApplicantStatus(id, 'rejected')}
                  onViewProfile={(applicant) => setProfileApplicant(applicant)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Accepted Applicants ========== */}
      {active === 'accepted' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accepted Applicants</h1>
            <span className="badge badge-emerald">{acceptedApplicants.length}</span>
          </div>

          {acceptedApplicants.length === 0 ? (
            <EmptyState
              icon={CheckCircle} title="No Accepted Applicants"
              description="Applicants you accept will appear here."
            />
          ) : (
            <div className="space-y-4">
              {acceptedApplicants.map(a => (
                <div key={`${a.id}-${a.internship.id}`} className="card-hover">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500
                                      flex items-center justify-center text-white font-bold text-lg">
                        {a.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{a.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{a.email}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          Accepted for: {a.internship.role}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-green">Accepted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Company Profile ========== */}
      {active === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h1>
            <button
              onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
              className={editMode ? 'btn-purple' : 'btn-secondary'}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="card">
            {editMode ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'companyName', label: 'Company Name' },
                    { key: 'hrName', label: 'HR Name' },
                    { key: 'industry', label: 'Industry' },
                    { key: 'website', label: 'Website' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input className="input-field" value={editForm[f.key] || ''}
                             onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input-field resize-none" rows={4}
                              value={editForm.description || ''}
                              onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                </div>
                <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Company Name', value: profile?.companyName },
                  { label: 'Email', value: profile?.email },
                  { label: 'HR Name', value: profile?.hrName },
                  { label: 'Industry', value: profile?.industry },
                  { label: 'Website', value: profile?.website },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                      {f.label}
                    </p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{f.value || '—'}</p>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {profile?.description || '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
