// frontend/src/components/TodoTableView.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './TodoTableView.css';
import TaskModal from './TaskModal';
import {
  useAddListToWorkspaceMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
} from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

// Import the unassigned icon SVG
import UnassignedIcon from '../assets/icons/AddPerson.svg';

const TodoTableView = ({ stages = [], lists = [], workspaceId, members = [] }) => {
  // State to manage the selected list
  const [selectedListId, setSelectedListId] = useState(null);

  // Initialize selectedListId to the first list's id
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0]._id);
    }
  }, [lists, selectedListId]);

  // RTK Query mutations
  const [addListMutation] = useAddListToWorkspaceMutation();
  const [addTaskMutation] = useAddTaskToListMutation();
  const [editTaskMutation] = useEditTaskInListMutation();
  const [deleteTaskMutation] = useDeleteTaskFromListMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Local lists state for optimistic UI updates
  const [localLists, setLocalLists] = useState(lists);

  // Update local state when lists prop changes
  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  // Handler to add a new task
  const handleAddTask = () => {
    setModalData(null);
    setIsModalOpen(true);
  };

  // Handler to edit a task
  const handleEditTask = (task) => {
    setModalData(task);
    setIsModalOpen(true);
  };

  // Handler to submit modal form
  const handleModalSubmit = async (taskData) => {
    const listId = selectedListId;

    if (modalData) {
      // Editing existing task
      try {
        await editTaskMutation({
          workspaceId,
          listId,
          taskId: modalData._id,
          updatedTask: {
            ...taskData,
          },
        }).unwrap();

        toast.success('Task updated successfully!');
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error(error.data?.message || 'Failed to update task');
      }
    } else {
      // Adding new task
      try {
        await addTaskMutation({
          workspaceId,
          listId,
          taskData: {
            ...taskData,
            _id: uuidv4(),
          },
        }).unwrap();

        toast.success('Task added successfully!');
      } catch (error) {
        console.error('Failed to add task:', error);
        toast.error(error.data?.message || 'Failed to add task');
      }
    }

    // Reset modal state
    setIsModalOpen(false);
    setModalData(null);
  };

  // Handler to delete a task
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    try {
      await deleteTaskMutation({ workspaceId, listId: selectedListId, taskId }).unwrap();
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

      // Add the new list to localLists
      setLocalLists((prevLists) => [...prevLists, newList]);
      setSelectedListId(newList._id);

      toast.success('List added successfully!');
    } catch (error) {
      console.error('Failed to add list:', error);
      toast.error(error.data?.message || 'Failed to add list');
    }
  };

  // Handler to select a list
  const handleSelectList = (listId) => {
    setSelectedListId(listId);
  };

  // Find the selected list
  const selectedList = localLists.find((list) => list._id === selectedListId) || {
    tasks: [],
  };

  // Prepare data for the table
  const tasks = selectedList.tasks;

  // Create a map for faster lookup of users by ID
  const userMap = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.user._id] = member.user;
    });
    return map;
  }, [members]);

  return (
    <div className="todo-table-view">
      {/* Tabs for lists */}
      <div className="tab-container">
        {localLists.map((list) => (
          <div
            key={list._id}
            className={`TableViewTab-item ${selectedListId === list._id ? 'active' : ''}`}
            onClick={() => handleSelectList(list._id)}
          >
            {list.name}
          </div>
        ))}
        {/* Add New List Button */}
        <div className="tab-item add-new-list" onClick={handleAddList}>
          + Add New List
        </div>
      </div>

      {/* Task Table */}
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>DESCRIPTION</th>
              <th>ASSIGNEE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>DUE DATE</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const stage = stages.find((stage) => stage.id === task.stageId);
              const assignee = userMap[task.assignee] || null;

              // Determine the profile image source with fallback
              const profileImageSrc = assignee && assignee.profileImage
                ? `http://localhost:5000/${assignee.profileImage}`
                : 'https://placehold.co/50';

              // Determine the assignee's name
              const assigneeName = assignee ? assignee.name : 'Unassigned';

              return (
                <tr key={task._id} onClick={() => handleEditTask(task)}>
                  <td>{index + 1}</td>
                  <td>
                    <span
                      className="name-icon"
                      style={{
                        backgroundColor: stage?.color || '#9fa2ff',
                      }}
                    ></span>
                    {task.name}
                  </td>
                  <td>
                    {task.description || (
                      <span className="add-description">+ Add Description</span>
                    )}
                  </td>
                  <td>
                    {assignee ? (
                      <div className="assignee-icon">
                        {/* Display assignee information */}
                        <div className="avatar-group">
                          <img
                            src={profileImageSrc}
                            alt={assigneeName}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/50';
                            }}
                          />
                          <span className="assignee-name">{assigneeName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="assign-icon">
                        <img src={UnassignedIcon} alt="Assign" />
                        <span style={{ color: 'gray' }}>&nbsp; Assign</span>
                      </div>
                    )}
                  </td>
                  <td className={`TableViewPriority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </td>
                  <td className={stage ? stage.name.toLowerCase().replace(' ', '-') : ''}>
                    {stage ? stage.name.toUpperCase() : 'N/A'}
                  </td>
                  <td>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Due'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Add Task Button */}
        <div className="add-task-container">
          <button className="add-task-button" onClick={handleAddTask}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={modalData}
          stages={stages}
          members={members}
        />
      )}
    </div>
  );
};

export default TodoTableView;
