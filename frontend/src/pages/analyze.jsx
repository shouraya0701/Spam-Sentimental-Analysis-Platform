import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { requireAuth } from '../lib/auth.js';
import { renderNavbar } from '../lib/navbar.js';
import { apiFetch } from '../lib/api.js';
import { toPercent } from '../lib/format.js';

// Enforce auth & render navbar
if (requireAuth()) {
  renderNavbar();
}

const EXAMPLES = [
  {
    label: '🚨 Spam Example',
    text: 'WINNER! You have been selected to win a £1,000 cash prize or a free cruise! Call 09061701461 right now to claim your reward.',
  },
  {
    label: '⭐ Positive Review',
    text: 'The food was absolutely fantastic and the staff went above and beyond to make our evening wonderful! Will definitely come back.',
  },
  {
    label: '👎 Negative Review',
    text: 'Terrible experience. The order was over an hour late, freezing cold, and completely inedible. Customer service was very rude.',
  },
];

function ResultCard({ result }) {
  if (!result) return null;

  const isSpam = result.spam_label === 'SPAM';
  const isPos = result.sentiment_label === 'POSITIVE';

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h2 className="card-title">Analysis Results</h2>
      <p className="card-subtitle">AI classification and confidence breakdown</p>

      <div className="result-grid">
        {/* Spam Box */}
        <div className="result-box">
          <div className="result-header">
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              SPAM FILTER
            </span>
            <span className={`badge ${isSpam ? 'badge-spam' : 'badge-ham'}`}>
              {result.spam_label}
            </span>
          </div>
          <div className="result-confidence">
            {toPercent(result.spam_confidence)}
          </div>
          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${isSpam ? 'progress-fill-spam' : 'progress-fill-ham'}`}
              style={{ width: `${Math.min(100, Math.max(0, result.spam_confidence * 100))}%` }}
            />
          </div>
        </div>

        {/* Sentiment Box */}
        <div className="result-box">
          <div className="result-header">
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              SENTIMENT ANALYSIS
            </span>
            <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`}>
              {result.sentiment_label}
            </span>
          </div>
          <div className="result-confidence">
            {toPercent(result.sentiment_confidence)}
          </div>
          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${isPos ? 'progress-fill-positive' : 'progress-fill-negative'}`}
              style={{ width: `${Math.min(100, Math.max(0, result.sentiment_confidence * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Analyze() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card">
        <h1 className="card-title">Analyze Text</h1>
        <p className="card-subtitle">
          Detect spam and evaluate sentiment using trained local machine learning models
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Try an example or paste your text below:</label>
          <div className="btn-group">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-chip"
                onClick={() => {
                  setText(ex.text);
                  setError(null);
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <textarea
            className="form-textarea"
            rows="6"
            placeholder="Type or paste SMS, email, or review text here..."
            maxLength={5000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="char-counter">
            {text.length} / 5000 characters
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px', borderTopColor: '#fff', verticalAlign: 'middle' }}></span>
              Analyzing...
            </>
          ) : (
            'Analyze Text'
          )}
        </button>
      </div>

      <ResultCard result={result} />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Analyze />);

