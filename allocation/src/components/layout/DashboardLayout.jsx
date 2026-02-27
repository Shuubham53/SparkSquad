import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  Menu, X, ChevronLeft, ChevronRight, Moon, Sun, LogOut, User,
} from 'lucide-react';

export default function DashboardLayout({ role = 'student', items = [], activeItem, onItemClick, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  }, [logout, navigate]);

  const isCompany = role === 'company';
  const currentItem = items.find(i => i.key === activeItem);
  const displayName = user?.name || user?.companyName || 'User';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${isCompany
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-gradient-to-br from-indigo-500 to-blue-600'
              }
            `}
          >
            <span className="text-white font-black text-sm">T</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-900 dark:text-white text-lg whitespace-nowrap overflow-hidden">
              TalentFlow
            </span>
          )}
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.filter(item => !item.hidden).map(item => (
            <button
              key={item.key}
              onClick={() => { onItemClick(item.key); setSidebarOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`sidebar-item w-full ${activeItem === item.key ? 'active' : ''}
                          ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.count !== undefined && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold
                    ${activeItem === item.key
                      ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-item w-full justify-center"
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
          </button>
        </div>

        {/* User info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                ${isCompany
                  ? 'bg-gradient-to-br from-violet-400 to-purple-500'
                  : 'bg-gradient-to-br from-indigo-400 to-blue-500'
                }
              `}
            >
              {displayName[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top nav */}
        <header
          className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                     border-b border-slate-200 dark:border-slate-800
                     sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-6"
        >
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {currentItem?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200
                         hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl
                           hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                    ${isCompany
                      ? 'bg-gradient-to-br from-violet-400 to-purple-500'
                      : 'bg-gradient-to-br from-indigo-400 to-blue-500'
                    }
                  `}
                >
                  {displayName[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800
                                rounded-xl shadow-lg border border-slate-200 dark:border-slate-700
                                py-2 animate-scale-in origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { onItemClick('profile'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                               text-slate-600 dark:text-slate-300
                               hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                               text-rose-600 dark:text-rose-400
                               hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
