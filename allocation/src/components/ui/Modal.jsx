import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4
                 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div className={`w-full ${sizes[size]} bg-white dark:bg-slate-800 rounded-2xl shadow-xl
                       border border-slate-200 dark:border-slate-700 animate-scale-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
