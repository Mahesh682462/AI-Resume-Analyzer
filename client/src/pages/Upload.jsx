import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import resumeService from '../services/resumeService';
import '../styles/Upload.css';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: analyze, 3: done
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setError('');
    setUploading(true);
    setStep(1);

    try {
      // Step 1: Upload
      const uploadRes = await resumeService.upload(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      const resumeId = uploadRes.data.resume.id;
      setStep(2);
      setUploading(false);

      // Step 2: Analyze
      setAnalyzing(true);
      await resumeService.analyze(resumeId);
      setStep(3);
      setAnalyzing(false);

      // Navigate to results
      navigate(`/results/${resumeId}`);
    } catch (err) {
      console.error('Upload/analyze error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <LoadingSpinner
        message="🧠 AI is analyzing your resume..."
        subMessage="This may take 15-30 seconds. Please don't close this page."
      />
    );
  }

  return (
    <div className="upload-page" id="upload-page">
      <div className="container">
        <div className="upload-header animate-fade-in">
          <h1 className="upload-title">
            Upload Your <span className="text-gradient">Resume</span>
          </h1>
          <p className="upload-subtitle">
            Upload a PDF resume and let our AI analyze it in seconds
          </p>
        </div>

        {/* Step Indicator */}
        <div className="upload-steps animate-fade-in-up">
          <div className={`upload-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="upload-step-number">{step > 1 ? '✓' : '1'}</div>
            <span className="upload-step-label">Upload PDF</span>
          </div>
          <div className="upload-step-connector"></div>
          <div className={`upload-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="upload-step-number">{step > 2 ? '✓' : '2'}</div>
            <span className="upload-step-label">AI Analysis</span>
          </div>
          <div className="upload-step-connector"></div>
          <div className={`upload-step ${step >= 3 ? 'active' : ''}`}>
            <div className="upload-step-number">3</div>
            <span className="upload-step-label">View Results</span>
          </div>
        </div>

        <div className="upload-content animate-fade-in-up stagger-2">
          <FileUpload onFileSelect={handleFileSelect} disabled={uploading} />

          {/* Upload Progress */}
          {uploading && (
            <div className="upload-progress animate-fade-in">
              <div className="upload-progress-bar-track">
                <div
                  className="upload-progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="upload-progress-text">
                <span>Uploading & extracting text...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="auth-error animate-fade-in" style={{ marginTop: '1.5rem' }}>
              {error}
            </div>
          )}

          {/* Analyze Button */}
          {selectedFile && !uploading && (
            <div className="upload-analyze-section animate-fade-in">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleUploadAndAnalyze}
                id="analyze-btn"
              >
                🚀 Upload & Analyze Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
