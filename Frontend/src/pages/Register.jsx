import { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Password complexity rules checked in real time.
 * Each rule has a label and a regex test.
 */
const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'digit', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { id: 'special', label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/**
 * Register page — new user sign-up with live password validation.
 *
 * - Client-side validation runs before submit.
 * - On success: calls register() from AuthContext → auto-login → redirect to /dashboard.
 * - Displays inline errors on API failure.
 * - Disable submit button while the request is in-flight.
 *
 * @returns {JSX.Element}
 */
const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /** Live password-rule results. */
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );

  /** True when every password rule passes. */
  const allRulesPassed = ruleResults.every((r) => r.passed);

  /** True when the confirm field matches. */
  const passwordsMatch = password === confirmPassword;

  /**
   * Client-side validation — returns an error string or empty string.
   * @returns {string}
   */
  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!allRulesPassed) return 'Password does not meet all complexity requirements.';
    if (!passwordsMatch) return 'Passwords do not match.';
    return '';
  };

  /**
   * Handles form submission — registers and auto-logs in.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--auth">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Start securing your passwords with VaultGuard</p>
        </div>

        {error && (
          <div className="alert alert--error" role="alert" id="register-error">
            <span className="alert-icon">⚠</span>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={submitting}
            />

            {/* ── Live password-strength feedback ── */}
            {password.length > 0 && (
              <ul className="password-rules" aria-label="Password requirements">
                {ruleResults.map((rule) => (
                  <li
                    key={rule.id}
                    className={`password-rule ${rule.passed ? 'rule--pass' : 'rule--fail'}`}
                  >
                    <span className="rule-icon">{rule.passed ? '✓' : '✗'}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={submitting}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="field-error">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            id="register-submit"
            disabled={submitting || !allRulesPassed || !passwordsMatch}
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
