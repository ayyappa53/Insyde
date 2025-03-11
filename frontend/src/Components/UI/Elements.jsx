import React from 'react';

export const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

export const Button = ({ children, onClick, className, disabled }) => {
  return (
    <button 
      className={`ui-button ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Tooltip = ({ children, title }) => {
  return (
    <div className="tooltip-container">
      {children}
      <span className="tooltip-text">{title}</span>
    </div>
  );
};