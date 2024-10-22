// frontend/src/components/GanttView.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './GanttView.css';
import { useAddListToWorkspaceMutation } from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

/**
 * GanttView Component
 * Renders a simple Gantt chart with dynamic tabs based on lists.
 * 
 * Props:
 * - stages: Array of stage objects.
 * - lists: Array of list objects containing tasks.
 * - members: Array of member objects.
 * - workspaceId: ID of the current workspace.
 */
const GanttView = ({ stages = [], lists = [], members = [], workspaceId }) => {
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

  // Local lists state for optimistic UI updates
  const [localLists, setLocalLists] = useState(lists);

  // Update local state when lists prop changes
  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

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

  // Flatten all tasks from all lists for mapping
  const allTasks = useMemo(() => {
    return lists.flatMap((list) => list.tasks);
  }, [lists]);

  // Define the start and end weeks (W11 to W16)
  const weeks = useMemo(() => ['W11', 'W12', 'W13', 'W14', 'W15', 'W16'], []);

  // Map weeks to date ranges (for demonstration purposes, adjust as needed)
  const weekRanges = useMemo(() => {
    const baseDate = new Date('2024-10-01'); // Example start date
    const ranges = weeks.map((week, index) => {
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { week, start: weekStart, end: weekEnd };
    });
    return ranges;
  }, [weeks]);

  // Map tasks to Gantt chart rows
  const ganttTasks = useMemo(() => {
    return selectedList.tasks.map((task) => {
      // Find the stage of the task
      const stage = stages.find((s) => s.id === task.stageId);

      // Determine the week(s) the task spans based on dueDate
      const taskDueDate = new Date(task.dueDate);
      let startWeek = weeks[0];
      let endWeek = weeks[weeks.length - 1];

      weekRanges.forEach((range) => {
        if (taskDueDate >= range.start && taskDueDate <= range.end) {
          startWeek = range.week;
          endWeek = range.week;
        }
      });

      // Calculate the span (number of weeks the task occupies)
      const startIndex = weeks.indexOf(startWeek);
      const endIndex = weeks.indexOf(endWeek);
      const span = endIndex - startIndex + 1;

      return {
        id: task._id,
        name: task.name,
        color: stage ? stage.color : '#9fa2ff',
        status: stage ? stage.name.replace(' ', '-').toLowerCase() : 'opened',
        span: span > 0 ? span : 1, // Ensure at least a span of 1
      };
    });
  }, [selectedList.tasks, stages, weeks, weekRanges]);

  return (
    <div className="Gantt_container">
      {/* Tabs for lists */}
      <div className="Gantt_tab-container">
        {localLists.map((list) => (
          <div
            key={list._id}
            className={`Gantt_tab-item ${selectedListId === list._id ? 'Gantt_active' : ''}`}
            onClick={() => handleSelectList(list._id)}
          >
            {list.name}
          </div>
        ))}
        {/* Add New List Button */}
        <div className="Gantt_tab-item Gantt_add-new-list" onClick={handleAddList}>
          + Add New List
        </div>
      </div>

      {/* Gantt Chart Table */}
      <div className="Gantt_header-container">
        <table className="Gantt_task-table" id="gantt-task-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              {weeks.map((week) => (
                <th key={week}>{week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ganttTasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>
                  <span
                    className="Gantt_name-icon"
                    style={{ backgroundColor: task.color }}
                  ></span>
                  {task.name}
                </td>
                {weeks.map((week, idx) => {
                  // Determine if the task occupies this week
                  const taskStartIndex = weeks.indexOf(weeks[0]); // Starting at W11
                  const taskEndIndex = taskStartIndex + task.span - 1;

                  if (idx === taskStartIndex) {
                    return (
                      <td key={week} colSpan={task.span} className="Gantt_gantt-chart">
                        <div className={`Gantt_bar Gantt_${task.status}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </div>
                      </td>
                    );
                  } else if (idx < taskStartIndex || idx > taskEndIndex) {
                    return <td key={week}></td>;
                  } else {
                    // These cells are merged via colspan
                    return null;
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GanttView;
