import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-icon">🎯</span>
          ResumeAI Analyzer
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} AI Resume Analyzer. Built with React & Gemini AI.
        </p>
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/upload" className="footer-link">Upload</Link>
          <Link to="/dashboard" className="footer-link">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
