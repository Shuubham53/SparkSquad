export default function StatsCard({ icon: Icon, label, value, color = 'indigo' }) {
  const iconColors = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    violet: 'text-violet-600 dark:text-violet-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
  };

  const bgColors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10',
    violet: 'bg-violet-50 dark:bg-violet-500/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
    amber: 'bg-amber-50 dark:bg-amber-500/10',
    rose: 'bg-rose-50 dark:bg-rose-500/10',
  };

  return (
    <div className="card-hover group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bgColors[color]}
                         flex items-center justify-center
                         group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className={iconColors[color]} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}
