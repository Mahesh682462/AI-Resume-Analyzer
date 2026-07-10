export default function LoadingSpinner({ message = 'Loading...', subMessage = '' }) {
  return (
    <div className="spinner-overlay" id="loading-spinner">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-text">{message}</p>
        {subMessage && <p className="spinner-subtext">{subMessage}</p>}
      </div>
    </div>
  );
}
