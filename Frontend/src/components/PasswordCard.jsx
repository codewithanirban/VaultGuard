import { useState, useCallback } from 'react';

const CATEGORY_COLORS = {
  work: '#6366f1',
  personal: '#22d3ee',
  finance: '#f59e0b',
  social: '#ec4899',
  other: '#8892a8',
};

/**
 * PasswordCard — displays a single password entry with
 * show/hide, copy, edit, and delete actions.
 *
 * @param {{ entry: object, onEdit: Function, onDelete: Function, onCopy?: Function }} props
 * @returns {JSX.Element}
 */
const PasswordCard = ({ entry, onEdit, onDelete, onCopy }) => {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  /**
   * Copies the decrypted password to the clipboard and
   * shows a "Copied!" tooltip for 2 seconds.
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(entry.password);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = entry.password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  }, [entry.password, onCopy]);

  /** Renders the masked or visible password string. */
  const displayedPassword = showPw ? entry.password : '••••••••••••';

  return (
    <div className="password-card">
      {/* Header row: app name + category badge */}
      <div className="card-header">
        <h3 className="card-app-name">{entry.appName}</h3>
        <span
          className="category-badge"
          style={{ '--badge-color': CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other }}
        >
          {entry.category}
        </span>
      </div>

      {/* Details */}
      <div className="card-field">
        <span className="card-label">Username</span>
        <span className="card-value">{entry.username}</span>
      </div>

      <div className="card-field">
        <span className="card-label">Password</span>
        <div className="card-password-row">
          <code className="card-pw-value">{displayedPassword}</code>
          <div className="card-pw-actions">
            <button
              type="button"
              className="btn-icon btn-icon--sm"
              onClick={() => setShowPw((v) => !v)}
              title={showPw ? 'Hide' : 'Show'}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? '🙈' : '👁'}
            </button>
            <div className="copy-wrapper">
              <button
                type="button"
                className="btn-icon btn-icon--sm"
                onClick={handleCopy}
                title="Copy password"
                aria-label="Copy password"
              >
                📋
              </button>
              {copied && <span className="tooltip">Copied!</span>}
            </div>
          </div>
        </div>
      </div>

      {entry.remarks && (
        <div className="card-field">
          <span className="card-label">Remarks</span>
          <span className="card-value card-remarks">{entry.remarks}</span>
        </div>
      )}

      {/* Action row */}
      <div className="card-actions">
        {!confirming ? (
          <>
            <button
              type="button"
              className="btn btn--sm btn--outline"
              onClick={() => onEdit(entry)}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              className="btn btn--sm btn--danger-outline"
              onClick={() => setConfirming(true)}
            >
              🗑 Delete
            </button>
          </>
        ) : (
          <div className="confirm-delete">
            <span className="confirm-text">Sure?</span>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => { setConfirming(false); onDelete(entry._id); }}
            >
              Yes
            </button>
            <button
              type="button"
              className="btn btn--sm btn--outline"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordCard;
