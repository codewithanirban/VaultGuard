import { Link } from 'react-router-dom';

/**
 * Home page — landing view for the password manager.
 * Provides navigation links to login and register.
 * @returns {JSX.Element}
 */
const Home = () => {
  return (
    <div className="page page--home">
      <h1>VaultGuard</h1>
      <p>Your passwords, encrypted and under your control.</p>
      <nav className="home-nav">
        <Link to="/login" className="btn btn--primary">
          Log In
        </Link>
        <Link to="/register" className="btn btn--secondary">
          Create Account
        </Link>
      </nav>
    </div>
  );
};

export default Home;
