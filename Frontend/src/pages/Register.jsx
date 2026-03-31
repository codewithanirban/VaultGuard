// File: Frontend/src/pages/Register.jsx
// Purpose: New user sign-up matching BATCH 9 specifications with two-column layout and active password strength/checklist checking.
// Dependencies: react, react-router-dom, AuthContext, passwordGenerator
// Production-safe: yes

import { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPasswordStrength } from '../utils/passwordGenerator';

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'digit', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { id: 'special', label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const Register = () => {
  const { register, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const ruleResults = useMemo(() => 
    PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
  [password]);

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const strength = password.length > 0 ? getPasswordStrength(password) : null;

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!allRulesPassed) return 'Password does not meet all complexity requirements.';
    if (!passwordsMatch) return 'Passwords do not match.';
    return '';
  };

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
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        /* Same base auth styles as Login */
        .auth-layout { display: flex; min-height: 100vh; }
        
        .brand-panel {
          width: 45%; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px; color: white; text-align: center; position: relative; overflow: hidden;
        }
        .brand-icon { font-size: 64px; margin-bottom: 24px; }
        .brand-panel h1 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
        .brand-panel p { font-size: 16px; opacity: 0.8; max-width: 300px; }

        .mockup-card {
          margin-top: 60px; width: 280px; height: 180px;
          background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .mockup-row { height: 12px; background: rgba(255, 255, 255, 0.2); border-radius: 6px; width: 100%; }
        .mockup-row.short { width: 60%; }
        .mockup-row.medium { width: 80%; }

        .form-panel {
          width: 55%; background: var(--bg-secondary);
          display: flex; align-items: center; justify-content: center; padding: 40px 24px;
        }
        .auth-card { width: 100%; max-width: 400px; animation: fadeInUp 0.4s ease-out both; }
        .auth-card h2 { font-size: 22px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
        .auth-subtext { color: var(--text-secondary); font-size: 14px; margin-bottom: 32px; }
        .auth-subtext a { color: var(--accent-primary); }

        .input-wrapper { position: relative; }
        .input-with-icon { padding-right: 40px; }
        .pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); cursor: pointer;
        }

        .submit-btn {
          height: 48px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white; width: 100%; border: none; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; margin-top: 12px;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
        }

        .google-btn {
          height: 48px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--border);
          color: var(--text-primary); width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 12px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;
        }
        .google-btn:hover:not(:disabled) { border-color: var(--border-hover); background: rgba(255,255,255,0.05); }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .divider { display: flex; align-items: center; text-align: center; margin: 24px 0; color: var(--text-muted); font-size: 14px; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border); }
        .divider:not(:empty)::before { margin-right: 16px; }
        .divider:not(:empty)::after { margin-left: 16px; }

        @media (max-width: 768px) {
          .brand-panel { display: none; }
          .form-panel { width: 100%; padding: 40px 16px; }
        }

        /* Password specific styling */
        .strength-bar-container { display: flex; gap: 4px; margin-top: 8px; height: 4px; }
        .strength-segment { flex: 1; background: var(--bg-tertiary); border-radius: 2px; transition: background 0.3s ease; }
        .strength-label { font-size: 11px; margin-top: 6px; text-transform: uppercase; font-weight: 600; text-align: right; }

        .checklist {
          margin-top: 12px; font-size: 13px; color: var(--text-secondary);
          display: flex; flex-direction: column; gap: 6px; animation: fadeIn 0.3s ease;
        }
        .checklist-item { display: flex; align-items: center; gap: 8px; }
        .check-icon { font-weight: bold; width: 16px; text-align: center; }
        .check--pass { color: var(--success); animation: checkBounce 0.4s ease; }
        .check--fail { color: var(--text-muted); }

        .confirm-match { padding-right: 66px; }
        .confirm-match-icon {
          position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-weight: bold; font-size: 14px;
        }
        .confirm-match-icon.pass { color: var(--success); }
        .confirm-match-icon.fail { color: var(--danger); }
      `}</style>

      <div className="auth-layout">
        <div className="brand-panel">
          <div className="brand-icon">🔒</div>
          <h1>Join thousands securing their digital life.</h1>
          <p>Your passwords encrypted. Your privacy protected.</p>
          
          <div className="mockup-card" aria-hidden="true">
            <div className="mockup-row"></div>
            <div className="mockup-row medium"></div>
            <div className="mockup-row short" style={{ marginTop: 'auto' }}></div>
          </div>
        </div>

        <div className="form-panel">
          <div className="auth-card">
            <h2>Create Account</h2>
            <p className="auth-subtext">
              Already have an account? <Link to="/login">Sign in →</Link>
            </p>

            {error && (
              <div className="alert alert--error" role="alert" style={{ marginBottom: '24px' }}>
                <span className="alert-icon">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="reg-name">Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    className="form-control input-with-icon"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocused(true)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  <button 
                    type="button" 
                    className="pw-toggle" 
                    onClick={() => setShowPw(!showPw)}
                    tabIndex="-1"
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>

                {password.length > 0 && strength && (
                  <>
                    <div className="strength-bar-container">
                      {[1, 2, 3, 4].map(level => (
                        <div 
                          key={level} 
                          className="strength-segment" 
                          style={{ background: level <= strength.score ? strength.color : 'var(--bg-tertiary)' }}
                        ></div>
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </div>
                  </>
                )}

                {(pwFocused || password.length > 0) && (
                  <div className="checklist">
                    {ruleResults.map(rule => (
                      <div key={rule.id} className="checklist-item">
                        <span className={`check-icon ${rule.passed ? 'check--pass' : 'check--fail'}`}>
                          {rule.passed ? '✓' : '✗'}
                        </span>
                        <span style={{ color: rule.passed ? 'var(--text-primary)' : 'inherit' }}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    id="reg-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    className={`form-control input-with-icon ${confirmPassword.length > 0 ? 'confirm-match' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  {confirmPassword.length > 0 && (
                    <span className={`confirm-match-icon ${passwordsMatch ? 'pass' : 'fail'}`}>
                      {passwordsMatch ? '✓' : '✗'}
                    </span>
                  )}
                  <button 
                    type="button" 
                    className="pw-toggle" 
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    tabIndex="-1"
                  >
                    {showConfirmPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={submitting || !allRulesPassed || !passwordsMatch}
              >
                {submitting ? <div className="spinner"></div> : 'Create Account'}
              </button>
            </form>

            <div className="divider">or</div>

            <button type="button" className="google-btn" onClick={loginWithGoogle} disabled={submitting}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
