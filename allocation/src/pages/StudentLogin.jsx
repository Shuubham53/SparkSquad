import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function StudentLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginStudent } = useAuth();
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
      await loginStudent(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/student-dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [form, loginStudent, navigate]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700
                       relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative text-white max-w-md">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Welcome back to TalentFlow</h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Sign in to access your matched internships, track applications, and discover new opportunities.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Student Login</h1>
            <p className="text-slate-500 dark:text-slate-400">Access your internship dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" className="input-field" placeholder="you@example.com"
                     required value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} className="input-field pr-10"
                       placeholder="••••••••" required value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600
                                   dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
