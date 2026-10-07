import React from 'react';
import { designSystem, keyframes } from '../styles/designSystem';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium', showClose = true }) => {
  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '800px' },
    full: { maxWidth: 'calc(100vw - 32px)', width: 'calc(100vw - 32px)' },
  };

  const modalSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.32)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: designSystem.zIndex.modal,
          padding: designSystem.spacing.md,
          animation: 'fadeIn 160ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          style={{
            background: designSystem.colors.surface,
            borderRadius: designSystem.radius.lg,
            boxShadow: designSystem.shadows.elevation64,
            width: '100%',
            ...modalSize,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'scaleIn 160ms cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid ${designSystem.colors.divider}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title Bar */}
          {(title || showClose) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
                borderBottom: `1px solid ${designSystem.colors.divider}`,
                background: designSystem.colors.surface,
                borderRadius: `${designSystem.radius.lg} ${designSystem.radius.lg} 0 0`,
              }}
            >
              {title && (
                <h3 id="modal-title" style={{ margin: 0, ...designSystem.typography.h2, color: designSystem.colors.text }}>
                  {title}
                </h3>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: designSystem.colors.textSecondary,
                    cursor: 'pointer',
                    padding: designSystem.spacing.xs,
                    borderRadius: designSystem.radius.sm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${designSystem.transitions.fast}`,
                    minWidth: '32px',
                    minHeight: '32px',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = designSystem.colors.surfaceHover; e.currentTarget.style.color = designSystem.colors.text; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = designSystem.colors.textSecondary; }}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            style={{
              padding: designSystem.spacing.lg,
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
                background: designSystem.colors.backgroundAlt,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: designSystem.spacing.sm,
                borderTop: `1px solid ${designSystem.colors.divider}`,
                borderRadius: `0 0 ${designSystem.radius.lg} ${designSystem.radius.lg}`,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;