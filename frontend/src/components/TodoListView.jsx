// frontend/src/components/TodoListView.jsx

import React, { useState } from 'react';
import './TodoListView.css'; // Import the CSS for the component
import OpenedIcon from '../assets/icons/arrow_drop_down.svg'; // Import down arrow icon
import InProgressIcon from '../assets/icons/arrow_drop_down.svg'; // Reuse the same icon
import ReviewIcon from '../assets/icons/arrow_drop_down.svg'; // Reuse the same icon

const TodoListView = ({ stages, lists }) => {
  // State to manage lists
  const [currentLists, setCurrentLists] = useState(lists || []);

  // Handler to add a new list
  const addNewList = () => {
    const newList = {
      id: Date.now(),
      name: `My List ${currentLists.length + 1}`,
      tasks: [],
    };
    setCurrentLists([...currentLists, newList]);
  };

  // Handler to toggle stages in a list
  const toggleStages = (listId, stageId) => {
    setCurrentLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            stages: list.stages.map((stage) =>
              stage.id === stageId
                ? { ...stage, isOpen: !stage.isOpen }
                : stage
            ),
          };
        }
        return list;
      })
    );
  };

  return (
    <div className="todo-list-view">
      {currentLists.map((list) => (
        <div key={list.id} className="list-container">
          {/* List Sidebar */}
          <div className="listsidebar" style={{ backgroundColor: '#9fa2ff' }}></div>

          {/* List Content */}
          <div className="list-content">
            {/* List Header */}
            <div className="list-header">
              <h2>{list.name}</h2>
            </div>

            {/* Stages */}
            <div className="stages-container">
              {stages.map((stage) => (
                <div key={stage.id} className="stage-section">
                  {/* Stage Header */}
                  <div className="stage-header" onClick={() => toggleStages(list.id, stage.id)}>
                    <img
                      src={OpenedIcon}
                      alt="Toggle Arrow"
                      className={`toggle-arrow ${stage.isOpen ? 'open' : 'closed'}`}
                    />
                    <span>{stage.name}</span>
                  </div>

                  {/* Tasks under the stage */}
                  {stage.isOpen && (
                    <div className="tasks-container">
                      {/* Render tasks that belong to this stage */}
                      {list.tasks
                        .filter((task) => task.stageId === stage.id)
                        .map((task) => (
                          <div key={task.id} className="task-item">
                            <div className="task-details">
                              <span className={`task-priority ${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                              <span className="task-title">{task.title}</span>
                            </div>
                            <div className="task-info">
                              <span className="task-due-date">{task.dueDate}</span>
                              <div className="task-assignees">
                                {task.assignees.map((avatar, index) => (
                                  <img key={index} src={avatar} alt={`Assignee ${index + 1}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* Add Task Button */}
                      <button className="add-task-button">+ Add Task</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New List Button */}
            <button className="add-new-list-button" onClick={addNewList}>
              + Add New List
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoListView;
