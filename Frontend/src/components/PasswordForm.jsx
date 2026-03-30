import { useState, useEffect, useCallback } from 'react';
import PasswordStrengthBar from './PasswordStrengthBar';

const CATEGORIES = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'finance', label: 'Finance' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

const CHARSET_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_DIGITS = '0123456789';
const CHARSET_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const CHARSET_ALL = CHARSET_LOWER + CHARSET_UPPER + CHARSET_DIGITS + CHARSET_SYMBOLS;

/**
 * Generates a cryptographically random password of the given length,
 * guaranteeing at least one character from each character class.
 * @param {number} [length=16] - Desired password length (min 4).
 * @returns {string} The generated password.
 */
const generateStrongPassword = (length = 16) => {
  const safeLen = Math.max(length, 4);
  const randomValues = new Uint32Array(safeLen);
  crypto.getRandomValues(randomValues);

  // Guarantee one from each class
  const guaranteed = [
    CHARSET_LOWER[randomValues[0] % CHARSET_LOWER.length],
    CHARSET_UPPER[randomValues[1] % CHARSET_UPPER.length],
    CHARSET_DIGITS[randomValues[2] % CHARSET_DIGITS.length],
    CHARSET_SYMBOLS[randomValues[3] % CHARSET_SYMBOLS.length],
  ];

  // Fill the rest randomly
  const rest = [];
  for (let i = 4; i < safeLen; i++) {
    rest.push(CHARSET_ALL[randomValues[i] % CHARSET_ALL.length]);
  }

  // Shuffle the combined array (Fisher-Yates)
  const chars = [...guaranteed, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

/**
 * PasswordForm — reusable form for creating or editing a password entry.
 *
 * @param {{ initial?: object, onSubmit: Function, onCancel: Function, loading: boolean }} props
 * @returns {JSX.Element}
 */
const PasswordForm = ({ initial = null, onSubmit, onCancel, loading }) => {
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('other');
  const [remarks, setRemarks] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');

  // Populate fields when editing
  useEffect(() => {
    if (initial) {
      setAppName(initial.appName || '');
      setUsername(initial.username || '');
      setPassword(initial.password || '');
      setCategory(initial.category || 'other');
      setRemarks(initial.remarks || '');
    }
  }, [initial]);

  /**
   * Validates and submits the form.
   * @param {React.FormEvent} e
   */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormError('');

      if (!appName.trim()) return setFormError('App name is required');
      if (!username.trim()) return setFormError('Username is required');
      if (!password) return setFormError('Password is required');

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

  /** Fills the password field with a generated strong password. */
  const handleGenerate = () => {
    const pw = generateStrongPassword(16);
    setPassword(pw);
    setShowPw(true);
  };

  return (
    <form className="password-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert--error" role="alert">
          <span className="alert-icon">⚠</span>
          {formError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="pf-app-name">App / Website Name</label>
        <input
          id="pf-app-name"
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="e.g. GitHub"
          maxLength={100}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pf-username">Username / Email</label>
        <input
          id="pf-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. jane@example.com"
          maxLength={100}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pf-password">Password</label>
        <div className="input-with-actions">
          <input
            id="pf-password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />
          <button
            type="button"
            className="btn-icon"
            onClick={() => setShowPw((v) => !v)}
            title={showPw ? 'Hide password' : 'Show password'}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? '🙈' : '👁'}
          </button>
        </div>

        {/* Generate button */}
        <button
          type="button"
          className="btn btn--sm btn--outline generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          ⚡ Generate Password
        </button>

        {/* Strength indicator (reusable component) */}
        <PasswordStrengthBar password={password} />
      </div>

      <div className="form-group">
        <label htmlFor="pf-category">Category</label>
        <select
          id="pf-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="pf-remarks">Remarks (optional)</label>
        <textarea
          id="pf-remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any notes…"
          maxLength={500}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
        >
          {loading ? 'Saving…' : initial ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;
