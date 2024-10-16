// frontend/src/components/EditableText.jsx

import React, { useState } from 'react';

const EditableText = ({ text, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentText.trim() === '') {
      setCurrentText(text); // Revert to original text if input is empty
    } else {
      onChange(currentText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentText(text);
    }
  };

  return (
    isEditing ? (
      <input
        type="text"
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: '1px solid #fff',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          outline: 'none',
          width: '100%',
        }}
      />
    ) : (
      <span
        onClick={() => setIsEditing(true)}
        style={{ cursor: 'pointer', flex: 1 }}
      >
        {text}
      </span>
    )
  );
};

export default EditableText;
