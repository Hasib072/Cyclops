// frontend/src/components/TodoListView.jsx

import React, { useState, useEffect, useRef } from 'react';
import './TodoListView.css';
import TaskModal from './TaskModal';
import {
  useAddListToWorkspaceMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
  useDeleteListFromWorkspaceMutation, // Newly added
  useUpdateListColorMutation,
  useReorderListsMutation, // For reordering lists
  useUpdateListInWorkspaceMutation, // For editing list names
} from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { SketchPicker } from 'react-color';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  TASK: 'task',
  LIST: 'list', // New ItemType for lists
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
  const [deleteListFromWorkspaceMutation] = useDeleteListFromWorkspaceMutation(); // Newly added
  const [updateListColor] = useUpdateListColorMutation();
  const [reorderListsMutation] = useReorderListsMutation(); // For reordering lists
  const [updateListInWorkspace] = useUpdateListInWorkspaceMutation(); // For editing list names

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

  // State for editing list names
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState('');

  // Introduce local lists state for optimistic UI updates
  const [localLists, setLocalLists] = useState(lists);

  // Update local state when lists prop changes
  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

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

  // Drag and Drop Handlers for Lists
  const moveList = (dragIndex, hoverIndex) => {
    const draggedList = localLists[dragIndex];
    const updatedLists = [...localLists];
    updatedLists.splice(dragIndex, 1);
    updatedLists.splice(hoverIndex, 0, draggedList);
    setLocalLists(updatedLists);

    // Persist the new order to the backend
    const newOrder = updatedLists.map((list) => list._id);
    reorderListsMutation({ workspaceId, newOrder })
      .unwrap()
      .then(() => {
        toast.success('List order updated successfully!');
      })
      .catch((error) => {
        console.error('Failed to reorder lists:', error);
        toast.error(error.data?.message || 'Failed to reorder lists');
        setLocalLists(lists); // Revert to original order on failure
      });
  };

  // Handler to start editing a list name
  const handleStartEditing = (listId, currentName) => {
    setEditingListId(listId);
    setEditedListName(currentName);
  };

  // Handler to submit edited list name
  const handleSubmitEdit = async (listId) => {
    if (!editedListName.trim()) {
      toast.error('List name cannot be empty.');
      return;
    }

    try {
      await updateListInWorkspace({
        workspaceId,
        listId,
        name: editedListName.trim(),
        description: '', // Update as needed; assuming description remains unchanged
      }).unwrap();

      toast.success('List name updated successfully!');

      // Update localLists with the new name
      setLocalLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, name: editedListName.trim() } : list
        )
      );

      setEditingListId(null);
      setEditedListName('');
    } catch (error) {
      console.error('Failed to edit list name:', error);
      toast.error(error.data?.message || 'Failed to edit list name');
    }
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditedListName('');
  };

  // Handlers for List Deletion via Dragging
  const [{ isOverLeft }, dropLeft] = useDrop({
    accept: ItemTypes.LIST,
    drop: (item) => handleDeleteList(item.listId),
    collect: (monitor) => ({
      isOverLeft: monitor.isOver() && monitor.canDrop(),
    }),
  });

  const [{ isOverRight }, dropRight] = useDrop({
    accept: ItemTypes.LIST,
    drop: (item) => handleDeleteList(item.listId),
    collect: (monitor) => ({
      isOverRight: monitor.isOver() && monitor.canDrop(),
    }),
  });

  const handleDeleteList = (listId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this list?');
    if (!confirmDelete) return;

    // Proceed to delete the list
    deleteList(listId);
  };

  const deleteList = async (listId) => {
    try {
      await deleteListFromWorkspaceMutation({ workspaceId, listId }).unwrap(); // Correct mutation
      toast.success('List deleted successfully!');

      // Update localLists by removing the deleted list
      setLocalLists((prevLists) => prevLists.filter((list) => list._id !== listId));

      // Remove from openStages and collapsedLists
      setOpenStages((prevState) => {
        const updatedState = { ...prevState };
        delete updatedState[listId];
        return updatedState;
      });
      setCollapsedLists((prevState) => {
        const updatedState = { ...prevState };
        delete updatedState[listId];
        return updatedState;
      });
    } catch (error) {
      console.error('Failed to delete list:', error);
      toast.error(error.data?.message || 'Failed to delete list');
    }
  };

  // Define the List component inside TodoListView
  const List = ({ list, index }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
      accept: ItemTypes.LIST,
      hover(item, monitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current.getBoundingClientRect();

        // Get horizontal middle
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the left
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        // Only perform the move when the mouse has crossed half of the item's width
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
          return;
        }
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
          return;
        }

        // Time to actually perform the action
        moveList(dragIndex, hoverIndex);

        // Mutate the monitor item to avoid redundant calls
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.LIST,
      item: { type: ItemTypes.LIST, listId: list._id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className={`task-list-wrapper ${isDragging ? 'dragging' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {/* List Sidebar */}
        <div
          className="list-sidebar"
          style={{
            backgroundColor:
              colorPicker.isOpen && colorPicker.listId === list._id
                ? colorPicker.tempColor
                : list.color || '#9fa2ff',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={(e) => handleShowColorPicker(e, list._id)}
        ></div>

        {/* Task List Content */}
        <div className="task-list-content">
          {/* List Header */}
          <div className="task-list-header">
            {editingListId === list._id ? (
              <input
                type="text"
                value={editedListName}
                onChange={(e) => setEditedListName(e.target.value)}
                onBlur={() => handleSubmitEdit(list._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitEdit(list._id);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
                className="list-name-input"
              />
            ) : (
              <h2
                onDoubleClick={() => handleStartEditing(list._id, list.name)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartEditing(list._id, list.name);
                  }
                }}
                aria-label={`Edit name of ${list.name}`}
              >
                {list.name}
              </h2>
            )}
          </div>
          <p className="task-list-description">{list.description}</p>

          {/* Stages */}
          {!collapsedLists[list._id] &&
            sortedStages.map((stage) => (
              <Stage key={stage.id} stage={stage} listId={list._id} />
            ))}

          {/* Add Task Button */}
          {!collapsedLists[list._id] && (
            <div
              className="add-task"
              onClick={() => handleAddTask(list._id, sortedStages[0].id)}
            >
              + Add Task
            </div>
          )}
        </div>
      </div>
    );

  };

  const Stage = ({ stage, listId }) => {
    // Set up the drop functionality
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.TASK,
      drop: ({ task, listId: sourceListId }) =>
        moveTask(task, sourceListId, listId, stage.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    });

    // Find the corresponding list from localLists
    const list = localLists.find((lst) => lst._id === listId);
    const tasksInStage = list.tasks.filter((task) => task.stageId === stage.id);

    return (
      <div
        ref={drop}
        className={`stage-wrapper ${isOver && canDrop ? 'drag-over' : ''}`}
      >
        {/* Stage Header with Conditional Task Count */}
        <div className="svg-button-wrapper" onClick={() => toggleStage(listId, stage.id)}>
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
    );
  };

  const Task = ({ task, listId }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TASK,
      item: { task, listId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
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

  return (
    <>
      {/* Invisible Drop Zones for Deletion */}
      {/* render it only if something is being dragged */}
      {/* <div
        ref={dropLeft}
        className={`delete-zone left ${isOverLeft ? 'active' : ''}`}
      >
        <span>Drag here to delete</span>
      </div> */}
      <div
        ref={dropRight}
        className={`delete-zone right ${isOverRight ? 'active' : ''}`}
      >
        <span>Drag here to delete</span>
      </div>

      <div className="todo-list-view">
        {/* Add New List Button */}
        <div className="add-new-list" onClick={handleAddList}>
          + Add New List
        </div>

        {/* Render all lists */}
        {localLists.map((list, index) => (
          <List key={list._id} list={list} index={index} />
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
    </>
  );
};

export default TodoListView;
