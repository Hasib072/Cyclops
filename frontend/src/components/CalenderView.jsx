// frontend/src/components/CalenderView.jsx

import React, { useState, useMemo } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Modal from 'react-modal';
import './CalenderView.css';

// Initialize Modal
Modal.setAppElement('#root'); // Adjust if your root element has a different ID

/**
 * CalenderView Component
 * @param {Array} lists - Array of list objects containing tasks
 * @param {Array} stages - Array of stage objects containing color information
 */
const CalenderView = ({ lists, stages }) => {
  const [activeListId, setActiveListId] = useState(lists.length > 0 ? lists[0]._id : null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  // Create a map from stageId to stageColor for quick lookup
  const stageColorMap = useMemo(() => {
    const map = {};
    stages.forEach((stage) => {
      map[stage.id] = stage.color;
    });
    return map;
  }, [stages]);

  // Find the active list based on activeListId
  const activeList = useMemo(() => {
    return lists.find((list) => list._id === activeListId);
  }, [lists, activeListId]);

  // Generate calendar weeks
  const generateCalendarWeeks = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay() === 0 ? 7 : startOfMonth.getDay(); // Monday = 1, Sunday = 7
    const totalDays = endOfMonth.getDate();

    const weeks = [];
    let currentWeek = [];

    // Previous month's dates
    for (let i = startDay - 1; i > 0; i--) {
      const prevDate = new Date(date.getFullYear(), date.getMonth(), -i + 1);
      currentWeek.push({
        day: prevDate.getDate(),
        date: prevDate,
        currentMonth: false,
      });
    }

    // Current month's dates
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
      currentWeek.push({
        day: i,
        date: currentDate,
        currentMonth: true,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Next month's dates to fill the remaining cells
    let nextDate = 1;
    while (weeks.length < 6) { // Ensure 6 weeks for uniformity
      while (currentWeek.length < 7) {
        const nxtDate = new Date(date.getFullYear(), date.getMonth() + 1, nextDate);
        currentWeek.push({
          day: nxtDate.getDate(),
          date: nxtDate,
          currentMonth: false,
        });
        nextDate++;
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }

    return weeks;
  };

  const calendarWeeks = useMemo(() => generateCalendarWeeks(currentDate), [currentDate]);

  /**
   * Handle Month Navigation
   * @param {String} direction - 'prev' or 'next'
   */
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  /**
   * Segment Tasks by Week
   * @param {Object} task - Task object
   * @returns {Array} - Array of task segments per week
   */
  const segmentTaskByWeek = (task) => {
    const segments = [];
    const taskStart = new Date(task.creationTime);
    const taskEnd = new Date(task.dueDate);

    // Iterate through each week
    calendarWeeks.forEach((week, weekIndex) => {
      // Define the week's start and end dates
      const weekStartDate = week[0].date;
      const weekEndDate = week[6].date;

      // Check if the task spans this week
      if (taskEnd < weekStartDate || taskStart > weekEndDate) {
        return; // Task does not span this week
      }

      // Calculate the segment's start and end within this week
      const segmentStart = taskStart > weekStartDate ? taskStart : weekStartDate;
      const segmentEnd = taskEnd < weekEndDate ? taskEnd : weekEndDate;

      // Calculate the day indices (0-based, Monday=0)
      const startDayIndex = (segmentStart.getDay() === 0 ? 6 : segmentStart.getDay() - 1);
      const endDayIndex = (segmentEnd.getDay() === 0 ? 6 : segmentEnd.getDay() - 1);

      const span = endDayIndex - startDayIndex + 1;

      segments.push({
        weekIndex,
        startDayIndex,
        span,
        task,
      });
    });

    return segments;
  };

  /**
   * Get all task segments for rendering
   * @returns {Array} - Array of task segments
   */
  const allTaskSegments = useMemo(() => {
    if (!activeList || !activeList.tasks) return [];

    const segments = [];
    activeList.tasks.forEach((task) => {
      segments.push(...segmentTaskByWeek(task));
    });
    return segments;
  }, [activeList, calendarWeeks]);

  /**
   * Assign rows to task segments within each week to stack them
   * @returns {Array} - Array of task segments with row assignments
   */
  const assignTaskRows = () => {
    const weekTaskMap = {}; // { weekIndex: [tasks] }
    allTaskSegments.forEach((segment) => {
      const { weekIndex } = segment;
      if (!weekTaskMap[weekIndex]) {
        weekTaskMap[weekIndex] = [];
      }
      weekTaskMap[weekIndex].push(segment);
    });

    const taskSegmentsWithRow = [];

    Object.keys(weekTaskMap).forEach((weekIndex) => {
      const tasks = weekTaskMap[weekIndex];
      const rowAssignments = [];

      tasks.forEach((task) => {
        // Assign the first available row
        let assignedRow = 1;
        while (rowAssignments.includes(assignedRow)) {
          assignedRow++;
        }
        rowAssignments.push(assignedRow);
        taskSegmentsWithRow.push({ ...task, row: assignedRow });
      });
    });

    return taskSegmentsWithRow;
  };

  const taskSegmentsWithRow = useMemo(() => assignTaskRows(), [allTaskSegments]);

  /**
   * Render Task Segments
   * @returns {JSX.Element} - Rendered task segments
   */
  const renderTaskSegments = () => {
    return taskSegmentsWithRow.map((segment, index) => {
      const { weekIndex, startDayIndex, span, task, row } = segment;

      return (
        <div
          key={`${task._id}-${weekIndex}-${row}`}
          className="Cal_task"
          style={{
            gridColumnStart: startDayIndex + 1,
            gridRowStart: weekIndex + 2 + row, // +2 to account for header and weekdays, +row for stacking
            gridColumnEnd: `span ${span}`,
            backgroundColor: stageColorMap[task.stageId] || '#9854cb',
            zIndex: row, // Higher row = higher z-index
          }}
          title={`${task.name} - ${stages.find(stage => stage.id === task.stageId)?.name || 'N/A'}`} // Enhanced tooltip
          onClick={() => setSelectedTask(task)}
        >
          {task.name}
        </div>
      );
    });
  };

  return (
    <div className="Cal_calendar-container">
      {/* Calendar Header */}
      <div className="Cal_calendar-header">
        <button onClick={() => handleMonthChange('prev')} aria-label="Previous Month">
          <FaArrowLeft className="Cal_arrow" />
        </button>
        <span className="Cal_month-year">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => handleMonthChange('next')} aria-label="Next Month">
          <FaArrowRight className="Cal_arrow" />
        </button>
      </div>

      {/* Tabs for Lists */}
      <div className="Cal_tabs-container">
        {lists.map((list) => (
          <button
            key={list._id}
            className={`Cal_tab-button ${list._id === activeListId ? 'Cal_active' : ''}`}
            onClick={() => setActiveListId(list._id)}
            aria-label={`Switch to list ${list.name}`}
          >
            {list.name}
          </button>
        ))}
      </div>

      {/* Calendar Wrapper */}
      <div className="Cal_calendar-wrapper">
        {/* Date Cells Grid */}
        <div className="Cal_calendar">
          {/* Weekday Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="Cal_weekdays">
              {day}
            </div>
          ))}

          {/* Dates */}
          {calendarWeeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => (
              <div key={`${weekIndex}-${dayIndex}`} className={`Cal_date-cell ${day.currentMonth ? '' : 'Cal_not-current-month'}`}>
                <span className="Cal_date">{day.day}</span>
              </div>
            ))
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="Cal_tasks-grid">
          {/* Render Task Segments */}
          {renderTaskSegments()}
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onRequestClose={() => setSelectedTask(null)}
          contentLabel="Task Details"
          className="Cal_task-modal"
          overlayClassName="Cal_task-modal-overlay"
        >
          {selectedTask && (
            <>
              <h2>{selectedTask.name}</h2>
              <p><strong>Description:</strong> {selectedTask.description}</p>
              <p><strong>Priority:</strong> {selectedTask.priority}</p>
              <p><strong>Assignee:</strong> {selectedTask.assignee}</p>
              <p><strong>Stage:</strong> {stages.find(stage => stage.id === selectedTask.stageId)?.name || 'N/A'}</p>
              <p><strong>Created At:</strong> {new Date(selectedTask.creationTime).toLocaleString()}</p>
              <p><strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleString()}</p>
              <button onClick={() => setSelectedTask(null)}>Close</button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CalenderView;
