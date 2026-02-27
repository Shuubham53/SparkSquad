import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { extractTextFromPDF } from '../utils/resumeParser';
import { extractSkillsFromText } from '../utils/skillDatabase';
import { saveResumeSkills } from '../services/studentService';
import { ArrowLeft, Sun, Moon, Upload, X } from 'lucide-react';

export default function StudentRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', college: '',
    degree: '', year: '', interests: '', preferredRole: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const { registerStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const addSkill = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const s = skillInput.trim().toLowerCase();
      if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
      setSkillInput('');
    }
  }, [skillInput, skills]);

  const removeSkill = useCallback((s) => setSkills(prev => prev.filter(x => x !== s)), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = registerStudent({ ...form, skills });
      if (resume) {
        try {
          const text = await extractTextFromPDF(resume);
          const extracted = extractSkillsFromText(text);
          // Convert PDF to base64 data URL for storage and preview
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(resume);
          });
          const resumeBase64 = await base64Promise;
          saveResumeSkills(userData.id, extracted, text, resumeBase64);
          toast.success(`Registered! ${extracted.length} skills extracted.`);
        } catch {
          toast.success('Registered! Resume parsing available later.');
        }
      } else {
        toast.success('Account created successfully!');
      }
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [form, skills, resume, registerStudent, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-500
                                   hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <button onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400
                             hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl
                          flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Student Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Fill in your details to get started</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input name="name" className="input-field" placeholder="John Doe" required
                       value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="email" type="email" className="input-field" placeholder="john@email.com" required
                       value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Password *</label>
                <input name="password" type="password" className="input-field" placeholder="Min 6 characters"
                       required minLength={6} value={form.password} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" className="input-field" placeholder="+91 9876543210"
                       value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="label">College</label>
                <input name="college" className="input-field" placeholder="MIT, Stanford..."
                       value={form.college} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Degree</label>
                <input name="degree" className="input-field" placeholder="B.Tech Computer Science"
                       value={form.degree} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Year</label>
                <select name="year" className="input-field" value={form.year} onChange={handleChange}>
                  <option value="">Select Year</option>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Preferred Role</label>
                <input name="preferredRole" className="input-field" placeholder="Frontend Developer..."
                       value={form.preferredRole} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label">Interests</label>
              <input name="interests" className="input-field" placeholder="Web Development, AI/ML..."
                     value={form.interests} onChange={handleChange} />
            </div>

            <div>
              <label className="label">Skills (Press Enter to add)</label>
              <div className="input-field !p-2 flex flex-wrap gap-2 min-h-[46px] !ring-0
                              focus-within:!ring-2 focus-within:!ring-indigo-500/40 focus-within:!border-indigo-500">
                {skills.map(s => (
                  <span key={s} className="badge badge-indigo flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}
                            className="hover:text-indigo-900 dark:hover:text-indigo-200">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  className="outline-none bg-transparent text-sm flex-1 min-w-[120px] px-1
                             text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Type a skill..." value={skillInput}
                  onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill}
                />
              </div>
            </div>

            <div>
              <label className="label">Resume (PDF, optional)</label>
              <div
                className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-6
                           text-center hover:border-indigo-400 dark:hover:border-indigo-500
                           transition-colors cursor-pointer"
                onClick={() => document.getElementById('resumeUpload').click()}
              >
                <input type="file" accept=".pdf" className="hidden" id="resumeUpload"
                       onChange={e => setResume(e.target.files[0])} />
                <Upload size={28} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                {resume ? (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">{resume.name}</p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Click to upload PDF resume{' '}
                    <span className="text-indigo-500 dark:text-indigo-400">(skills auto-extracted)</span>
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/student/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
