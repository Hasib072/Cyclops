// frontend/src/components/CustomNode.jsx

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaCircleXmark } from "react-icons/fa6";

const CustomNode = ({ id, data, selected }) => {
  const [hover, setHover] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    data.onDelete(id);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '10px 15px',
        border: selected ? '2px solid #1890ff' : '1px solid #ddd',
        borderRadius: '10px',
        position: 'relative',
        backgroundColor: data.color, // Default color
        cursor: 'pointer',
        boxShadow: selected ? '0 0 10px rgba(24, 144, 255, 0.5)' : 'none',
        transition: 'box-shadow 0.2s ease-in-out',
        color: '#ffffff', // White text
        fontWeight: 'bold', // Bold text
        minWidth: '120px', // Ensure a minimum width for better appearance
        textAlign: 'center', // Center the text
        userSelect: 'none', // Prevent text selection
      }}
    >
      {/* Handle for incoming edges */}
      <Handle type="target" position={Position.Top} />

      {/* Node Label */}
      <div>{data.label}</div>

      {/* Delete Icon (appears on hover) */}
      {hover && (
        <FaCircleXmark
          onClick={handleDeleteClick}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '5px',
            cursor: 'pointer',
            color: '#ff4d4f', // Red color for the cross icon
            width: '20px',
            height: '20px',
            borderRadius:'50%',
            border: '1px solid white',
            backgroundColor: 'white'
          }}
          title="Delete Node"
          aria-label="Delete Node"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDeleteClick(e);
            }
          }}
        />
      )}

      {/* Handle for outgoing edges */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
