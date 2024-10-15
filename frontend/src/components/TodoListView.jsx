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
import { SketchPicker } from 'react-color';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  TASK: 'task',
};

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

  // State for color picker
  const [colorPicker, setColorPicker] = useState({
    isOpen: false,
    listId: null,
    position: { x: 0, y: 0 },
  });

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

  // Handler to show color picker
  const handleShowColorPicker = (e, listId) => {
    e.stopPropagation(); // Prevent event bubbling

    // Get mouse position
    const posX = e.clientX;
    const posY = e.clientY;

    setColorPicker({
      isOpen: true,
      listId,
      position: { x: posX, y: posY },
    });
  };

  // Handler to hide color picker
  const handleHideColorPicker = async () => {
    const { listId } = colorPicker;
    const newColor = listColors[listId];

    if (newColor) {
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
    }

    // Hide the color picker
    setColorPicker({
      isOpen: false,
      listId: null,
      position: { x: 0, y: 0 },
    });
  };

  // Handler for color change
  const handleColorChange = (color) => {
    const { listId } = colorPicker;
    const newColor = color.hex;

    // Update local color
    setListColors((prevColors) => ({
      ...prevColors,
      [listId]: newColor,
    }));
  };

  // Handler for color change complete (when user selects a color)
  const handleColorChangeComplete = (color) => {
    const { listId } = colorPicker;
    const newColor = color.hex;

    // Update local color
    setListColors((prevColors) => ({
      ...prevColors,
      [listId]: newColor,
    }));
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

  // Introduce local lists state
const [localLists, setLocalLists] = useState(lists);

// Update local state in useEffect when lists prop changes
useEffect(() => {
  setLocalLists(lists);
}, [lists]);

// Update moveTask to modify local state
const moveTask = async (task, sourceListId, targetListId, targetStageId) => {
  // Optimistically update local state
  setLocalLists((prevLists) => {
    // Remove task from source list
    const updatedSourceList = { ...prevLists.find((list) => list._id === sourceListId) };
    updatedSourceList.tasks = updatedSourceList.tasks.filter((t) => t._id !== task._id);

    // Add task to target list
    const updatedTargetList = { ...prevLists.find((list) => list._id === targetListId) };
    updatedTargetList.tasks = [
      ...updatedTargetList.tasks,
      { ...task, stageId: targetStageId },
    ];

    // Replace lists in prevLists
    return prevLists.map((list) => {
      if (list._id === sourceListId) return updatedSourceList;
      if (list._id === targetListId) return updatedTargetList;
      return list;
    });
  });

  try {
    if (sourceListId === targetListId) {
      // Moving within the same list
      await editTaskMutation({
        workspaceId,
        listId: sourceListId,
        taskId: task._id,
        updatedTask: {
          ...task,
          stageId: targetStageId,
        },
      }).unwrap();
    } else {
      // Moving to a different list
      await deleteTaskMutation({ workspaceId, listId: sourceListId, taskId: task._id }).unwrap();
      await addTaskMutation({
        workspaceId,
        listId: targetListId,
        taskData: {
          ...task,
          stageId: targetStageId,
        },
      }).unwrap();
    }
    toast.success('Task moved successfully!');
  } catch (error) {
    console.error('Failed to move task:', error);
    toast.error('Failed to move task');
    // Revert local state changes
    setLocalLists(lists);
  }
};

  

  const Task = ({ task, listId }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TASK,
      item: { task, listId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    return (
      <li ref={drag}
        className={`task-item ${isDragging ? 'dragging' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        onClick={(e) => {
          e.stopPropagation();
          handleEditTask(listId, task);
        }}
        >
        <div className="task-container">
          <div className="task-info">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="6" fill={sortedStages.find((stage) => stage.id === task.stageId)?.color} />
            </svg>
            <div className="task-name">{task.name}</div>
          </div>
        </div>
        <div className={`task-priority ${task.priority.toLowerCase()}-priority`}>{task.priority.toUpperCase()}</div>
        <div className="task-due-date">{new Date(task.dueDate).toLocaleDateString()}</div>
        <div className="task-assignee">
          <div className="avatar-group">
            <img src="https://via.placeholder.com/30" alt="Assignee" />
          </div>
        </div>
      </li>
    );
  };

  const Stage = ({ stage, listId }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.TASK,
      canDrop: ({ task, listId: sourceListId }) => {
        // Define conditions when dropping is allowed
        return true; // or implement your logic
      },
      drop: ({ task, listId: sourceListId }) => moveTask(task, sourceListId, listId, stage.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    });
    

    return (
      <div ref={drop} className={`stage-wrapper ${isOver && canDrop ? 'drag-over' : ''}`}>
        <div
          className="svg-button-wrapper"
          onClick={() => toggleStage(listId, stage.id)}
        >
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            className={`toggle-arrow ${openStages[listId][stage.id] ? 'rotate-open' : 'rotate-closed'}`}
          >
            <g clipPath="url(#clip0_202_634)">
              <path
                d="M9.79887 13.1738L12.7126 16.0875C13.1514 16.5263 13.8601 16.5263 14.2989 16.0875L17.2126 13.1738C17.9214 12.465 17.4151 11.25 16.4139 11.25H10.5864C9.58512 11.25 9.09012 12.465 9.79887 13.1738Z"
                fill="#A5A5A5"
              />
            </g>
          </svg>
          <div className="task-status-header" style={{ backgroundColor: stage.color }}>
            {stage.name.toUpperCase()}
          </div>
        </div>

        {openStages[listId][stage.id] && (
          <>
            <div className="task_headingg">
              <div className="task-heading-1">Name</div>
              <div className="task-heading-2">Priority</div>
              <div className="task-heading-3">&nbsp;Due Date</div>
              <div className="task-heading-4">Assignee</div>
            </div>

            <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
              {lists
                .find((list) => list._id === listId)
                .tasks.filter((task) => task.stageId === stage.id)
                .map((task) => (
                  <Task key={task._id} task={task} listId={listId} />
                ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todo-list-view" onClick={handleHideColorPicker}>
        {localLists.map((list) => (
          <div key={list._id} className="task-list-wrapper">
            <div
              className="list-sidebar"
              style={{ backgroundColor: listColors[list._id] || list.color || '#9fa2ff', position: 'relative' }}
              onClick={(e) => handleShowColorPicker(e, list._id)}
            ></div>

            <div className="task-list-content">
              <div className="task-list-header">
                <h2>
                  {list.name}
                  <span className="icons"></span>
                </h2>
              </div>
              <p>{list.description}</p>

              {sortedStages.map((stage) => (
                <Stage key={stage.id} stage={stage} listId={list._id} />
              ))}

              <div className="add-task" onClick={() => handleAddTask(list._id, sortedStages[0].id)}>
                + Add Task
              </div>
            </div>
          </div>
        ))}

        {colorPicker.isOpen && (
          <div
            style={{ position: 'absolute', top: colorPicker.position.y, left: colorPicker.position.x, zIndex: 1000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <SketchPicker
              color={
                listColors[colorPicker.listId] ||
                lists.find((list) => list._id === colorPicker.listId)?.color ||
                '#9fa2ff'
              }
              onChange={handleColorChange}
            />
          </div>
        )}

        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            initialData={modalData}
          />
        )}

        <div className="add-new-list" onClick={handleAddList}>
          + Add New List
        </div>
      </div>
    </DndProvider>
  );
};

export default TodoListView;