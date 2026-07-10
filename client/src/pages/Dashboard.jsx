import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import resumeService from '../services/resumeService';
import { formatDate, getScoreColor } from '../utils/helpers';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_resumes: 0, total_analyses: 0, avg_ats_score: 0 });
  const [recentResumes, setRecentResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, resumesRes] = await Promise.all([
        authService.getMe(),
        resumeService.getAll(1, 5)
      ]);
      setStats(profileRes.data.stats);
      setRecentResumes(resumesRes.data.resumes);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <h1 className="dashboard-welcome">
            Welcome back, <span className="text-gradient">{user?.name || 'User'}</span> 👋
          </h1>
          <p className="dashboard-welcome-sub">
            Here's an overview of your resume analysis activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card animate-fade-in-up stagger-1">
            <div className="stat-icon" style={{ background: 'rgba(79, 143, 255, 0.1)', color: '#4f8fff' }}>
              📄
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_resumes}</div>
              <div className="stat-label">Resumes Uploaded</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in-up stagger-2">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              🔍
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_analyses}</div>
              <div className="stat-label">Analyses Completed</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in-up stagger-3">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              📊
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: getScoreColor(stats.avg_ats_score) }}>
                {stats.avg_ats_score || '—'}
              </div>
              <div className="stat-label">Avg ATS Score</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-actions animate-fade-in-up stagger-3">
          <Link to="/upload" className="btn btn-primary" id="dash-upload">
            📄 Upload New Resume
          </Link>
          <Link to="/history" className="btn btn-secondary" id="dash-history">
            📋 View All History
          </Link>
        </div>

        {/* Recent Analyses */}
        <div className="animate-fade-in-up stagger-4">
          <h2 className="dashboard-section-title">📋 Recent Resumes</h2>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p className="empty-state-desc" style={{ marginTop: '1rem' }}>Loading...</p>
            </div>
          ) : recentResumes.length > 0 ? (
            <div className="recent-analyses-list">
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="recent-item"
                  onClick={() => {
                    if (resume.ats_score) {
                      navigate(`/results/${resume.id}`);
                    } else {
                      navigate('/upload');
                    }
                  }}
                >
                  <div className="recent-item-icon">📄</div>
                  <div className="recent-item-info">
                    <div className="recent-item-name">{resume.original_name}</div>
                    <div className="recent-item-date">{formatDate(resume.upload_date)}</div>
                  </div>
                  {resume.ats_score ? (
                    <div
                      className="recent-item-score"
                      style={{ color: getScoreColor(resume.ats_score) }}
                    >
                      {resume.ats_score}
                    </div>
                  ) : (
                    <span className="status-badge uploaded">Pending</span>
                  )}
                  <span className="recent-item-arrow">→</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" id="empty-dashboard">
              <div className="empty-state-icon">📄</div>
              <h3 className="empty-state-title">No resumes yet</h3>
              <p className="empty-state-desc">
                Upload your first resume to get started with AI-powered analysis.
              </p>
              <Link to="/upload" className="btn btn-primary">
                📄 Upload Your First Resume
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
