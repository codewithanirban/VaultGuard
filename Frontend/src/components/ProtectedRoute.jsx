import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute — guards child routes behind authentication.
 *
 * - While the auth state is loading, displays a spinner.
 * - If no user is authenticated, redirects to /login.
 * - Otherwise, renders the wrapped children.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="page page--loading">
        <div className="loading-spinner" aria-label="Checking authentication">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
