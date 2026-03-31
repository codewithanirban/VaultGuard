// File: Frontend/src/pages/Login.jsx
// Purpose: Authentication page with two-column split layout, custom form styling, and interactive effects.
// Dependencies: react, react-router-dom, AuthContext
// Production-safe: yes

import { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') === 'oauth_failed'
    ? 'Google sign-in failed. Please try again.'
    : '');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-layout {
          display: flex;
          min-height: 100vh;
        }
        
        /* Left Brand Panel */
        .brand-panel {
          width: 45%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .brand-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }
        .brand-panel h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .brand-panel p {
          font-size: 16px;
          opacity: 0.8;
          max-width: 300px;
        }

        /* Mockup Card */
        .mockup-card {
          margin-top: 60px;
          width: 280px;
          height: 180px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .mockup-row {
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          width: 100%;
        }
        .mockup-row.short { width: 60%; }
        .mockup-row.medium { width: 80%; }

        /* Right Form Panel */
        .form-panel {
          width: 55%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          animation: fadeInUp 0.4s ease-out both;
        }

        .auth-card h2 {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        
        .auth-subtext {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 32px;
        }
        .auth-subtext a {
          color: var(--accent-primary);
        }

        .input-wrapper { position: relative; }
        .input-with-icon { padding-right: 40px; }
        .pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .submit-btn {
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          width: 100%;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 12px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px var(--accent-glow);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .google-btn {
          height: 48px;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .google-btn:hover:not(:disabled) {
          border-color: var(--border-hover);
          background: rgba(255,255,255,0.05);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 14px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .divider:not(:empty)::before { margin-right: 16px; }
        .divider:not(:empty)::after { margin-left: 16px; }

        @media (max-width: 768px) {
          .brand-panel { display: none; }
          .form-panel { width: 100%; }
        }
      `}</style>

      <div className="auth-layout">
        <div className="brand-panel">
          <div className="brand-icon">🔒</div>
          <h1>Welcome back</h1>
          <p>Your vault is waiting. Sign in securely.</p>
          
          <div className="mockup-card" aria-hidden="true">
            <div className="mockup-row"></div>
            <div className="mockup-row medium"></div>
            <div className="mockup-row short" style={{ marginTop: 'auto' }}></div>
          </div>
        </div>

        <div className="form-panel">
          <div className="auth-card">
            <h2>Sign in to your vault</h2>
            <p className="auth-subtext">
              Don't have an account? <Link to="/register">Register →</Link>
            </p>

            {error && (
              <div className="alert alert--error" role="alert" style={{ marginBottom: '24px' }}>
                <span className="alert-icon">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
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
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    className="form-control input-with-icon"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <div className="spinner"></div> : 'Sign In'}
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
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
