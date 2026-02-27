import { MapPin, Clock, DollarSign, Sparkles, BookOpen } from 'lucide-react';

export default function InternshipCard({ internship, onApply, applying, isApplied, applicationStatus }) {
  const { role, description, requiredSkills, stipend, duration, location,
    companyName, companyIndustry, matchPercentage, missingSkills, matchedSkills } = internship;

  const getMatchColor = (pct) => {
    if (pct >= 75) return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', label: 'Excellent' };
    if (pct >= 50) return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500', label: 'Good' };
    return { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', label: 'Partial' };
  };

  const statusConfig = {
    pending: { cls: 'badge-yellow', label: 'Pending' },
    accepted: { cls: 'badge-green', label: 'Accepted' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
  };

  const matchColor = matchPercentage !== undefined ? getMatchColor(matchPercentage) : null;

  return (
    <div className="card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-500
                          rounded-xl flex items-center justify-center text-white font-bold text-sm
                          shadow-sm group-hover:scale-110 transition-transform duration-300">
            {(companyName || 'C')[0]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{role}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {companyName || 'Company'}{companyIndustry ? ` · ${companyIndustry}` : ''}
            </p>
          </div>
        </div>
        {matchColor && (
          <div className={`${matchColor.bg} ${matchColor.text} px-3 py-1.5 rounded-xl text-xs font-bold
                          flex items-center gap-1.5`}>
            <Sparkles size={12} />
            {matchPercentage}%
          </div>
        )}
      </div>

      {/* Match bar */}
      {matchColor && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">Match Score</span>
            <span className={`font-semibold ${matchColor.text}`}>{matchColor.label}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${matchColor.bar} transition-all duration-700 ease-out`}
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{description}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
        {stipend && (
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
            <DollarSign size={12} /> {stipend}
          </span>
        )}
        {duration && (
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
            <Clock size={12} /> {duration}
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
            <MapPin size={12} /> {location}
          </span>
        )}
      </div>

      {/* Skills */}
      {requiredSkills?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {requiredSkills.map(skill => {
              const isMatched = matchedSkills?.includes(skill);
              return (
                <span key={skill} className={`badge text-xs ${isMatched ? 'badge-green' : 'badge-slate'}`}>
                  {isMatched && '✓ '}{skill}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Gap */}
      {missingSkills?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20
                        rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen size={12} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Skill Gap</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Learn: {missingSkills.join(', ')}
          </p>
        </div>
      )}

      {/* Action */}
      {onApply && (
        <div className="pt-2">
          {isApplied ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Applied</span>
              {applicationStatus && (
                <span className={`badge ${statusConfig[applicationStatus]?.cls || 'badge-yellow'}`}>
                  {statusConfig[applicationStatus]?.label || 'Pending'}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onApply(internship.id)}
              disabled={applying}
              className="btn-primary w-full text-sm"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>
      )}

      {/* Applied status (no onApply) */}
      {!onApply && isApplied && applicationStatus && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Applied</span>
          <span className={`badge ${statusConfig[applicationStatus]?.cls || 'badge-yellow'}`}>
            {statusConfig[applicationStatus]?.label || 'Pending'}
          </span>
        </div>
      )}
    </div>
  );
}
