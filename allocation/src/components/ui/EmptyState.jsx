export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="card text-center py-16 animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700
                        flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
