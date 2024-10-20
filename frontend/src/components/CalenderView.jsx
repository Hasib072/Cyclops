// frontend/src/components/CalenderView.jsx

import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalenderView.css'; // Custom CSS for additional styling

// Configure the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

/**
 * CalenderView Component
 * @param {Array} lists - Array of list objects containing tasks
 * @param {Array} stages - Array of stage objects containing color information
 */
const CalenderView = ({ lists, stages }) => {
  const [activeListId, setActiveListId] = useState(lists.length > 0 ? lists[0]._id : null);

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

  // Map tasks of the active list to calendar events
  const events = useMemo(() => {
    if (!activeList || !activeList.tasks) return [];

    return activeList.tasks.map((task) => ({
      id: task._id,
      title: task.name,
      start: new Date(task.creationTime),
      end: new Date(task.dueDate),
      stageId: task.stageId,
      stageColor: stageColorMap[task.stageId] || '#3174ad', // Default color if not found
    }));
  }, [activeList, stageColorMap]);

  /**
   * Customize the style of events based on the task's stage
   * @param {Object} event - The event object
   * @returns {Object} - Style object
   */
  const eventStyleGetter = (event) => {
    const backgroundColor = event.stageColor;
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  /**
   * Handle Tab Click
   * @param {String} listId - The ID of the list to activate
   */
  const handleTabClick = (listId) => {
    setActiveListId(listId);
  };

  return (
    <div className="calender-view-container">
      {/* Tabs for Lists */}
      <div className="tabs-container">
        {lists.map((list) => (
          <button
            key={list._id}
            className={`tab-button ${list._id === activeListId ? 'active' : ''}`}
            onClick={() => handleTabClick(list._id)}
          >
            {list.name}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          popup
        />
      </div>
    </div>
  );
};

export default CalenderView;
