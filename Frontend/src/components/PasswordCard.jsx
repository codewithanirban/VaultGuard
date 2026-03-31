// File: Frontend/src/components/PasswordCard.jsx
// Purpose: Displays individual password entries with category styling, copy functionality, health badges, and inline delete confirmation.
// Dependencies: react
// Production-safe: yes

import { useState } from 'react';

// Maps category strings to a specific CSS color variable to create visually distinct icons
const CATEGORY_COLORS = {
  work: 'var(--accent-primary)',
  personal: 'var(--success)',
  finance: 'var(--warning)',
  social: 'var(--accent-secondary)',
  other: 'var(--text-muted)'
};

const CATEGORY_ICONS = {
  work: '💼',
  personal: '👤',
  finance: '🏦',
  social: '💬',
  other: '🔑'
};

const PasswordCard = ({ entry, onEdit, onDelete, healthWarnings = [] }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { appName, username, password, category = 'other', remarks } = entry;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const getCategoryColor = () => CATEGORY_COLORS[category] || CATEGORY_COLORS['other'];
  const getCategoryIcon = () => CATEGORY_ICONS[category] || CATEGORY_ICONS['other'];

  return (
    <div className="password-card">
      <style>{`
        .password-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
          animation: scaleIn 0.3s ease-out both;
          position: relative;
        }
        .password-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .pc-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: rgba(255, 255, 255, 0.05);
        }

        .pc-content { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
        .pc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .pc-title { font-size: 16px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .pc-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge--weak { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge--reused { background: rgba(249, 115, 22, 0.15); color: var(--warning); border: 1px solid rgba(249, 115, 22, 0.3); }
        .badge--outdated { background: rgba(168, 85, 247, 0.15); color: var(--accent-secondary); border: 1px solid rgba(168, 85, 247, 0.3); }

        .pc-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pc-remarks { font-size: 12px; color: var(--text-muted); font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .pc-actions { display: flex; align-items: center; gap: 8px; }

        .pc-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .pc-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); border-color: var(--border-hover); }

        .tooltip {
          position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px);
          background: var(--bg-primary); color: var(--text-primary); padding: 4px 8px; border-radius: 4px;
          font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; border: 1px solid var(--border);
        }
        .pc-btn:hover .tooltip.hover-only { opacity: 1; pointer-events: auto; }
        .tooltip.visible { opacity: 1; animation: fadeInUp 0.2s ease; }

        .delete-confirm { display: flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.1); padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3); animation: fadeIn 0.2s ease; }
        .delete-text { color: var(--danger); font-size: 13px; font-weight: 500; }
        .delete-btn-yes { background: var(--danger); color: white; border: none; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; }
        .delete-btn-no { background: transparent; color: var(--text-primary); border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500; }
        
        @media (max-width: 500px) {
          .password-card { display: flex; flex-direction: column; gap: 12px; }
          .pc-actions { margin-top: 8px; justify-content: flex-end; }
        }
      `}</style>

      <div className="pc-icon" style={{ color: getCategoryColor() }}>
        {getCategoryIcon()}
      </div>

      <div className="pc-content">
        <div className="pc-header">
          <div className="pc-title">{appName}</div>
          {healthWarnings.length > 0 && (
            <div className="pc-badges">
              {healthWarnings.includes('Weak password') && <span className="badge badge--weak">Weak</span>}
              {healthWarnings.includes('Reused password') && <span className="badge badge--reused">Reused</span>}
              {healthWarnings.includes('Not updated in 90+ days') && <span className="badge badge--outdated">Old</span>}
            </div>
          )}
        </div>
        <div className="pc-subtitle">{username}</div>
        {remarks && <div className="pc-remarks">{remarks}</div>}
      </div>

      <div className="pc-actions">
        {isDeleting ? (
          <div className="delete-confirm">
            <span className="delete-text">Delete?</span>
            <button className="delete-btn-yes" onClick={() => onDelete(entry._id)}>Yes</button>
            <button className="delete-btn-no" onClick={() => setIsDeleting(false)}>No</button>
          </div>
        ) : (
          <>
            <button className="pc-btn" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide Password" : "Show Password"}>
              {showPassword ? '🙈' : '👁'}
            </button>
            <button className="pc-btn" onClick={() => handleCopy(password)} onMouseLeave={() => setCopied(false)}>
              📋
              <span className={`tooltip ${copied ? 'visible' : 'hover-only'}`}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
            <button className="pc-btn" onClick={() => onEdit(entry)} title="Edit">
              ✏️
            </button>
            <button className="pc-btn" onClick={() => setIsDeleting(true)} title="Delete" style={{ color: 'var(--danger)' }}>
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordCard;
