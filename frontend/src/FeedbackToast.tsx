import React from 'react';

interface FeedbackToastProps {
  show: boolean;
  type: 'success' | 'danger';
  message: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({ show, type, message, icon, onClose }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
      <div
        className={`toast show animate__animated animate__fadeIn border-0 shadow-lg bg-${type} text-white`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ fontSize: '1.1rem', borderRadius: 12 }}
      >
        <div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
          {icon && <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}>{icon}</span>}
          <strong className="me-auto">{message}</strong>
          <button type="button" className="btn-close btn-close-white ms-2" onClick={onClose}></button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackToast;
