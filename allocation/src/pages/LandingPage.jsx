import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen, Building2, Sparkles, Target, TrendingUp, Shield,
  ArrowRight, CheckCircle, Sun, Moon, Zap, Users, BarChart3,
} from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'Smart Matching', desc: 'Algorithm matches your skills with perfect internship opportunities.' },
  { icon: Zap, title: 'Instant Analysis', desc: 'Upload your resume and get instant skill extraction and analysis.' },
  { icon: BarChart3, title: 'Skill Insights', desc: 'Visualize skill gaps and get recommendations for improvement.' },
  { icon: Shield, title: 'Verified Listings', desc: 'All internships are reviewed and verified for quality assurance.' },
  { icon: Users, title: 'Talent Discovery', desc: 'Companies find the best matching candidates automatically.' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor applications and track your career growth over time.' },
];

const STATS = [
  { value: '500+', label: 'Internships' },
  { value: '2K+', label: 'Students' },
  { value: '95%', label: 'Match Rate' },
  { value: '150+', label: 'Companies' },
];

import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate(user.role === 'student' ? '/student/dashboard' : '/company/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl
                       border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl
                            flex items-center justify-center shadow-glow-primary">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">TalentFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/student/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign In</Link>
            <Link to="/student/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50
                        dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px]
                        bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10
                          border border-indigo-200 dark:border-indigo-500/30
                          rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Smart AI-Powered Matching
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white
                         leading-[1.1] mb-6 animate-slide-up">
            Find Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600
                             dark:from-indigo-400 dark:to-violet-400">
              Internship Match
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto
                        mb-10 leading-relaxed animate-slide-up"
             style={{ animationDelay: '0.1s' }}>
            Upload your resume, get instant skill analysis, and discover internships
            perfectly matched to your expertise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16
                          animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/student/register"
                  className="btn-primary text-base px-8 py-3.5 shadow-glow-primary group">
              Start as Student
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/company/register"
                  className="btn-purple text-base px-8 py-3.5 shadow-glow-purple group">
              Hire as Company
              <Building2 size={18} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto animate-slide-up"
               style={{ animationDelay: '0.3s' }}>
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Choose Your Path</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Whether you're a student or a company, TalentFlow has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Student */}
            <div className="group relative bg-white dark:bg-slate-800 border border-slate-200
                            dark:border-slate-700 rounded-2xl p-8 hover:shadow-lg
                            hover:border-indigo-300 dark:hover:border-indigo-600
                            transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl
                              flex items-center justify-center mb-6
                              group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={26} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">I'm a Student</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Upload your resume, discover skills, and find internships that perfectly match your profile.
              </p>
              <ul className="space-y-2 mb-8">
                {['Upload & parse resume', 'Smart skill matching', 'Track applications'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link to="/student/login" className="btn-primary w-full group/btn">
                  Login as Student
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link to="/student/register"
                      className="text-center text-sm text-indigo-600 dark:text-indigo-400
                                 hover:underline font-medium">
                  Create Student Account →
                </Link>
              </div>
            </div>

            {/* Company */}
            <div className="group relative bg-white dark:bg-slate-800 border border-slate-200
                            dark:border-slate-700 rounded-2xl p-8 hover:shadow-lg
                            hover:border-violet-300 dark:hover:border-violet-600
                            transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-500/10 rounded-2xl
                              flex items-center justify-center mb-6
                              group-hover:scale-110 transition-transform duration-300">
                <Building2 size={26} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">I'm a Company</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Post internships, review applicants with skill matching, and find the best talent.
              </p>
              <ul className="space-y-2 mb-8">
                {['Post internship listings', 'AI-powered candidate matching', 'Accept/Reject applicants'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link to="/company/login" className="btn-purple w-full group/btn">
                  Login as Company
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link to="/company/register"
                      className="text-center text-sm text-violet-600 dark:text-violet-400
                                 hover:underline font-medium">
                  Register Company →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Powerful Features</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need for a seamless internship matching experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6
                           border border-slate-100 dark:border-slate-700
                           hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700
                           transition-all duration-300"
              >
                <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl
                                flex items-center justify-center mb-4
                                group-hover:scale-110 transition-transform duration-300">
                  <f.icon size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 sm:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Match?</h2>
              <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
                Join thousands of students and companies using TalentFlow for smart internship matching.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/student/register"
                      className="btn bg-white text-indigo-700 hover:bg-indigo-50 text-base px-8 py-3.5 shadow-lg">
                  Get Started Free
                </Link>
                <Link to="/company/register"
                      className="btn bg-white/10 text-white border border-white/20
                                 hover:bg-white/20 text-base px-8 py-3.5">
                  Post Internship
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg
                            flex items-center justify-center">
              <span className="text-white font-black text-xs">T</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">TalentFlow</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} TalentFlow. Smart Internship Matching Portal.
          </p>
        </div>
      </footer>
    </div>
  );
}
