import { createContext, useContext, useState, useCallback, useRef } from 'react';

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 3000;

/**
 * @typedef {'success' | 'error' | 'info' | 'warning'} ToastVariant
 * @typedef {{ id: number, message: string, variant: ToastVariant }} Toast
 */

const ToastContext = createContext(null);

/**
 * Custom hook to access the toast API.
 * @returns {{ addToast: (message: string, variant?: ToastVariant) => void }}
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

/**
 * ToastProvider — wraps the app and provides a toast notification system.
 *
 * - Up to 3 toasts visible at once (oldest removed first).
 * - Auto-dismiss after 3 seconds.
 * - Supports: success, error, info, warning variants.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  /**
   * Adds a toast notification.
   * @param {string} message - Display text.
   * @param {ToastVariant} [variant='info'] - Visual variant.
   */
  const addToast = useCallback((message, variant = 'info') => {
    const id = ++idRef.current;

    setToasts((prev) => {
      const next = [...prev, { id, message, variant }];
      // Trim to MAX_TOASTS (remove oldest)
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  /**
   * Manually dismiss a toast by id.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.variant}`}
            role="alert"
          >
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
