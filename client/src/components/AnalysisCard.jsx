import { useState } from 'react';

export default function AnalysisCard({ icon, title, count, color, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="analysis-card animate-fade-in-up">
      <div
        className="analysis-card-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="analysis-card-header-left">
          <div
            className="analysis-card-icon"
            style={{ background: `${color}15`, color }}
          >
            {icon}
          </div>
          <div>
            <div className="analysis-card-title">{title}</div>
            {count !== undefined && (
              <div className="analysis-card-count">{count} items found</div>
            )}
          </div>
        </div>
        <span className={`analysis-card-toggle ${isOpen ? 'open' : ''}`}>
          ▾
        </span>
      </div>
      <div className={`analysis-card-body ${isOpen ? '' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  );
}
