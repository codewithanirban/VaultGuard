// File: Frontend/src/pages/Home.jsx
// Purpose: Landing page with deep UI overhaul, layered effects, animations, and feature cards.
// Dependencies: react-router-dom
// Production-safe: yes

import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <style>{`
        .home-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px;
          overflow: hidden;
        }

        /* Background Layers */
        .home-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
        }
        .home-bg-1 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 50%, var(--accent-primary) 0%, transparent 40%);
          opacity: 0.15;
          animation: pulse-glow 8s infinite ease-in-out;
        }
        .home-bg-2 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, transparent 35%);
          opacity: 0.15;
          animation: pulse-glow 8s infinite ease-in-out reverse;
        }
        .home-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            repeating-linear-gradient(var(--border) 0, var(--border) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 40px);
          opacity: 0.5;
        }

        /* Hero Content */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 800px;
          margin-top: 60px;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid var(--accent-primary);
          background: var(--accent-glow);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          animation: fadeIn 0.3s 0.1s both;
        }

        .hero h1 {
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease-out both;
        }
        .hero h1 .gradient-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 500px;
          margin-bottom: 40px;
          line-height: 1.5;
          animation: fadeInUp 0.6s 0.2s ease-out both;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s 0.3s ease-out both;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-primary-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          box-shadow: 0 4px 14px transparent;
        }
        .hero-primary-btn:hover {
          box-shadow: 0 4px 14px var(--accent-glow);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          opacity: 0.9;
        }
        
        .hero-secondary-btn {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .hero-secondary-btn:hover {
          border-color: var(--border-hover);
        }

        .social-proof {
          color: var(--text-muted);
          font-size: 14px;
          animation: fadeInUp 0.6s 0.3s ease-out both;
        }

        /* Features */
        .features {
          display: flex;
          gap: 24px;
          margin-top: 100px;
          max-width: 1000px;
          width: 100%;
          flex-wrap: wrap;
          justify-content: center;
          z-index: 1;
        }

        .feature-card {
          flex: 1;
          min-width: 280px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          text-align: left;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px var(--accent-glow);
        }

        .feature-icon {
          font-size: 28px;
          margin-bottom: 16px;
          display: block;
        }

        .feature-card h3 {
          color: var(--text-primary);
          font-size: 18px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        .fc-1 { animation: fadeInUp 0.5s 0.1s both; }
        .fc-2 { animation: fadeInUp 0.5s 0.2s both; }
        .fc-3 { animation: fadeInUp 0.5s 0.3s both; }

        @media (max-width: 640px) {
          .features { flex-direction: column; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions .btn { width: 100%; }
        }
      `}</style>

      <div className="home-page">
        <div className="home-bg">
          <div className="home-bg-1"></div>
          <div className="home-bg-2"></div>
          <div className="home-bg-grid"></div>
        </div>

        <div className="hero">
          <div className="hero-badge">🔐 Zero-knowledge encryption</div>
          
          <h1>
            Your passwords,<br/>
            <span className="gradient-text">perfectly secured.</span>
          </h1>
          
          <p className="hero-sub">
            AES-256 encrypted vault with zero plain-text storage. Built for security, designed for simplicity.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn hero-primary-btn">Get Started Free</Link>
            <Link to="/login" className="btn hero-secondary-btn">Sign In</Link>
          </div>

          <div className="social-proof">
            No credit card required  ·  Works on all devices  ·  Open source
          </div>
        </div>

        <div className="features">
          <div className="feature-card fc-1">
            <span className="feature-icon">🔒</span>
            <h3>Military-grade Encryption</h3>
            <p>AES-256-CBC with unique IV per entry. Your master password never leaves your device.</p>
          </div>
          <div className="feature-card fc-2">
            <span className="feature-icon">⚡</span>
            <h3>Instant Access</h3>
            <p>Search, copy, and autofill in seconds. Your vault opens in one click.</p>
          </div>
          <div className="feature-card fc-3">
            <span className="feature-icon">🛡️</span>
            <h3>Health Monitoring</h3>
            <p>Detect reused, weak, and outdated passwords automatically.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
