import React, { useEffect } from 'react';
import './SuccessNotification.css';

function SuccessNotification({ open, message, duration = 1000, onClose }) {
  useEffect(() => {
    if (open && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <p className="success-message">{message}</p>
      </div>
    </div>
  );
}

export default SuccessNotification;
