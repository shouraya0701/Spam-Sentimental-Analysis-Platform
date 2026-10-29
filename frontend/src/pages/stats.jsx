import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { requireAuth } from '../lib/auth.js';
import { renderNavbar } from '../lib/navbar.js';
import { apiFetch } from '../lib/api.js';

// Enforce auth & render navbar
if (requireAuth()) {
  renderNavbar();
}

const SPAM_COLORS = ['#ff3b5c', '#ccff00']; // Spam (neon red), Ham (neon lime)
const SENTIMENT_COLORS = ['#ccff00', '#ff3b5c']; // Positive (neon lime), Negative (neon red)

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/stats');
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <div className="card">
          <div className="state-box">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="card">
          <div className="alert alert-error">{error}</div>
        </div>
      </main>
    );
  }

  if (!stats || stats.total_analyses === 0) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="card-title">Analytics & Insights</h1>
          <p className="card-subtitle">Aggregated metrics of your text checks</p>
          <div className="state-box">
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No data to display yet.</p>
            <p>
              Analyze your first text on the <a href="/index.html">Analyze page</a> to view charts and statistics.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Data for charts
  const spamData = [
    { name: 'Spam', value: stats.spam_count },
    { name: 'Ham', value: stats.ham_count },
  ].filter((d) => d.value > 0);

  const sentimentData = [
    { name: 'Positive', value: stats.positive_count },
    { name: 'Negative', value: stats.negative_count },
  ].filter((d) => d.value > 0);

  // Format daily counts dates (e.g. "Oct 29")
  const dailyData = (stats.daily_counts || []).map((item) => {
    const parts = item.date.split('-');
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.date;
    return {
      date: label,
      fullDate: item.date,
      Analyses: item.count,
    };
  });

  return (
    <main className="container">
      <div className="card">
        <h1 className="card-title">Analytics & Insights</h1>
        <p className="card-subtitle">Aggregated metrics of your personal text checks</p>

        {/* 5 Summary Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-num">{stats.total_analyses}</div>
            <div className="stat-label">Total Checks</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ff3b5c' }}>{stats.spam_count}</div>
            <div className="stat-label">Spam</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ccff00' }}>{stats.ham_count}</div>
            <div className="stat-label">Ham</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ccff00' }}>{stats.positive_count}</div>
            <div className="stat-label">Positive</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#ff3b5c' }}>{stats.negative_count}</div>
            <div className="stat-label">Negative</div>
          </div>
        </div>

        {/* 2 Pie Charts Grid */}
        <div className="charts-grid">
          {/* Spam vs Ham Pie */}
          <div className="chart-card">
            <div className="chart-title">Spam vs Ham Breakdown</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spamData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {spamData.map((entry, index) => (
                      <Cell
                        key={`cell-spam-${index}`}
                        fill={entry.name === 'Spam' ? SPAM_COLORS[0] : SPAM_COLORS[1]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Positive vs Negative Pie */}
          <div className="chart-card">
            <div className="chart-title">Sentiment Distribution</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell
                        key={`cell-sent-${index}`}
                        fill={entry.name === 'Positive' ? SENTIMENT_COLORS[0] : SENTIMENT_COLORS[1]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Activity Bar Chart */}
          <div className="chart-card chart-card-full">
            <div className="chart-title">Analyses per Day (Last 7 Days)</div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="Analyses" fill="#ccff00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Stats />);

