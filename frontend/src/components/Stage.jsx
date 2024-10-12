// frontend/src/components/Stage.jsx

import React from 'react';
import { useDrag } from 'react-dnd';
import EditableText from './EditableText';

const Stage = ({ stage, index, onEditName, onChangeColor, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'stage',
    item: { id: stage.id, fromCategory: stage.category },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // If the item was not dropped on a valid target, delete it
        onDelete(stage.id);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div
      ref={drag}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0px 8px',
        border: `2px solid ${stage.color}`, // Border reflects the selected color
        borderRadius: '8px',
        marginBottom: '8px',
        backgroundColor: 'transparent',
        opacity,
        cursor: 'move',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {/* SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          style={{ marginRight: '8px' }}
        >
          <path
            d="M4 18H20C20.55 18 21 17.55 21 17C21 16.45 20.55 16 20 16H4C3.45 16 3 16.45 3 17C3 17.55 3.45 18 4 18ZM4 13H20C20.55 13 21 12.55 21 12C21 11.45 20.55 11 20 11H4C3.45 11 3 11.45 3 12C3 12.55 3.45 13 4 13ZM3 7C3 7.55 3.45 8 4 8H20C20.55 8 21 7.55 21 7C21 6.45 20.55 6 20 6H4C3.45 6 3 6.45 3 7Z"
            fill="white"
          />
        </svg>
        {/* Editable Stage Name */}
        <EditableText text={stage.name} onChange={(newName) => onEditName(stage.id, newName)} />
      </span>
      {/* Color Picker as a Circle */}
      <input
        type="color"
        value={stage.color}
        onChange={(e) => onChangeColor(stage.id, e.target.value)}
        style={{
          width: '15px',
          height: '15px',
          borderRadius: '50%', // Make it a circle
          border: 'none',
          padding: '0',
          cursor: 'pointer',
        }}
        title="Select Stage Color"
      />
    </div>
  );
};

export default Stage;
