import { useEffect, useState } from 'react';
import { getScoreColor } from '../utils/helpers';

export default function ScoreGauge({ score = 0, size = 160, label = 'ATS Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(animatedScore);

  useEffect(() => {
    // Animate score from 0 to target
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="score-gauge" id="score-gauge">
      <svg width={size} height={size}>
        <circle
          className="score-gauge-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="score-gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="score-gauge-value">
        <span className="score-gauge-number" style={{ color }}>
          {animatedScore}
        </span>
        <span className="score-gauge-label">{label}</span>
      </div>
    </div>
  );
}
