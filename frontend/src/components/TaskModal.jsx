// frontend/src/components/TaskModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './TaskModal.css'; // Ensure correct CSS file name

Modal.setAppElement('#root'); // Set the app element for accessibility

const TaskModal = ({ isOpen, onRequestClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPriority(initialData.priority);
      setDueDate(new Date(initialData.dueDate).toISOString().split('T')[0]);
    } else {
      setName('');
      setDescription('');
      setPriority('Low');
      setDueDate('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dueDate) {
      alert('Please fill in all required fields.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      priority,
      dueDate: new Date(dueDate),
      // Add other fields as necessary
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={initialData ? 'Edit Task' : 'Add Task'}
      className="task-modal"
      overlayClassName="task-modal-overlay"
    >
      <h2>{initialData ? 'Edit Task' : 'Add Task'}</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task-name">Name *</label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="task-priority">Priority *</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="task-due-date">Due Date *</label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        {/* Add other fields like assignee if necessary */}
        <div className="form-actions">
          <button type="submit" className="submit-button">
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
          <button type="button" className="cancel-button" onClick={onRequestClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
