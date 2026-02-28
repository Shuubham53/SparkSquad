import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Building2 } from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
  'Media', 'Manufacturing', 'Consulting', 'Other',
];

export default function CompanyRegister() {
  const [form, setForm] = useState({
    companyName: '', email: '', password: '', hrName: '',
    industry: '', website: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const { registerCompany } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerCompany(form);
      toast.success('Company registered successfully!');
      navigate('/company-login');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [form, registerCompany, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-xl mx-auto">
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
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl
                          flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register Company</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Post internships and find top talent</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name *</label>
                <input name="companyName" className="input-field" placeholder="Acme Corp" required
                       value={form.companyName} onChange={handleChange} />
              </div>
              <div>
                <label className="label">HR Name *</label>
                <input name="hrName" className="input-field" placeholder="Jane Smith" required
                       value={form.hrName} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="email" type="email" className="input-field" placeholder="hr@company.com" required
                       value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Password *</label>
                <input name="password" type="password" className="input-field" placeholder="Min 6 characters"
                       required minLength={6} value={form.password} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Industry</label>
                <select name="industry" className="input-field" value={form.industry} onChange={handleChange}>
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Website</label>
                <input name="website" className="input-field" placeholder="https://company.com"
                       value={form.website} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label">Company Description</label>
              <textarea name="description" className="input-field resize-none" rows={4}
                        placeholder="Tell students about your company..."
                        value={form.description} onChange={handleChange} />
            </div>

            <button type="submit" className="btn-purple w-full py-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Company Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already registered?{' '}
            <Link to="/company/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
