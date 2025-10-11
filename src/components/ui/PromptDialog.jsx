import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PromptDialog.css';

function PromptDialog({
  open,
  title = 'Enter Value',
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const messageIdRef = useRef(`prompt-message-${Math.random().toString(36).slice(2)}`);
  const inputIdRef = useRef(`prompt-input-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open, defaultValue]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
  }, [value, onConfirm]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll('input, button');
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
  }, [open, handleConfirm, onCancel]);

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
        aria-describedby={
          message ? messageIdRef.current : inputIdRef.current
        }
      >
        <h3 id="dialog-title">{title}</h3>
        {message && (
          <p id={messageIdRef.current} className="dialog-message">
            {message}
          </p>
        )}
        <input
          id={inputIdRef.current}
          ref={inputRef}
          type="text"
          className="dialog-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder || title}
        />
        <div className="dialog-actions">
          <button
            className="btn outline"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="btn primary"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptDialog;