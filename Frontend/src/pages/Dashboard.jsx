// File: Frontend/src/pages/Dashboard.jsx
// Purpose: Main vault view completely overhauled with sidebar, health stats, and export capability.
// Dependencies: react, AuthContext, passwordService, PasswordCard, PasswordForm, exportPasswords, passwordHealth
// Production-safe: yes

import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchAll, createEntry, updateEntry, deleteEntry } from '../api/passwordService';
import PasswordCard from '../components/PasswordCard';
import PasswordForm from '../components/PasswordForm';
import { exportToJSON } from '../utils/exportPasswords';
import { checkHealth, getHealthSummary } from '../utils/passwordHealth';

const CATEGORIES = [
  { value: 'all', label: 'All Passwords', icon: '📂' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '🏦' },
  { value: 'social', label: 'Social', icon: '💬' },
  { value: 'other', label: 'Other', icon: '🔑' },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debounceRef = useRef(null);

  const loadEntries = useCallback(async (searchTerm = '', category = 'all') => {
    try {
      setLoading(true);
      const data = await fetchAll(searchTerm, category);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadEntries(search, categoryFilter);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, categoryFilter, loadEntries]);

  const handleFormSubmit = async (formData) => {
    try {
      setSaving(true);
      if (selectedEntry) {
        await updateEntry(selectedEntry._id, formData);
      } else {
        await createEntry(formData);
      }
      setShowModal(false);
      setSelectedEntry(null);
      await loadEntries(search, categoryFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id);
      await loadEntries(search, categoryFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const healthMap = useMemo(() => checkHealth(entries), [entries]);
  const healthStats = useMemo(() => getHealthSummary(healthMap), [healthMap]);

  return (
    <div className="dashboard-layout">
      <style>{`
        .dashboard-layout {
          display: flex; height: 100vh; background: var(--bg-primary); overflow: hidden;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 260px; background: var(--bg-secondary); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; transition: transform 0.3s ease;
          overflow-y: auto; z-index: 50; flex-shrink: 0;
        }
        .sidebar-header { padding: 24px; border-bottom: 1px solid var(--border); }
        .brand { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; }
        .brand-icon { font-size: 24px; }
        
        .health-card {
          background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 16px;
        }
        .health-title { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; }
        .health-stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; }
        .health-stat-row:last-child { margin-bottom: 0; }
        .stat-label { color: var(--text-muted); }
        .stat-val { font-weight: 600; color: var(--text-primary); }
        .stat-val.warn { color: var(--warning); }
        .stat-val.danger { color: var(--danger); }

        .sidebar-nav { flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px;
          color: var(--text-secondary); text-decoration: none; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; border: none; background: transparent; width: 100%; text-align: left;
        }
        .nav-item:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
        .nav-item.active { background: var(--accent-glow); color: var(--accent-primary); font-weight: 600; }
        
        .sidebar-footer { padding: 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
        .user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; flex-shrink: 0; }
        .user-info { display: flex; flex-direction: column; overflow: hidden; }
        .user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* ── MAIN CONTENT ── */
        .main-content {
          flex: 1; display: flex; flex-direction: column; position: relative; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;
        }

        .main-header {
          position: sticky; top: 0; z-index: 40; background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
          padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px;
        }
        .mobile-menu-btn { display: none; background: none; border: none; color: var(--text-primary); font-size: 24px; cursor: pointer; }
        
        .search-container { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-input {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px;
          padding: 12px 16px 12px 40px; color: var(--text-primary); font-size: 14px; transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .search-input:focus { border-color: var(--accent-primary); outline: none; }

        .vault-content { padding: 32px; flex: 1; }
        .vault-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
        }
        .empty-vault {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; min-height: 400px; color: var(--text-muted); padding: 40px; text-align: center;
        }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 999; padding: 24px;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-card {
          background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px;
          width: 100%; max-width: 500px; padding: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.5);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
        }
        .modal-header h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); }
        .modal-close { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
        .modal-close:hover { color: var(--text-primary); }

        /* Responsive */
        @media (max-width: 900px) {
          .sidebar { position: fixed; inset: 0 auto 0 0; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .mobile-menu-btn { display: block; }
          .main-header { padding: 16px; }
          .vault-content { padding: 16px; }
        }
      `}</style>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 45, backdropFilter: 'none' }} 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">🔐</span> VaultGuard
          </div>
          
          <div className="health-card">
            <div className="health-title">Vault Health</div>
            <div className="health-stat-row">
              <span className="stat-label">Total Items</span>
              <span className="stat-val">{entries.length}</span>
            </div>
            <div className="health-stat-row">
              <span className="stat-label">Weak</span>
              <span className={`stat-val ${healthStats.weak > 0 ? 'danger' : ''}`}>{healthStats.weak}</span>
            </div>
            <div className="health-stat-row">
              <span className="stat-label">Reused</span>
              <span className={`stat-val ${healthStats.reused > 0 ? 'warn' : ''}`}>{healthStats.reused}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`nav-item ${categoryFilter === cat.value ? 'active' : ''}`}
              onClick={() => { setCategoryFilter(cat.value); setSidebarOpen(false); }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn--secondary btn--full" 
            onClick={() => exportToJSON(entries)}
            disabled={entries.length === 0}
            title="Export full vault to JSON"
          >
            📥 Export Data
          </button>
          
          <div className="user-profile" style={{ marginTop: '12px' }}>
            <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
            </div>
          </div>
          <button className="btn btn--ghost btn--full" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="main-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vault..."
            />
          </div>

          <button className="btn btn--primary" onClick={() => { setSelectedEntry(null); setShowModal(true); }}>
            + Add New
          </button>
        </header>

        <div className="vault-content">
          {loading ? (
             <div className="empty-vault">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="empty-vault">
              <span style={{ fontSize: '48px', margin: '0 0 16px 0', opacity: 0.5 }}>📭</span>
              <h3>Nothing found</h3>
              <p>Your vault is empty or no matches found for your search.</p>
            </div>
          ) : (
            <div className="vault-grid">
              {entries.map(entry => (
                <PasswordCard
                  key={entry._id}
                  entry={entry}
                  healthWarnings={healthMap.get(entry._id ? entry._id.toString() : '') || []}
                  onEdit={(e) => { setSelectedEntry(e); setShowModal(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEntry ? 'Edit Password' : 'Add Password'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <PasswordForm
              initial={selectedEntry}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowModal(false)}
              loading={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
