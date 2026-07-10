import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import resumeService from '../services/resumeService';
import { formatDate, getScoreColor } from '../utils/helpers';
import '../styles/History.css';

export default function History() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await resumeService.getAll(1, 50);
      setResumes(res.data.resumes);
    } catch (error) {
      console.error('History load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume and its analysis?')) return;

    try {
      await resumeService.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete resume.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading history..." />;

  return (
    <div className="history-page" id="history-page">
      <div className="container">
        <div className="history-header animate-fade-in">
          <div>
            <h1 className="history-title">📋 Analysis History</h1>
            <p className="history-count">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/upload')} id="history-upload">
            📄 Upload New
          </button>
        </div>

        {resumes.length > 0 ? (
          <div className="history-list">
            {resumes.map((resume, index) => (
              <div
                key={resume.id}
                className="history-item animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  if (resume.ats_score) navigate(`/results/${resume.id}`);
                }}
              >
                <div className="history-item-icon">📄</div>
                <div className="history-item-info">
                  <div className="history-item-name">{resume.original_name}</div>
                  <div className="history-item-date">{formatDate(resume.upload_date)}</div>
                </div>
                <div className="history-item-score">
                  {resume.ats_score ? (
                    <>
                      <div className="history-item-score-value" style={{ color: getScoreColor(resume.ats_score) }}>
                        {resume.ats_score}
                      </div>
                      <div className="history-item-score-label">ATS</div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                  )}
                </div>
                <div className="history-item-status">
                  <span className={`status-badge ${resume.status}`}>
                    {resume.status === 'analyzed' && '✅ '}
                    {resume.status === 'processing' && '⏳ '}
                    {resume.status === 'failed' && '❌ '}
                    {resume.status === 'uploaded' && '📤 '}
                    {resume.status}
                  </span>
                </div>
                <div className="history-item-actions">
                  {resume.ats_score && (
                    <button
                      className="history-action-btn history-action-view"
                      onClick={(e) => { e.stopPropagation(); navigate(`/results/${resume.id}`); }}
                    >
                      View
                    </button>
                  )}
                  <button
                    className="history-action-btn history-action-delete"
                    onClick={(e) => handleDelete(e, resume.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" id="empty-history">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No history yet</h3>
            <p className="empty-state-desc">
              Upload your first resume to start building your analysis history.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              📄 Upload Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
