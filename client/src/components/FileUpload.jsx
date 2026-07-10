import { useRef, useState } from 'react';
import { formatFileSize } from '../utils/helpers';

export default function FileUpload({ onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSelect(file);
  };

  const validateAndSelect = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (onFileSelect) onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="file-upload-component">
      <div
        className={`file-upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        id="file-upload-zone"
      >
        <div className="file-upload-icon">📄</div>
        <h3 className="file-upload-title">
          {dragOver ? 'Drop your resume here!' : 'Drag & drop your resume'}
        </h3>
        <p className="file-upload-subtitle">or click to browse files</p>
        <div className="file-upload-btn">
          📎 Select PDF File
        </div>
        <p className="file-upload-info">
          Supports PDF files up to 10MB
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          id="file-input"
        />
      </div>

      {selectedFile && (
        <div className="file-selected animate-fade-in" id="file-selected">
          <span className="file-selected-icon">✅</span>
          <div className="file-selected-info">
            <div className="file-selected-name">{selectedFile.name}</div>
            <div className="file-selected-size">{formatFileSize(selectedFile.size)}</div>
          </div>
          <button
            className="file-selected-remove"
            onClick={(e) => { e.stopPropagation(); removeFile(); }}
            id="file-remove-btn"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
}
