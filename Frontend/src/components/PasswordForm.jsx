// File: Frontend/src/components/PasswordForm.jsx
// Purpose: Reusable form for adding/editing a password. Updated to new UI with generator inside password input.
// Dependencies: react, getPasswordStrength, generatePassword from passwordGenerator
// Production-safe: yes

import { useState, useEffect, useCallback } from 'react';
import { generatePassword, getPasswordStrength } from '../utils/passwordGenerator';

const CATEGORIES = [
  { value: 'other', label: 'Other 🔑' },
  { value: 'work', label: 'Work 💼' },
  { value: 'personal', label: 'Personal 👤' },
  { value: 'finance', label: 'Finance 🏦' },
  { value: 'social', label: 'Social 💬' }
];

const PasswordForm = ({ initial = null, onSubmit, onCancel, loading }) => {
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('other');
  const [remarks, setRemarks] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initial) {
      setAppName(initial.appName || '');
      setUsername(initial.username || '');
      setPassword(initial.password || '');
      setCategory(initial.category || 'other');
      setRemarks(initial.remarks || '');
    } else {
      setAppName('');
      setUsername('');
      setPassword('');
      setCategory('other');
      setRemarks('');
      setFormError('');
    }
  }, [initial]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormError('');

      if (!appName.trim() || !username.trim() || !password) {
        return setFormError('App name, username, and password are required.');
      }

      onSubmit({
        appName: appName.trim(),
        username: username.trim(),
        password,
        category,
        remarks: remarks.trim(),
      });
    },
    [appName, username, password, category, remarks, onSubmit]
  );

  const handleGenerate = () => {
    const newPw = generatePassword({ length: 16 });
    setPassword(newPw);
    setShowPw(true);
  };

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <form className="password-form" onSubmit={handleSubmit} noValidate>
      <style>{`
        .pf-container { display: flex; flex-direction: column; gap: 16px; }
        .pf-group { display: flex; flex-direction: column; gap: 6px; }
        .pf-group.row { flex-direction: row; gap: 12px; }
        .pf-group.row > * { flex: 1; }
        
        .pf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .pf-input {
          background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 10px;
          padding: 12px 16px; color: var(--text-primary); font-size: 14px; width: 100%;
          transition: all 0.2s ease; font-family: 'Inter', sans-serif;
        }
        .pf-input:focus { border-color: var(--accent-primary); outline: none; box-shadow: 0 0 0 3px var(--accent-glow); }
        .pf-input::placeholder { color: var(--text-muted); }

        .pf-pw-wrapper { position: relative; display: flex; align-items: center; }
        .pf-pw-input { padding-right: 80px; } /* Room for two absolute buttons */
        
        .pf-actions-inline { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px; }
        .pf-icon-btn {
          background: transparent; border: none; color: var(--text-secondary); cursor: pointer;
          width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .pf-icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
        
        .pf-textarea { resize: vertical; min-height: 80px; }
        
        .pf-strength-container { display: flex; gap: 4px; margin-top: 4px; height: 4px; }
        .pf-strength-segment { flex: 1; background: var(--bg-tertiary); border-radius: 2px; transition: background 0.3s ease; }
        
        .pf-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
      `}</style>

      {formError && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: '16px' }}>
          <span className="alert-icon">⚠</span> {formError}
        </div>
      )}

      <div className="pf-container">
        <div className="pf-group row">
          <div className="pf-group">
            <label className="pf-label" htmlFor="pf-app">Platform Name</label>
            <input
              id="pf-app" type="text" className="pf-input" value={appName}
              onChange={e => setAppName(e.target.value)} placeholder="e.g. GitHub" required disabled={loading}
              autoFocus={!initial}
            />
          </div>
          <div className="pf-group">
            <label className="pf-label" htmlFor="pf-cat">Category</label>
            <select
              id="pf-cat" className="pf-input" value={category}
              onChange={e => setCategory(e.target.value)} disabled={loading}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="pf-group">
          <label className="pf-label" htmlFor="pf-user">Username / Email</label>
          <input
            id="pf-user" type="text" className="pf-input" value={username}
            onChange={e => setUsername(e.target.value)} placeholder="hello@example.com" required disabled={loading}
          />
        </div>

        <div className="pf-group">
          <label className="pf-label" htmlFor="pf-pw">Password</label>
          <div className="pf-pw-wrapper">
            <input
              id="pf-pw" type={showPw ? 'text' : 'password'} className="pf-input pf-pw-input"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading}
            />
            <div className="pf-actions-inline">
              <button type="button" className="pf-icon-btn" onClick={handleGenerate} title="Generate Strong Password">⚡</button>
              <button type="button" className="pf-icon-btn" onClick={() => setShowPw(!showPw)} title={showPw ? "Hide" : "Show"}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {strength && (
            <div className="pf-strength-container">
              {[1, 2, 3, 4].map(level => (
                <div key={level} className="pf-strength-segment" style={{ background: level <= strength.score ? strength.color : 'var(--bg-tertiary)' }} />
              ))}
            </div>
          )}
        </div>

        <div className="pf-group">
          <label className="pf-label" htmlFor="pf-remarks">Notes (Optional)</label>
          <textarea
            id="pf-remarks" className="pf-input pf-textarea" value={remarks}
            onChange={e => setRemarks(e.target.value)} placeholder="Add any extra notes..." disabled={loading}
          />
        </div>
      </div>

      <div className="pf-footer">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Save Changes' : 'Add Password')}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;
