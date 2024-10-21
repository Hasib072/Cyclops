// frontend/src/components/NodeDetailsModal.jsx

import React, { useState } from 'react';
import './NodeDetailsModal.css'; // Create and style this CSS file

const NodeDetailsModal = ({ node, onClose, onSave }) => {
  const [label, setLabel] = useState(node.data.label);
  const [color, setColor] = useState(node.style.background);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...node, data: { label }, style: { background: color } });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Node</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Label:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default NodeDetailsModal;
