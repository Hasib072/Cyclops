// frontend/src/components/NodeDetailsModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './NodeDetailsModal.css'; // Ensure you have appropriate styling

const NodeDetailsModal = ({ node, onClose, onSave }) => {
  const [label, setLabel] = useState(node.data.label || '');
  const [background, setBackground] = useState(node.style?.background || '#737373');

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: { ...node.data, label },
      style: { ...node.style, background },
    };
    onSave(updatedNode);
  };

  return (
    <div className="modal-overlay">
      <div className="node-modal-content" style={styles.modalContent}>
        <h2>Node Details</h2>
        <div className="form-group">
          <label htmlFor="node-label">Label:</label>
          <input
            id="node-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node label"
          />
        </div>
        <div className="form-group">
          <label htmlFor="node-background">Background Color:</label>
          <input
            style={styles.colorInput}
            id="node-background"
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} style={styles.saveButton}>
            Save
          </button>
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalContent:{
    backgroundColor: '#121212',
  },
  colorInput:{
    height: '50px',
  },
};

NodeDetailsModal.propTypes = {
  node: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NodeDetailsModal;
