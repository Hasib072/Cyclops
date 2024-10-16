// frontend/src/components/Category.jsx

import React from 'react';
import { useDrop } from 'react-dnd';
import Stage from './Stage';
import { toast } from 'react-toastify';

const Category = ({ categoryName, stages, moveStage, onEditName, onChangeColor, onDelete, onAddStage }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'stage',
    drop: (item) => {
      moveStage(item.id, item.fromCategory, categoryName);
    },
    //canDrop: (item) => item.fromCategory !== categoryName,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  const backgroundColor = isActive
    ? 'rgba(255, 255, 255, 0.1)'
    : 'transparent';

  return (
    <div
      ref={drop}
      style={{
        marginBottom: '5px',
        padding: '5px',
        borderRadius: '8px',
        backgroundColor,
        minHeight: '100px',
      }}
    >
        <div
         style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
      <p 
      style={{
        fontWeight: 'bold',
        alignSelf: 'flex-start',
      }}
      >{categoryName}</p>
      <button
    onClick={() => onAddStage(categoryName)}
    style={{
        alignSelf: 'flex-end',
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '4px, 8px',
        borderRadius: '4px',
    }}
    className="add-category-stage-button"
    title={`Add stage to ${categoryName}`}
  >
    +
  </button>
  </div>
      {stages.map((stage, index) => (
        <Stage
          key={stage.id}
          stage={stage}
          index={index}
          onEditName={onEditName}
          onChangeColor={onChangeColor}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default Category;
