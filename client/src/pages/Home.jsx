import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const features = [
  { icon: '📊', title: 'ATS Score Analysis', desc: 'Get a precise ATS compatibility score with detailed breakdown of how well your resume performs against applicant tracking systems.', color: '#4f8fff' },
  { icon: '💡', title: 'Smart Skill Detection', desc: 'AI identifies your technical and soft skills, highlights missing ones, and suggests improvements for your target role.', color: '#a855f7' },
  { icon: '🎯', title: 'Job Role Matching', desc: 'Discover the best-fit job roles based on your experience, skills, and qualifications with match percentages.', color: '#10b981' },
  { icon: '📝', title: 'Experience Analysis', desc: 'Detailed parsing of your work history, projects, and achievements with actionable feedback on presentation.', color: '#f59e0b' },
  { icon: '🔑', title: 'Keyword Optimization', desc: 'Comprehensive keyword analysis revealing strong areas and gaps to help your resume pass automated filters.', color: '#00d4ff' },
  { icon: '🎓', title: 'Education & Certs', desc: 'Analyzes your education background and certifications, assessing their relevance and impact on your profile.', color: '#ef4444' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page" id="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Powered by Google Gemini AI
            </div>
            <h1 className="hero-title">
              Analyze Your Resume<br />
              <span className="text-gradient">with AI Precision</span>
            </h1>
            <p className="hero-description">
              Upload your resume and get instant AI-powered analysis including ATS scoring,
              skill detection, job matching, and actionable improvements — all in seconds.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/upload" className="btn btn-primary btn-lg" id="hero-cta">
                  📄 Upload Resume
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta">
                    🚀 Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">15+</div>
                <div className="hero-stat-label">Analysis Points</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">AI</div>
                <div className="hero-stat-label">Powered by Gemini</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">30s</div>
                <div className="hero-stat-label">Avg Analysis Time</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-visual">
            <div className="hero-visual-card">
              <div className="hero-visual-header">
                <div className="hero-visual-avatar">👤</div>
                <div>
                  <div className="hero-visual-name">John Doe</div>
                  <div className="hero-visual-role">Full Stack Developer</div>
                </div>
              </div>
              <div className="hero-visual-score">
                <div className="hero-visual-score-value">87</div>
                <div className="hero-visual-score-label">ATS Score</div>
              </div>
              <div className="hero-visual-skills">
                <span className="skill-tag technical">React</span>
                <span className="skill-tag technical">Node.js</span>
                <span className="skill-tag technical">Python</span>
                <span className="skill-tag soft">Leadership</span>
                <span className="skill-tag keyword">AWS</span>
                <span className="skill-tag technical">SQL</span>
              </div>
            </div>
            <div className="hero-visual-glow"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">
            Everything You Need to <span className="text-gradient">Perfect Your Resume</span>
          </h2>
          <p className="section-description">
            Our AI analyzes every aspect of your resume and provides comprehensive,
            actionable feedback to help you land your dream job.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="feature-icon"
                style={{ background: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to <span className="text-gradient">Level Up</span> Your Resume?
          </h2>
          <p className="cta-desc">
            Join thousands of professionals using AI to optimize their resumes and land interviews faster.
          </p>
          {isAuthenticated ? (
            <Link to="/upload" className="btn btn-primary btn-lg">
              📄 Upload Your Resume Now
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">
              🚀 Start Analyzing for Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
