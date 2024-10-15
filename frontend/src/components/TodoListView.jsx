import React, { useState, useEffect, useRef } from 'react';
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
        const tasksInStage = list.tasks.filter((task) => task.stageId === stage.id);
        initialState[list._id][stage.id] = tasksInStage.length > 0; // Open if tasks exist
      });
    });
    return initialState;
  });

  // State to manage collapsed/expanded lists
  const [collapsedLists, setCollapsedLists] = useState({});

  // Initialize collapsedLists when lists change
  useEffect(() => {
    const initialCollapsed = {};
    lists.forEach((list) => {
      initialCollapsed[list._id] = false; // false means expanded
    });
    setCollapsedLists(initialCollapsed);
  }, [lists]);

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

  // State for color picker
  const [colorPicker, setColorPicker] = useState({
    isOpen: false,
    listId: null,
    position: { x: 0, y: 0 },
    tempColor: '#9fa2ff', // Default color
  });

  // Ref for the color picker
  const colorPickerRef = useRef(null);

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

  // Handler to toggle list collapse
  const toggleList = (listId) => {
    setCollapsedLists((prevState) => ({
      ...prevState,
      [listId]: !prevState[listId],
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
            [stage.id]: false, // No tasks initially, so collapsed
          },
        }));
      });

      // Initialize collapsed state for the new list
      setCollapsedLists((prevState) => ({
        ...prevState,
        [newList._id]: false, // Expanded by default
      }));

      toast.success('List added successfully!');
    } catch (error) {
      console.error('Failed to add list:', error);
      toast.error(error.data?.message || 'Failed to add list');
    }
  };

  // Handler to show color picker
  const handleShowColorPicker = (e, listId) => {
    e.stopPropagation(); // Prevent event bubbling

    // Get mouse position with offset
    let posX = e.clientX + 10; // 10px right
    let posY = e.clientY + 10; // 10px down

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Approximate color picker dimensions
    const pickerWidth = 225; // SketchPicker default width
    const pickerHeight = 300; // SketchPicker default height

    // Adjust position if color picker goes beyond viewport
    if (posX + pickerWidth > viewportWidth) {
      posX = viewportWidth - pickerWidth - 10; // 10px margin
    }
    if (posY + pickerHeight > viewportHeight) {
      posY = viewportHeight - pickerHeight - 10; // 10px margin
    }

    // Find the current color of the list
    const currentColor =
      localLists.find((list) => list._id === listId)?.color || '#9fa2ff';

    // Set the color picker state with tempColor
    setColorPicker({
      isOpen: true,
      listId,
      position: { x: posX, y: posY },
      tempColor: currentColor,
    });
  };

  // Handler to hide color picker without updating the color
  const handleHideColorPicker = () => {
    // Apply the tempColor to the main color
    handleColorChangeComplete();
  };

  // Handler for color change complete
  const handleColorChangeComplete = async () => {
    const { listId, tempColor } = colorPicker;

    console.log('Applying new color');
    console.log('List ID:', listId);
    console.log('New Color:', tempColor);

    if (tempColor && listId) {
      try {
        await updateListColor({
          workspaceId,
          listId,
          color: tempColor,
        }).unwrap();

        console.log('Color update successful');
        toast.success('List color updated successfully!');

        // Update localLists with the new color
        setLocalLists((prevLists) =>
          prevLists.map((list) =>
            list._id === listId ? { ...list, color: tempColor } : list
          )
        );
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
      tempColor: '#9fa2ff', // Reset to default or previous color
    });
  };

  // useEffect to handle clicks outside the color picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        handleHideColorPicker();
      }
    };

    if (colorPicker.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [colorPicker.isOpen, colorPicker.listId, colorPicker.tempColor]);

  // Introduce local lists state for optimistic UI updates
  const [localLists, setLocalLists] = useState(lists);

  // Update local state when lists prop changes
  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  // Drag and Drop Handlers
  const moveTask = async (task, sourceListId, targetListId, targetStageId) => {
    // Optimistically update local state
    setLocalLists((prevLists) => {
      const updatedSourceList = { ...prevLists.find((list) => list._id === sourceListId) };
      updatedSourceList.tasks = updatedSourceList.tasks.filter((t) => t._id !== task._id);

      const updatedTargetList = { ...prevLists.find((list) => list._id === targetListId) };
      updatedTargetList.tasks = [
        ...updatedTargetList.tasks,
        { ...task, stageId: targetStageId },
      ];

      return prevLists.map((list) => {
        if (list._id === sourceListId) return updatedSourceList;
        if (list._id === targetListId) return updatedTargetList;
        return list;
      });
    });

    // Update openStages based on the new localLists
    setOpenStages((prevState) => {
      const updatedState = { ...prevState };

      // Remove task from source stage
      const sourceList = localLists.find((list) => list._id === sourceListId);
      const sourceTasks = sourceList.tasks.filter((t) => t.stageId === task.stageId);
      if (sourceTasks.length === 0) {
        updatedState[sourceListId][task.stageId] = false; // Collapse if no tasks
      }

      // Add task to target stage
      updatedState[targetListId][targetStageId] = true; // Ensure target stage is open

      return updatedState;
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
      // Recompute openStages based on reverted lists
      setOpenStages(() => {
        const recomputedState = {};
        lists.forEach((list) => {
          recomputedState[list._id] = {};
          sortedStages.forEach((stage) => {
            const tasksInStage = list.tasks.filter((task) => task.stageId === stage.id);
            recomputedState[list._id][stage.id] = tasksInStage.length > 0;
          });
        });
        return recomputedState;
      });
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
      <li
        ref={drag}
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
    // Set up the drop functionality
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.TASK,
      drop: ({ task, listId: sourceListId }) => moveTask(task, sourceListId, listId, stage.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    });

    // Find the corresponding list from localLists
    const list = localLists.find((lst) => lst._id === listId);
    const tasksInStage = list.tasks.filter((task) => task.stageId === stage.id);

    return (
      <div ref={drop} className={`stage-wrapper ${isOver && canDrop ? 'drag-over' : ''}`}>
        {/* Stage Header with Conditional Task Count */}
        <div
          className="svg-button-wrapper"
          onClick={() => toggleStage(listId, stage.id)}
        >
          {/* Toggle Arrow SVG */}
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            className={`toggle-arrow ${isOver && canDrop ? 'rotate-open' : 'rotate-closed'}`}
          >
            <g clipPath="url(#clip0_202_634)">
              <path
                d="M9.79887 13.1738L12.7126 16.0875C13.1514 16.5263 13.8601 16.5263 14.2989 16.0875L17.2126 13.1738C17.9214 12.465 17.4151 11.25 16.4139 11.25H10.5864C9.58512 11.25 9.09012 12.465 9.79887 13.1738Z"
                fill="#A5A5A5"
              />
            </g>
          </svg>

          {/* Stage Name with Conditional Task Count */}
          <div className="task-status-header" style={{ backgroundColor: stage.color }}>
            {stage.name.toUpperCase()}
            {tasksInStage.length > 0 && (
              <span className="task-count"> &emsp; {tasksInStage.length}</span>
            )}
          </div>
        </div>

        {/* Tasks under the stage */}
        {openStages[listId][stage.id] && (
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
              {tasksInStage.map((task) => (
                <Task key={task._id} task={task} listId={listId} />
              ))}
            </ul>
          </>
        )}
      </div>
    )};

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todo-list-view">
        {/* Add New List Button */}
        <div className="add-new-list" onClick={handleAddList}>
          + Add New List
        </div>

        {/* Render all lists */}
        {localLists.map((list) => (
          <div key={list._id} className="task-list-wrapper">
            {/* List Sidebar */}
            <div
              className="list-sidebar"
              style={{
                backgroundColor:
                  colorPicker.isOpen && colorPicker.listId === list._id
                    ? colorPicker.tempColor
                    : list.color || '#9fa2ff',
                position: 'relative',
              }}
              onClick={(e) => handleShowColorPicker(e, list._id)}
            ></div>

            {/* Task List Content */}
            <div className="task-list-content">
              {/* List Header */}
              <div className="task-list-header"
              onClick={() => toggleList(list._id)}
              >
                <h2>
                  {list.name}
                </h2>
              </div>
              <p className='task-list-description'>{list.description}</p>

              {/* Stages */}
              {!collapsedLists[list._id] && sortedStages.map((stage) => (
                <Stage key={stage.id} stage={stage} listId={list._id} />
              ))}

              {/* Add Task Button */}
              {!collapsedLists[list._id] && (
                <div className="add-task" onClick={() => handleAddTask(list._id, sortedStages[0].id)}>
                  + Add Task
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Color Picker */}
        {colorPicker.isOpen && (
          <div
            ref={colorPickerRef}
            style={{
              position: 'fixed', // Fixed positioning for accurate placement
              top: colorPicker.position.y,
              left: colorPicker.position.x,
              zIndex: 1000,
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown from propagating
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating
          >
            <SketchPicker
              color={colorPicker.tempColor}
              onChange={(color) => {
                setColorPicker((prev) => ({
                  ...prev,
                  tempColor: color.hex,
                }));
              }}
            />
          </div>
        )}

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
    </DndProvider>
  );
};

export default TodoListView;
