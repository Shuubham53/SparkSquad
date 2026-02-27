import { useMemo } from 'react';
import {
  X, User, Mail, Phone, GraduationCap, Building, Calendar,
  Sparkles, FileText, Download, Check, Target, BookOpen, Briefcase,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { cls: 'badge-yellow', label: 'Pending Review' },
  accepted: { cls: 'badge-green', label: 'Accepted' },
  rejected: { cls: 'badge-red', label: 'Rejected' },
};

function getMatchColor(pct) {
  if (pct >= 75) return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', label: 'Excellent Match' };
  if (pct >= 50) return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500', label: 'Good Match' };
  return { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', label: 'Partial Match' };
}

export default function ApplicantProfileModal({
  isOpen, onClose, applicant, internship, onAccept, onReject,
}) {
  const matchColor = useMemo(() => getMatchColor(applicant?.matchPercentage || 0), [applicant?.matchPercentage]);

  const allSkills = useMemo(() => {
    if (!applicant) return [];
    return [...new Set([...(applicant.skills || []), ...(applicant.extractedSkills || [])])];
  }, [applicant]);

  if (!isOpen || !applicant) return null;

  const {
    name, email, phone, college, degree, year, interests, preferredRole,
    matchPercentage, matchedSkills, missingSkills, applicationStatus,
    resumeFile, resumeText, extractedSkills, skills,
  } = applicant;

  const requiredSkills = internship?.requiredSkills || [];
  const status = STATUS_CONFIG[applicationStatus] || STATUS_CONFIG.pending;

  const handleDownloadResume = () => {
    if (!resumeFile) return;
    const link = document.createElement('a');
    link.href = resumeFile;
    link.download = `${name?.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-12
                 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                   rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50
                   animate-scale-in mb-8"
      >
        {/* ── Header ── */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500
                            flex items-center justify-center text-white text-xl font-bold shadow-lg
                            flex-shrink-0">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {[college, degree, year].filter(Boolean).join(' · ') || 'Student'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge ${status.cls}`}>{status.label}</span>
                <div className={`${matchColor.bg} ${matchColor.text} px-3 py-1 rounded-xl text-xs font-bold
                                flex items-center gap-1.5`}>
                  <Sparkles size={12} /> {matchPercentage || 0}% — {matchColor.label}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">

          {/* Match Progress */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={16} className={matchColor.text} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Skill Match Score</span>
              </div>
              <span className={`text-lg font-bold ${matchColor.text}`}>{matchPercentage || 0}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${matchColor.bar} transition-all duration-1000 ease-out`}
                style={{ width: `${matchPercentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {matchedSkills?.length || 0} of {requiredSkills.length} required skills matched
            </p>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} className="text-indigo-500" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: User, label: 'Full Name', value: name },
                { icon: Mail, label: 'Email', value: email },
                { icon: Phone, label: 'Phone', value: phone },
                { icon: Building, label: 'College', value: college },
                { icon: GraduationCap, label: 'Degree', value: degree },
                { icon: Calendar, label: 'Year', value: year },
                { icon: Briefcase, label: 'Preferred Role', value: preferredRole },
                { icon: BookOpen, label: 'Interests', value: interests },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-2.5 p-2.5 rounded-lg
                                              bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <f.icon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                      {f.label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {f.value || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" /> Skills Analysis
            </h3>
            <div className="space-y-4">
              {/* Declared Skills */}
              {skills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Declared Skills ({skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className={`badge text-xs ${
                          matchedSkills?.includes(s.toLowerCase()) || matchedSkills?.includes(s)
                            ? 'badge-green' : 'badge-indigo'
                        }`}
                      >
                        {(matchedSkills?.includes(s.toLowerCase()) || matchedSkills?.includes(s)) && '✓ '}{s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Skills */}
              {extractedSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Resume Extracted Skills ({extractedSkills.filter((s) => !skills?.includes(s)).length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedSkills.filter((s) => !skills?.includes(s)).map((s) => (
                      <span
                        key={s}
                        className={`badge text-xs ${
                          matchedSkills?.includes(s.toLowerCase()) || matchedSkills?.includes(s)
                            ? 'badge-green' : 'badge-purple'
                        }`}
                      >
                        {(matchedSkills?.includes(s.toLowerCase()) || matchedSkills?.includes(s)) && '✓ '}{s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              {matchedSkills?.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20
                                rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Check size={12} /> Matched Skills ({matchedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((s) => (
                      <span key={s} className="badge badge-green text-xs">✓ {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {missingSkills?.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20
                                rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <BookOpen size={12} /> Missing Skills ({missingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((s) => (
                      <span key={s} className="badge badge-red text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {allSkills.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">No skills data available.</p>
              )}
            </div>
          </div>

          {/* Resume Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Resume
            </h3>
            {resumeFile ? (
              <div className="space-y-3">
                {/* PDF Preview */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700
                                bg-slate-50 dark:bg-slate-900">
                  <iframe
                    src={resumeFile}
                    title="Resume Preview"
                    className="w-full h-[400px]"
                    style={{ border: 'none' }}
                  />
                </div>
                <button onClick={handleDownloadResume} className="btn-secondary text-sm">
                  <Download size={14} /> Download Resume
                </button>
              </div>
            ) : resumeText ? (
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 max-h-48 overflow-y-auto
                                border border-slate-200 dark:border-slate-700">
                  <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {resumeText}
                  </pre>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <FileText size={12} />
                  <span>Resume text extracted · PDF file not available for preview</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl
                              border border-dashed border-slate-300 dark:border-slate-600">
                <FileText size={20} className="text-slate-400" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No resume uploaded by this student.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Footer Actions ── */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700
                        bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-b-2xl
                        flex items-center justify-between gap-3">
          <span className={`badge ${status.cls}`}>{status.label}</span>

          {applicationStatus === 'pending' ? (
            <div className="flex gap-2">
              <button
                onClick={() => onReject?.(applicant.id)}
                className="btn-danger text-sm py-2 px-5"
              >
                <X size={15} /> Reject
              </button>
              <button
                onClick={() => onAccept?.(applicant.id)}
                className="btn-success text-sm py-2 px-5"
              >
                <Check size={15} /> Accept
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Decision has been made for this applicant.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
