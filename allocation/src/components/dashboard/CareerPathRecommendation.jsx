import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Sparkles, BookOpen, DollarSign, Target } from 'lucide-react';
import { getCareerRecommendations, getSkillsGap } from '../../utils/careerPaths';

export default function CareerPathRecommendation({ skills = [] }) {
  const [expandedCard, setExpandedCard] = useState(null);

  // Dynamically compute recommendations when skills change
  const recommendations = useMemo(() => {
    return getCareerRecommendations(skills);
  }, [skills]);

  const toggleCard = (title) => {
    setExpandedCard(prev => prev === title ? null : title);
  };

  // Color mappings for badges
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
    slate: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
    pink: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
    gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
    lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-500/20',
    fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'badge-green';
      case 'High': return 'badge-blue';
      case 'Growing': return 'badge-purple';
      default: return 'badge-slate';
    }
  };

  if (skills.length === 0) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10
                        flex items-center justify-center mx-auto mb-4">
          <Target size={32} className="text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Skills Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Upload your resume or add skills in your profile to get personalized career path recommendations.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10
                        flex items-center justify-center mx-auto mb-4">
          <Sparkles size={32} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Building Recommendations
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          We couldn't match your current skills to career paths. Try adding more industry-standard skills.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Skills summary */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500
                          flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Your Skills Profile</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {skills.length} skills analyzed • {recommendations.length} career paths matched
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 15).map(skill => (
            <span key={skill} className="badge badge-indigo text-xs">{skill}</span>
          ))}
          {skills.length > 15 && (
            <span className="badge badge-slate text-xs">+{skills.length - 15} more</span>
          )}
        </div>
      </div>

      {/* Career path cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((career, index) => {
          const isExpanded = expandedCard === career.title;
          const skillsGap = getSkillsGap(career.title, skills);
          const colorClass = colorClasses[career.color] || colorClasses.slate;

          return (
            <div
              key={career.title}
              className={`card-hover overflow-hidden transition-all duration-300 ${
                isExpanded ? 'md:col-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card header - clickable */}
              <button
                onClick={() => toggleCard(career.title)}
                className="w-full text-left focus:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl ${colorClass} border
                                    flex items-center justify-center text-2xl flex-shrink-0
                                    transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                      {career.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {career.title}
                        </h3>
                        {index === 0 && (
                          <span className="badge badge-green text-xs whitespace-nowrap">
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {career.matchedSkills.length} skills matched
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {career.matchPercentage}%
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">match</div>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                    bg-slate-100 dark:bg-slate-800 transition-transform duration-300
                                    ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} className="text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out
                                  bg-gradient-to-r from-indigo-500 to-violet-500`}
                      style={{ width: `${career.matchPercentage}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Expandable content */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out
                              ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {career.description}
                  </p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                        <DollarSign size={14} />
                        <span className="text-xs font-medium">Salary Range</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {career.salaryRange}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">Market Demand</span>
                      </div>
                      <span className={`badge ${getDemandColor(career.demand)} text-xs`}>
                        {career.demand}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                        <Target size={14} />
                        <span className="text-xs font-medium">Match Score</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {career.matchPercentage}% compatible
                      </p>
                    </div>
                  </div>

                  {/* Matched skills */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      Your Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {career.matchedSkills.map(skill => (
                        <span key={skill} className="badge badge-green text-xs">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills gap */}
                  {skillsGap.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20
                                    rounded-xl p-4">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                        <BookOpen size={14} />
                        Skills to Learn ({skillsGap.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsGap.slice(0, 8).map(skill => (
                          <span key={skill} className="badge badge-yellow text-xs">
                            {skill}
                          </span>
                        ))}
                        {skillsGap.length > 8 && (
                          <span className="badge badge-slate text-xs">
                            +{skillsGap.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
