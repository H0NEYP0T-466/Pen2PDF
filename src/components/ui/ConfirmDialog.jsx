import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

function ConfirmDialog({ 
  open, 
  title = 'Confirm', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel 
}) {
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onConfirm?.();
      } else if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll('button');
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div 
        className="dialog-content" 
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h3 id="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button 
            ref={cancelBtnRef}
            className="btn outline" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            ref={confirmBtnRef}
            className="btn primary" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
