
import { Sparkles, Check, X, Eye, Award } from 'lucide-react';

export default function ApplicantCard({ applicant, onAccept, onReject, onViewProfile }) {
  const { name, email, college, degree, year, skills, extractedSkills,
    matchPercentage, matchedSkills, missingSkills, applicationStatus, finalScore, rankingBadge, resumeScore, skillDensity } = applicant;

  const allSkills = [...new Set([...(skills || []), ...(extractedSkills || [])])];

  const getMatchColor = (pct) => {
    if (pct >= 75) return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' };
    if (pct >= 50) return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' };
    return { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' };
  };

  const matchColor = getMatchColor(matchPercentage || 0);

  const statusConfig = {
    pending: { cls: 'badge-yellow', label: 'Pending Review' },
    accepted: { cls: 'badge-green', label: 'Accepted' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
  };

  return (
    <div className="card-hover">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
            {name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              {name}
              {rankingBadge === 'top' && <span title="Top Candidate" className="ml-1"><span className="text-2xl">🥇</span></span>}
              {rankingBadge === 'strong' && <span title="Strong Match" className="ml-1"><span className="text-xl">🥈</span></span>}
              {rankingBadge === 'potential' && <span title="Potential Candidate" className="ml-1"><span className="text-lg">🥉</span></span>}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {[college, degree, year].filter(Boolean).join(' · ')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{email}</p>
          </div>
        </div>
        <div className={`${matchColor.bg} ${matchColor.text} px-3 py-1.5 rounded-xl text-xs font-bold flex flex-col items-end gap-1 flex-shrink-0`}>
          <span className="flex items-center gap-1"><Sparkles size={12} />{matchPercentage || 0}%</span>
          <span className="text-[11px] font-normal">Score: <span className="font-bold">{finalScore ?? 0}</span></span>
        </div>
      </div>
      {/* Resume Score & Skill Density */}
      <div className="flex gap-2 mb-2">
        <span className="badge badge-blue text-xs">Resume: {resumeScore ?? 0}/100</span>
        <span className="badge badge-purple text-xs">Skill Density: {skillDensity ?? 0}/100w</span>
      </div>

      {/* Match bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${matchColor.bar} transition-all duration-700`}
            style={{ width: `${matchPercentage || 0}%` }}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Skills ({allSkills.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {allSkills.slice(0, 6).map(s => (
              <span
                key={s}
                className={`badge text-xs ${matchedSkills?.includes(s) ? 'badge-green' : 'badge-blue'}`}
              >
                {matchedSkills?.includes(s) && '✓ '}{s}
              </span>
            ))}
            {allSkills.length > 6 && (
              <span className="badge badge-slate text-xs">+{allSkills.length - 6}</span>
            )}
          </div>
        </div>
        {missingSkills?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Missing</p>
            <div className="flex flex-wrap gap-1">
              {missingSkills.slice(0, 4).map(s => (
                <span key={s} className="badge badge-red text-xs">{s}</span>
              ))}
              {missingSkills.length > 4 && (
                <span className="badge badge-slate text-xs">+{missingSkills.length - 4}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className={`badge ${statusConfig[applicationStatus]?.cls || 'badge-yellow'}`}>
          {statusConfig[applicationStatus]?.label || 'Pending Review'}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile?.(applicant)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <Eye size={14} /> View Profile
          </button>
          {applicationStatus === 'pending' && (
            <>
              <button
                onClick={() => onAccept?.(applicant.id)}
                className="btn-success text-xs py-1.5 px-3"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => onReject?.(applicant.id)}
                className="btn-danger text-xs py-1.5 px-3"
              >
                <X size={14} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
