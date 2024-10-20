// frontend/src/components/TodoBoardView.jsx

import React, { useState, useEffect, useRef } from 'react';
import './TodoBoardView.css';
import TaskModal from './TaskModal';
import {
  useAddListToWorkspaceMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
  useDeleteListFromWorkspaceMutation,
  useUpdateListColorMutation,
  useReorderListsMutation,
  useUpdateListInWorkspaceMutation,
} from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useDrag, useDrop } from 'react-dnd';
import deleteIconSvg from '../assets/icons/delete-tilt.svg';

const ItemTypes = {
  TASK: 'task',
};

const TodoBoardView = ({ stages = [], lists = [], workspaceId, members = [] }) => {
  // Sort stages based on predefined order
  const stageOrder = ['Opened', 'In Progress', 'Blocked', 'Backlog', 'Closed'];
  const sortedStages = [...stages].sort(
    (a, b) => stageOrder.indexOf(a.name) - stageOrder.indexOf(b.name)
  );

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
  const [deleteListFromWorkspaceMutation] = useDeleteListFromWorkspaceMutation();
  const [updateListInWorkspace] = useUpdateListInWorkspaceMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);

  // Local lists state for optimistic UI updates
  const [localLists, setLocalLists] = useState(lists);

  // Update local state when lists prop changes
  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  // Handler to add a new task
  const handleAddTask = (stageId) => {
    setCurrentStageId(stageId);
    setModalData(null);
    setIsModalOpen(true);
  };

  // Handler to edit a task
  const handleEditTask = (task) => {
    setCurrentStageId(task.stageId);
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
          listId,
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
    setCurrentStageId(null);
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

  // Define the moveTask function
  const moveTask = async (task, sourceStageId, targetStageId) => {
    try {
      await editTaskMutation({
        workspaceId,
        listId: selectedListId,
        taskId: task._id,
        updatedTask: {
          ...task,
          stageId: targetStageId,
        },
      }).unwrap();

      // Update local state
      setLocalLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId
            ? {
                ...list,
                tasks: list.tasks.map((t) =>
                  t._id === task._id ? { ...t, stageId: targetStageId } : t
                ),
              }
            : list
        )
      );

      toast.success('Task moved successfully!');
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error(error.data?.message || 'Failed to move task');
    }
  };

  // Handlers for Task Deletion via Dragging
  const [{ isOverRight }, dropRight] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => {
      handleDeleteTask(item.task._id);
    },
    collect: (monitor) => ({
      isOverRight: monitor.isOver() && monitor.canDrop(),
    }),
  });

  return (
    <>
      {/* Tabs for lists */}
      <div className="tabs-container">
        {localLists.map((list) => (
          <div
            key={list._id}
            className={`tab-item ${selectedListId === list._id ? 'active' : ''}`}
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

      {/* Delete Zone */}
      <div
        ref={dropRight}
        className={`delete-zone right ${isOverRight ? 'active' : ''}`}
      >
        <img src={deleteIconSvg} alt="DeleteIconSVG" />
      </div>

      {/* Task Board Container with Overflow Handling */}
      <div className="task-board-container">
        <div className="task-board" id="task-board">
          {sortedStages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              tasks={selectedList.tasks}
              moveTask={moveTask}
              handleAddTask={handleAddTask}
              handleEditTask={handleEditTask}
            />
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={modalData}
          members={members}
        />
      )}
    </>
  );
};

const Stage = ({ stage, tasks, moveTask, handleAddTask, handleEditTask }) => {
  // Use individual state for each stage's collapse status
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use useEffect to persist collapse state when updates happen
  const isCollapsedRef = useRef(isCollapsed);
  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: ({ task, stageId: sourceStageId }) =>
      moveTask(task, sourceStageId, stage.id),
    canDrop: () => !isCollapsed, // Prevent dropping if the stage is collapsed
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Get tasks for this stage
  const tasksInStage = tasks.filter((task) => task.stageId === stage.id);

  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      ref={drop}
      className={`column ${
        isCollapsed ? 'collapsed' : ''
      } column-${stage.name.toLowerCase().replace(' ', '-')}`}
      style={{ backgroundColor: isCollapsed ? 'transparent' : '#2c2f36' }}
    >
      <div
        className={`stage-header ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleCollapse}
        style={{
          backgroundColor: stage.color,
          borderRadius: isCollapsed ? '24px' : '8px 8px 0 0',
        }}
      >
        <span className={`icon chevron ${isCollapsed ? 'collapsed' : ''}`} />
        <span className={`stage-title ${isCollapsed ? 'collapsed' : ''}`}>
          {stage.name}
        </span>
        <span>&nbsp;</span>
        <span className="task-count">{tasksInStage.length}</span>
      </div>

      {!isCollapsed && (
        <div className="task-container expanded">
          {tasksInStage.map((task) => (
            <Task
              key={task._id}
              task={task}
              handleEditTask={handleEditTask}
            />
          ))}
          {/* Add Task Button */}
          <button
            className="add-task"
            onClick={() => handleAddTask(stage.id)}
          >
            + Add Task
          </button>
        </div>
      )}
    </div>
  );
};

const Task = ({ task, handleEditTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { type: ItemTypes.TASK, task, stageId: task.stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`task ${task.priority.toLowerCase()}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        handleEditTask(task);
      }}
    >
      <h3>{task.name}</h3>
      <p>{task.description}</p>
      <div className="task-info">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority.toUpperCase()}
        </span>
        <span className="due-date">
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <div className="avatar-group2">
          <img src="https://via.placeholder.com/30" alt="Assignee" />
        </div>
      </div>
    </div>
  );
};

export default TodoBoardView;
