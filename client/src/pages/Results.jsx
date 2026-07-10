import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreGauge from '../components/ScoreGauge';
import AnalysisCard from '../components/AnalysisCard';
import LoadingSpinner from '../components/LoadingSpinner';
import resumeService from '../services/resumeService';
import { formatDate, formatFileSize, getScoreLabel } from '../utils/helpers';
import '../styles/Results.css';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const res = await resumeService.getAnalysis(id);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await resumeService.reanalyze(id);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError('Re-analysis failed. Please try again.');
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading analysis results..." />;
  if (reanalyzing) return <LoadingSpinner message="🧠 Re-analyzing your resume..." subMessage="This may take 15-30 seconds." />;

  if (error) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="empty-state" style={{ marginTop: '120px' }}>
            <div className="empty-state-icon">⚠️</div>
            <h3 className="empty-state-title">{error}</h3>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const a = analysis;

  return (
    <div className="results-page" id="results-page">
      <div className="container">
        {/* Header */}
        <div className="results-header animate-fade-in">
          <button className="results-back" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className="results-title">{a.original_name || 'Resume Analysis'}</h1>
          <div className="results-meta">
            <span className="results-meta-item">📅 {formatDate(a.upload_date)}</span>
            {a.file_size && <span className="results-meta-item">📎 {formatFileSize(a.file_size)}</span>}
            <span className="results-meta-item">🤖 {a.ai_model || 'Gemini AI'}</span>
            {a.processing_time_ms && <span className="results-meta-item">⚡ {(a.processing_time_ms / 1000).toFixed(1)}s</span>}
          </div>
        </div>

        {/* Score + Summary Row */}
        <div className="results-summary-row animate-fade-in-up">
          <div className="results-score-card">
            <div className="results-score-title">ATS Score</div>
            <ScoreGauge score={a.ats_score} size={180} />
            <div className="results-score-feedback">{getScoreLabel(a.ats_score)}</div>
          </div>
          <div className="results-summary-card">
            <h3 className="results-summary-title">📋 Resume Summary</h3>
            <p className="results-summary-text">{a.summary}</p>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="results-grid">
          {/* Technical Skills */}
          {a.technical_skills?.length > 0 && (
            <AnalysisCard icon="💻" title="Technical Skills" count={a.technical_skills.length} color="#4f8fff" defaultOpen={true}>
              <div className="skills-grid">
                {a.technical_skills.map((skill, i) => (
                  <span key={i} className="skill-tag technical" title={`${skill.proficiency} • ${skill.category || ''}`}>
                    {skill.skill}
                    {skill.proficiency && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}> • {skill.proficiency}</span>}
                  </span>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Soft Skills */}
          {a.soft_skills?.length > 0 && (
            <AnalysisCard icon="🤝" title="Soft Skills" count={a.soft_skills.length} color="#a855f7">
              <div className="skills-grid">
                {a.soft_skills.map((skill, i) => (
                  <span key={i} className="skill-tag soft" title={skill.evidence}>
                    {skill.skill}
                  </span>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Missing Skills */}
          {a.missing_skills?.length > 0 && (
            <AnalysisCard icon="⚠️" title="Missing Skills" count={a.missing_skills.length} color="#ef4444">
              <div className="analysis-list">
                {a.missing_skills.map((skill, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">❌</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">
                        {skill.skill}
                        <span className={`badge badge-${(skill.importance || '').toLowerCase()}`} style={{ marginLeft: '0.5rem' }}>
                          {skill.importance}
                        </span>
                      </div>
                      <div className="analysis-list-secondary">{skill.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Strengths */}
          {a.strengths?.length > 0 && (
            <AnalysisCard icon="💪" title="Strengths" count={a.strengths.length} color="#10b981">
              <div className="analysis-list">
                {a.strengths.map((item, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">✅</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">{item.point}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Weaknesses */}
          {a.weaknesses?.length > 0 && (
            <AnalysisCard icon="📉" title="Weaknesses" count={a.weaknesses.length} color="#f59e0b">
              <div className="analysis-list">
                {a.weaknesses.map((item, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">⚡</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">{item.point}</div>
                      <div className="analysis-list-secondary">💡 {item.suggestion}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Improvements */}
          {a.improvements?.length > 0 && (
            <AnalysisCard icon="🚀" title="Improvements" count={a.improvements.length} color="#06b6d4">
              <div className="analysis-list">
                {a.improvements.map((item, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">📌</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">
                        {item.area}
                        <span className={`badge badge-${(item.priority || '').toLowerCase()}`} style={{ marginLeft: '0.5rem' }}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="analysis-list-secondary">{item.recommended}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Suggested Roles */}
          {a.suggested_roles?.length > 0 && (
            <AnalysisCard icon="🎯" title="Suggested Job Roles" count={a.suggested_roles.length} color="#4f8fff">
              <div className="analysis-list">
                {a.suggested_roles.map((role, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">🏢</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">
                        {role.role}
                        <span style={{ color: '#10b981', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                          {role.match_percentage}% match
                        </span>
                      </div>
                      <div className="analysis-list-secondary">{role.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Keyword Analysis */}
          {a.keyword_analysis && (
            <AnalysisCard icon="🔑" title="Keyword Analysis" color="#00d4ff">
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Keywords: </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.keyword_analysis.total_keywords || 0}</span>
              </div>
              {a.keyword_analysis.strong_keywords?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Strong Keywords:</div>
                  <div className="skills-grid">
                    {a.keyword_analysis.strong_keywords.map((kw, i) => (
                      <span key={i} className="skill-tag keyword">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {a.keyword_analysis.action_verbs?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Action Verbs:</div>
                  <div className="skills-grid">
                    {a.keyword_analysis.action_verbs.map((verb, i) => (
                      <span key={i} className="skill-tag technical">{verb}</span>
                    ))}
                  </div>
                </div>
              )}
              {a.keyword_analysis.weak_areas?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Weak Areas:</div>
                  <div className="skills-grid">
                    {a.keyword_analysis.weak_areas.map((area, i) => (
                      <span key={i} className="skill-tag missing">{area}</span>
                    ))}
                  </div>
                </div>
              )}
            </AnalysisCard>
          )}

          {/* Experience */}
          {a.experience?.length > 0 && (
            <AnalysisCard icon="💼" title="Experience" count={a.experience.length} color="#f59e0b">
              <div className="timeline">
                {a.experience.map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-title">{exp.role}</div>
                    <div className="timeline-subtitle">{exp.company}</div>
                    <div className="timeline-duration">{exp.duration}</div>
                    {exp.highlights?.length > 0 && (
                      <div className="timeline-highlights">
                        {exp.highlights.map((h, j) => (
                          <div key={j} className="timeline-highlight">{h}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Education */}
          {a.education?.length > 0 && (
            <AnalysisCard icon="🎓" title="Education" count={a.education.length} color="#a855f7">
              <div className="timeline">
                {a.education.map((edu, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-title">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                    <div className="timeline-subtitle">{edu.institution}</div>
                    <div className="timeline-duration">
                      {edu.year}{edu.gpa && ` • GPA: ${edu.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Projects */}
          {a.projects?.length > 0 && (
            <AnalysisCard icon="🛠️" title="Projects" count={a.projects.length} color="#06b6d4">
              <div className="analysis-list">
                {a.projects.map((proj, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">📂</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">{proj.name}</div>
                      <div className="analysis-list-secondary">{proj.description}</div>
                      {proj.technologies?.length > 0 && (
                        <div className="skills-grid" style={{ marginTop: '0.5rem' }}>
                          {proj.technologies.map((tech, j) => (
                            <span key={j} className="skill-tag technical" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {/* Certifications */}
          {a.certifications?.length > 0 && (
            <AnalysisCard icon="🏆" title="Certifications" count={a.certifications.length} color="#10b981">
              <div className="analysis-list">
                {a.certifications.map((cert, i) => (
                  <div key={i} className="analysis-list-item">
                    <span className="analysis-list-bullet">🏅</span>
                    <div className="analysis-list-content">
                      <div className="analysis-list-primary">{cert.name}</div>
                      <div className="analysis-list-secondary">
                        {cert.issuer}{cert.year && ` • ${cert.year}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          )}
        </div>

        {/* Actions */}
        <div className="results-actions animate-fade-in-up">
          <button className="btn btn-secondary" onClick={handleReanalyze} id="reanalyze-btn">
            🔄 Re-Analyze
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/upload')} id="upload-new-btn">
            📄 Upload New Resume
          </button>
        </div>
      </div>
    </div>
  );
}
