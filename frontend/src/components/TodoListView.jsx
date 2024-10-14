import React, { useState, useEffect } from 'react';
import './TodoListView.css';
import TaskModal from './TaskModal';
import {
  useAddListToWorkspaceMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
  useUpdateListColorMutation,
} from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const TodoListView = ({ stages = [], lists = [], workspaceId }) => {
  // Sort stages based on predefined order
  const stageOrder = ['Pending', 'Active', 'Done'];
  const sortedStages = [...stages].sort(
    (a, b) => stageOrder.indexOf(a.category) - stageOrder.indexOf(b.category)
  );

  // State to manage open/closed stages per list
  const [openStages, setOpenStages] = useState(() => {
    const initialState = {};
    lists.forEach((list) => {
      initialState[list._id] = {};
      sortedStages.forEach((stage) => {
        initialState[list._id][stage.id] = true;
      });
    });
    return initialState;
  });

  // RTK Query mutations
  const [addListMutation] = useAddListToWorkspaceMutation();
  const [addTaskMutation] = useAddTaskToListMutation();
  const [editTaskMutation] = useEditTaskInListMutation();
  const [deleteTaskMutation] = useDeleteTaskFromListMutation();
  const [updateListColor] = useUpdateListColorMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentListId, setCurrentListId] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);

  // State for local list colors
  const [listColors, setListColors] = useState({}); // Key: listId, Value: color

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
    setModalData(null);
    setIsModalOpen(true);
  };

  // Handler to edit a task
  const handleEditTask = (listId, task) => {
    setCurrentListId(listId);
    setCurrentStageId(task.stageId);
    setModalData(task);
    setIsModalOpen(true);
  };

  // Handler to submit modal form
  const handleModalSubmit = async (taskData) => {
    if (modalData) {
      // Editing existing task
      try {
        await editTaskMutation({
          workspaceId,
          listId: currentListId,
          taskId: modalData._id,
          updatedTask: {
            ...taskData,
            stageId: currentStageId,
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
          listId: currentListId,
          taskData: {
            ...taskData,
            stageId: currentStageId,
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
            [stage.id]: true,
          },
        }));
      });

      toast.success('List added successfully!');
    } catch (error) {
      console.error('Failed to add list:', error);
      toast.error(error.data?.message || 'Failed to add list');
    }
  };

  // Handler for local color change
  const handleLocalColorChange = (listId, newColor) => {
    setListColors((prevColors) => ({
      ...prevColors,
      [listId]: newColor,
    }));
  };

  // Handler for changing list color onBlur
  const handleChangeListColor = async (listId) => {
    const newColor = listColors[listId];
    if (!newColor) return; // No new color to update

    try {
      await updateListColor({
        workspaceId,
        listId,
        color: newColor,
      }).unwrap();

      toast.success('List color updated successfully!');
    } catch (error) {
      console.error('Failed to update list color:', error);
      toast.error(error.data?.message || 'Failed to update list color');
    }
    // Do not remove the color from local state here
  };

  // useEffect to clean up local colors when backend update is reflected
  useEffect(() => {
    lists.forEach((list) => {
      const localColor = listColors[list._id];
      if (localColor && list.color === localColor) {
        setListColors((prevColors) => {
          const updatedColors = { ...prevColors };
          delete updatedColors[list._id];
          return updatedColors;
        });
      }
    });
  }, [lists, listColors]);

  return (
    <div className="todo-list-view">

      {/* Render all lists */}
      {lists.map((list) => (
        <div key={list._id} className="task-list-wrapper">
          {/* List Sidebar */}
          <div
            className="list-sidebar"
            style={{ backgroundColor: listColors[list._id] || list.color || '#9fa2ff', position: 'relative' }}
          >
            <input
              type="color"
              value={listColors[list._id] || list.color}
              onChange={(e) => handleLocalColorChange(list._id, e.target.value)}
              onBlur={() => handleChangeListColor(list._id)}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                opacity: '0',
                cursor: 'pointer',
              }}
              title="Select List Color"
            />
          </div>

          {/* Task List Content */}
          <div className="task-list-content">
            {/* List Header */}
            <div className="task-list-header">
              <h2>
                {list.name}
                <span className="icons">
                  {/* Icons can be added here */}
                </span>
              </h2>
            </div>
            <p>{list.description}</p>

            {/* Stages */}
            {sortedStages.map((stage) => (
              <div key={stage.id}>
                {/* Stage Header */}
                <div
                  className="svg-button-wrapper"
                  onClick={() => toggleStage(list._id, stage.id)}
                >
                  {/* Toggle Arrow */}
                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 27 27"
                    fill="none"
                    className={`toggle-arrow ${
                      openStages[list._id][stage.id] ? 'rotate-open' : 'rotate-closed'
                    }`}
                  >
                    <g clipPath="url(#clip0_202_634)">
                      <path
                        d="M9.79887 13.1738L12.7126 16.0875C13.1514 16.5263 13.8601 16.5263 14.2989 16.0875L17.2126 13.1738C17.9214 12.465 17.4151 11.25 16.4139 11.25H10.5864C9.58512 11.25 9.09012 12.465 9.79887 13.1738Z"
                        fill="#A5A5A5"
                      />
                    </g>
                  </svg>
                  <div
                    className="task-status-header"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.name.toUpperCase()}
                  </div>

                </div>

                {/* Tasks under the stage */}
                {openStages[list._id][stage.id] && (
                  <>
                    {/* Task Headings */}
                    <div className="task_headingg">
                      <div className="task-heading-1">Name</div>
                      <div className="task-heading-2">Priority</div>
                      <div className="task-heading-3">&nbsp;Due Date</div>
                      <div className="task-heading-4">Assignee</div>
                    </div>

                    {/* Task Items */}
                    <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
                      {list.tasks
                        .filter((task) => task.stageId === stage.id)
                        .map((task) => (
                          <li key={task._id} className="task-item">
                            <div className="task-container">
                              <div className="task-info">
                                {/* Task Indicator */}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="6" cy="6" r="6" fill={stage.color} />
                                </svg>
                                <div className="task-name">{task.name}</div>
                              </div>
                            </div>
                            <div
                              className={`task-priority ${task.priority.toLowerCase()}-priority`}
                            >
                              {task.priority.toUpperCase()}
                            </div>
                            <div className="task-due-date">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="task-assignee">
                              {/* Assignee information */}
                              <div className="avatar-group">
                                <img
                                  src="https://via.placeholder.com/30"
                                  alt="Assignee"
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            ))}

            {/* Add Task Button */}
            <div
              className="add-task"
              onClick={() => handleAddTask(list._id, sortedStages[0].id)}
            >
              + Add Task
            </div>
          </div>
        </div>
      ))}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={modalData}
        />
      )}

      {/* Add New List Button */}
      <div className="add-new-list" onClick={handleAddList}>
        + Add New List
      </div>
    </div>
  );
};

export default TodoListView;
