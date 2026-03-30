import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { fetchAll, createEntry, updateEntry, deleteEntry } from '../api/passwordService';
import PasswordCard from '../components/PasswordCard';
import PasswordForm from '../components/PasswordForm';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'finance', label: 'Finance' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

/**
 * Dashboard page — main vault view after authentication.
 *
 * Displays a searchable, filterable grid of PasswordCards with a
 * modal overlay for creating / editing entries.
 *
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { addToast } = useToast();

  // ── Data state ────────────────────────────────────
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Modal state ───────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef(null);

  // ── Fetch entries ─────────────────────────────────
  /**
   * Loads all password entries, optionally filtered by search and category.
   * @param {string} [searchTerm='']
   * @param {string} [category='all']
   */
  const loadEntries = useCallback(async (searchTerm = '', category = 'all') => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAll(searchTerm, category);
      setEntries(data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load passwords';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadEntries(search, categoryFilter);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, categoryFilter, loadEntries]);

  // ── Modal helpers ─────────────────────────────────
  const openCreateModal = () => {
    setSelectedEntry(null);
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  // ── CRUD handlers ─────────────────────────────────
  /**
   * Handles form submission for both create and edit.
   * @param {object} formData
   */
  const handleFormSubmit = async (formData) => {
    try {
      setSaving(true);
      setError('');
      if (selectedEntry) {
        await updateEntry(selectedEntry._id, formData);
        addToast('Entry updated', 'success');
      } else {
        await createEntry(formData);
        addToast('Entry added', 'success');
      }
      closeModal();
      await loadEntries(search, categoryFilter);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save entry';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Deletes a password entry and refreshes the list.
   * @param {string} id
   */
  const handleDelete = async (id) => {
    try {
      setError('');
      await deleteEntry(id);
      addToast('Entry deleted', 'success');
      await loadEntries(search, categoryFilter);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete entry';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  return (
    <div className="page page--dashboard">
      {/* ── Header ───────────────────────────────── */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>My Vault</h1>
          {user && <span className="dashboard-user">Welcome, {user.name}</span>}
        </div>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          id="logout-btn"
          onClick={logout}
        >
          Log Out
        </button>
      </header>

      {/* ── Error banner ─────────────────────────── */}
      {error && (
        <div className="alert alert--error alert--dismissible" role="alert">
          <span className="alert-icon">⚠</span>
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Controls bar ─────────────────────────── */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              id="search-input"
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by app or username…"
            />
          </div>
          <select
            id="category-filter"
            className="category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          id="add-entry-btn"
          onClick={openCreateModal}
        >
          + Add Entry
        </button>
      </div>

      {/* ── Content ──────────────────────────────── */}
      {loading && entries.length === 0 ? (
        <div className="loading-spinner dashboard-loading">
          <div className="spinner" />
          <p>Loading your vault…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h2>No passwords yet</h2>
          <p>Click &quot;Add Entry&quot; to store your first credential securely.</p>
        </div>
      ) : (
        <div className="password-grid">
          {entries.map((entry) => (
            <PasswordCard
              key={entry._id}
              entry={entry}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onCopy={() => addToast('Password copied!', 'success')}
            />
          ))}
        </div>
      )}

      {/* ── Modal overlay ────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedEntry ? 'Edit Password' : 'Add Password'}
          >
            <div className="modal-header">
              <h2>{selectedEntry ? 'Edit Entry' : 'New Entry'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <PasswordForm
              initial={selectedEntry}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              loading={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
