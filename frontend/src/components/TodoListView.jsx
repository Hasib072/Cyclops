// frontend/src/components/TodoListView.jsx

import React, { useState, useEffect } from 'react';
import './TodoListView.css'; // Import the CSS for styling
import arrowDropDown from '../assets/icons/arrow_drop_down.svg'; // Import the down arrow icon
import TaskModal from './TaskModal'; // Corrected import path
import {
  useAddListToWorkspaceMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
} from '../slices/workspaceApiSlice'; // Ensure workspaceApiSlice is correctly set up
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const TodoListView = ({ stages = [], lists = [], workspaceId }) => {
  // Sort stages based on predefined order
  const stageOrder = ['Not Started', 'Active', 'Done', 'Pending'];
  const sortedStages = [...stages].sort(
    (a, b) => stageOrder.indexOf(a.category) - stageOrder.indexOf(b.category)
  );

  // State to manage open/closed stages per list
  const [openStages, setOpenStages] = useState(() => {
    const initialState = {};
    lists.forEach((list) => {
      initialState[list._id] = {};
      sortedStages.forEach((stage) => {
        initialState[list._id][stage._id] = true; // Ensure consistent ID naming
      });
    });
    return initialState;
  });

  // RTK Query mutations
  const [addListMutation] = useAddListToWorkspaceMutation();
  const [addTaskMutation] = useAddTaskToListMutation();
  const [editTaskMutation] = useEditTaskInListMutation();
  const [deleteTaskMutation] = useDeleteTaskFromListMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentListId, setCurrentListId] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);

  // Handler to toggle stage visibility
  const toggleStage = (listId, stageId) => {
    setOpenStages((prevState) => ({
      ...prevState,
      [listId]: {
        ...prevState[listId],
        [stageId]: !prevState[listId][stageId],
      },
    }));
  };

  // Handler to add a new task
  const handleAddTask = (listId, stageId) => {
    setCurrentListId(listId);
    setCurrentStageId(stageId);
    setModalData(null); // No initial data for new task
    setIsModalOpen(true);
  };

  // Handler to edit a task
  const handleEditTask = (listId, task) => {
    setCurrentListId(listId);
    setCurrentStageId(task.stageId); // Ensure 'stageId' exists in task
    setModalData(task); // Pass existing task data
    setIsModalOpen(true);
  };

  // Handler to submit modal form
  const handleModalSubmit = async (taskData) => {
    if (modalData) {
      // Editing existing task
      try {
        const updatedTask = await editTaskMutation({
          workspaceId,
          listId: currentListId,
          taskId: modalData._id,
          updatedTask: taskData,
        }).unwrap();

        toast.success('Task updated successfully!');
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error(error.data?.message || 'Failed to update task');
      }
    } else {
      // Adding new task
      try {
        const newTask = await addTaskMutation({
          workspaceId,
          listId: currentListId,
          taskData: {
            ...taskData,
            stageId: currentStageId,
            _id: uuidv4(), // Assign unique ID if not handled by backend
          },
        }).unwrap();

        toast.success('Task added successfully!');
      } catch (error) {
        console.error('Failed to add task:', error);
        toast.error(error.data?.message || 'Failed to add task');
      }
    }

    setIsModalOpen(false);
    setModalData(null);
    setCurrentListId(null);
    setCurrentStageId(null);
  };

  // Handler to delete a task
  const handleDeleteTask = async (listId, taskId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    try {
      await deleteTaskMutation({ workspaceId, listId, taskId }).unwrap();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error(error.data?.message || 'Failed to delete task');
    }
  };

  // Handler to add a new list
  const handleAddList = async () => {
    const listName = prompt('Enter new list name:');
    if (!listName) return;

    try {
      const newList = await addListMutation({
        workspaceId,
        name: listName.trim(),
        description: '',
      }).unwrap();

      // Initialize openStages for the new list
      setOpenStages((prevState) => ({
        ...prevState,
        [newList._id]: {},
      }));
      sortedStages.forEach((stage) => {
        setOpenStages((prevState) => ({
          ...prevState,
          [newList._id]: {
            ...prevState[newList._id],
            [stage._id]: true,
          },
        }));
      });

      toast.success('List added successfully!');
    } catch (error) {
      console.error('Failed to add list:', error);
      toast.error(error.data?.message || 'Failed to add list');
    }
  };

  return (
    <div className="todo-list-view">
      {/* Add New List Button */}
      <div className="add-list-container">
        <button className="add-list-button" onClick={handleAddList}>
          + Add New List
        </button>
      </div>

      {/* Render all lists */}
      <div className="lists-container">
        {lists.map((list) => (
          <div key={list._id} className="list-container">
            {/* List Header */}
            <div className="list-header">
              <h2>{list.name}</h2>
            </div>

            {/* Stages */}
            <div className="stages-container">
              {sortedStages.map((stage) => (
                <div key={stage._id} className="stage-section">
                  {/* Stage Header */}
                  <div
                    className="stage-header"
                    onClick={() => toggleStage(list._id, stage._id)}
                    style={{
                      backgroundColor: stage.color,
                      color: '#fff', // Ensures text is readable on colored background
                    }}
                  >
                    <img
                      src={arrowDropDown}
                      alt="Toggle Arrow"
                      className={`toggle-arrow ${
                        openStages[list._id][stage._id] ? 'open' : 'closed'
                      }`}
                    />
                    <span>{stage.name}</span>
                  </div>

                  {/* Tasks under the stage */}
                  {openStages[list._id][stage._id] && (
                    <div className="tasks-container">
                      {/* Render tasks that belong to this stage */}
                      {list.tasks
                        .filter((task) => task.stageId === stage._id)
                        .map((task) => (
                          <div key={task._id} className="task-item">
                            <div className="task-details">
                              <span
                                className={`task-priority ${task.priority.toLowerCase()}`}
                              >
                                {task.priority}
                              </span>
                              <span className="task-title">{task.name}</span>
                            </div>
                            <div className="task-info">
                              <span className="task-due-date">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              {/* Assignees can be displayed here if available */}
                              {/* <div className="task-assignees">
                                {task.assignee && (
                                  <img
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    className="assignee-avatar"
                                  />
                                )}
                              </div> */}
                              {/* Edit Task Button */}
                              <button
                                className="edit-task-button"
                                onClick={() => handleEditTask(list._id, task)}
                              >
                                &#9998;
                              </button>
                              {/* Delete Task Button */}
                              <button
                                className="delete-task-button"
                                onClick={() => handleDeleteTask(list._id, task._id)}
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* Add Task Button */}
                      <button
                        className="add-task-button"
                        onClick={() => handleAddTask(list._id, stage._id)}
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={modalData}
        />
      )}
    </div>
  );
};

export default TodoListView;
