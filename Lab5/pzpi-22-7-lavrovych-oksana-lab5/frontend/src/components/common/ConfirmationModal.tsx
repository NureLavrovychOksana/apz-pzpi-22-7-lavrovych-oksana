import React from 'react';
import './ConfirmationModal.css'; 

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onClose}>Скасувати</button>
          <button onClick={onConfirm} className="confirm-btn">Підтвердити</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;