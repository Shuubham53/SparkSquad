import { useMemo } from 'react';
import { 
  User, Mail, MapPin, GraduationCap, Sparkles, 
  ChevronRight, Calendar, Check, X 
} from 'lucide-react';

const STATUS_THEMES = {
  pending: 'border-amber-200 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20',
  accepted: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-500/5 dark:border-emerald-500/20',
  rejected: 'border-slate-200 bg-slate-50/50 dark:bg-slate-500/5 dark:border-slate-500/20',
};

export default function ApplicantCard({ applicant, onClick, onAccept, onReject }) {
  const { 
    name, email, college, degree, matchPercentage, 
    status, location, cgpa, appliedAt 
  } = applicant;

  const theme = STATUS_THEMES[status || 'pending'];

  return (
    <div 
      onClick={onClick}
      className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] ${theme}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Profile Avatar & Info */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 
                          flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 
                           dark:group-hover:text-indigo-400 transition-colors">
              {name}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Mail size={12} /> {email}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <GraduationCap size={12} /> {college}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 
                          shadow-sm border border-slate-100 dark:border-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {Math.round(matchPercentage)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Match</span>
        </div>
      </div>

      {/* --- New Location & CGPA Row --- */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <MapPin size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">Location</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{location || 'Not Specified'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <GraduationCap size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">CGPA</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cgpa || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Actions */}
      <div className="flex items-center justify-between mt-4">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Calendar size={12} /> Applied {new Date(appliedAt).toLocaleDateString()}
        </span>

        {status === 'pending' && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onReject(applicant.id)}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              title="Reject Applicant"
            >
              <X size={16} />
            </button>
            <button 
              onClick={() => onAccept(applicant.id)}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="Accept Applicant"
            >
              <Check size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Hover Arrow */}
      <div className="absolute top-1/2 -right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                      group-hover:right-2 transition-all duration-300">
        <div className="p-1.5 rounded-full bg-indigo-600 text-white shadow-lg">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}