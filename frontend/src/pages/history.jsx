import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { requireAuth } from '../lib/auth.js';
import { renderNavbar } from '../lib/navbar.js';
import { apiFetch } from '../lib/api.js';
import { formatDate, shortenText, toPercent } from '../lib/format.js';

// Enforce auth & render navbar
if (requireAuth()) {
  renderNavbar();
}

const PAGE_SIZE = 10;

function HistoryItem({ item, onDelete }) {
  const isSpam = item.spam_label === 'SPAM';
  const isPos = item.sentiment_label === 'POSITIVE';

  return (
    <div className="history-item">
      <div className="history-main">
        <div className="history-text">{shortenText(item.input_text, 80)}</div>
        <div className="history-meta">
          <span>{formatDate(item.created_at)}</span>
          <span>•</span>
          <span className={`badge ${isSpam ? 'badge-spam' : 'badge-ham'}`}>
            {item.spam_label} ({toPercent(item.spam_confidence)})
          </span>
          <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`}>
            {item.sentiment_label} ({toPercent(item.sentiment_confidence)})
          </span>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => onDelete(item.id)}
      >
        Delete
      </button>
    </div>
  );
}

function History() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async (newOffset, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await apiFetch(`/history?limit=${PAGE_SIZE}&offset=${newOffset}`);
      setTotal(data.total);
      setOffset(newOffset);
      if (append) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHistory(0, false);
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this analysis?');
    if (!confirmed) return;

    try {
      await apiFetch(`/history/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Failed to delete analysis.');
    }
  };

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    fetchHistory(nextOffset, true);
  };

  return (
    <main className="container">
      <div className="card">
        <h1 className="card-title">Analysis History</h1>
        <p className="card-subtitle">
          Review your past spam and sentiment checks
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="state-box">
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No analyses yet.</p>
            <p>
              Start by analyzing text on the <a href="/index.html">Analyze page</a>.
            </p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <HistoryItem key={item.id} item={item} onDelete={handleDelete} />
            ))}

            {items.length < total && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading more...' : `Load More (${items.length} of ${total})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<History />);

