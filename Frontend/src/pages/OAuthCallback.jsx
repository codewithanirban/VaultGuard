import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * OAuthCallback page — handles the redirect from the backend after
 * a successful Google OAuth flow.
 *
 * Reads the JWT from the `?token=` query parameter, persists it in
 * localStorage, restores the user via checkAuth(), then redirects
 * to the dashboard.
 *
 * @returns {JSX.Element}
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        await checkAuth();
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, checkAuth, navigate]);

  return (
    <div className="page page--oauth-callback">
      <div className="loading-spinner" aria-label="Authenticating">
        <div className="spinner" />
        <p>Completing sign-in…</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
