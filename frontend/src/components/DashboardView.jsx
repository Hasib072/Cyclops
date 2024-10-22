// frontend/src/components/DashboardView.jsx

import React, { useMemo } from 'react';
import './DashboardView.css';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

/**
 * DashboardView Component
 * Renders the Dashboard view with Recently Added Tasks, Progress Pie Chart, and Gantt Chart.
 * 
 * Props:
 * - stages: Array of stage objects.
 * - lists: Array of list objects containing tasks.
 * - members: Array of member objects.
 */
const DashboardView = ({ stages, lists, members }) => {
  // Flatten all tasks from all lists
  const allTasks = useMemo(() => {
    return lists.flatMap((list) => list.tasks);
  }, [lists]);

  // Get Recently Added Tasks (sorted by creationTime descending)
  const recentTasks = useMemo(() => {
    return allTasks
      .sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime))
      .slice(0, 4); // Get top 4 recent tasks
  }, [allTasks]);

  // Compute Progress Data for Pie Chart (count of tasks per stage)
  const progressData = useMemo(() => {
    const stageCountMap = {};
    stages.forEach((stage) => {
      stageCountMap[stage.name] = 0;
    });
    allTasks.forEach((task) => {
      const stage = stages.find((s) => s.id === task.stageId);
      if (stage) {
        stageCountMap[stage.name] += 1;
      }
    });
    return Object.keys(stageCountMap).map((stageName) => ({
      name: stageName,
      value: stageCountMap[stageName],
    }));
  }, [allTasks, stages]);

  // Define colors for the pie chart based on stages
  const stageColorMap = useMemo(() => {
    const map = {};
    stages.forEach((stage, index) => {
      map[stage.name] = stage.color;
    });
    return map;
  }, [stages]);

  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

  // Sample data for Gantt Chart (You can make this dynamic based on your requirements)
  // Here, we'll assume weeks W11 to W16 correspond to specific date ranges
  const ganttTasks = useMemo(() => {
    // Example mapping, adjust according to your actual date ranges
    return allTasks.map((task, index) => ({
      id: task._id,
      name: task.name,
      color: stages.find((s) => s.id === task.stageId)?.color || '#9fa2ff',
      status: stages.find((s) => s.id === task.stageId)?.name.replace(' ', '-').toLowerCase() || 'opened',
      span: 7, // Assuming each task spans 7 weeks for demonstration; adjust as needed
    }));
  }, [allTasks, stages]);

  return (
    <div className="Dashboard_container">
      {/* Recently Added Tasks and Progress Pie Chart */}
      <div className="Dashboard_top-section">
        {/* Recently Added Tasks */}
        <div className="Dashboard_recent-opens">
          <h3>Recent Opens</h3>
          <ul>
            {recentTasks.map((task) => {
              const stage = stages.find((s) => s.id === task.stageId);
              return (
                <li key={task._id}>
                  <span className="Dashboard_span_1">
                    <span
                      className={`Dashboard_name-icon ${
                        stage?.category === 'Pending'
                          ? 'Dashboard_yellow'
                          : stage?.category === 'Active'
                          ? 'Dashboard_dark-blue'
                          : 'Dashboard_orange'
                      }`}
                    ></span>
                    {task.name}
                  </span>
                  <span className="Dashboard_span_2">{stage?.name || 'N/A'}</span>
                  {task.assignee && (
                    <div className="Dashboard_avatar-group2">
                      {/* Find member details based on assignee ID */}
                      {members
                        .filter((member) => member.user._id === task.assignee)
                        .map((member, idx) => (
                          <img
                            key={idx}
                            src={
                              member.user.profileImage
                                ? `${BACKEND_URL}/${member.user.profileImage}`
                                : 'https://via.placeholder.com/30'
                            }
                            alt={`User ${idx + 1}`}
                          />
                        ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Progress Pie Chart */}
        <div className="Dashboard_progress">
          {/* <h3>Progress</h3> */}
          <PieChart width={300} height={200} className="Dashboard_progress-chart">
            <Pie
              data={progressData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              label
            >
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stageColorMap[entry.name] || '#9fa2ff'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="Dashboard_legend">
            {progressData.map((entry, index) => (
              <span key={index} className={`Dashboard_${entry.name.toLowerCase().replace(' ', '-')}`}>
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="Dashboard_gantt-chart-container">
        <div className="Dashboard_tab-container">
          <div className="Dashboard_tab-item Dashboard_active">All</div>
          <div className="Dashboard_tab-item">My List 01</div>
          <div className="Dashboard_tab-item">Other Lists</div>
        </div>
        <table className="Dashboard_task-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>W11</th>
              <th>W12</th>
              <th>W13</th>
              <th>W14</th>
              <th>W15</th>
              <th>W16</th>
            </tr>
          </thead>
          <tbody>
            {ganttTasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>
                  <span className="Dashboard_name-icon" style={{ backgroundColor: task.color }}></span>
                  {task.name}
                </td>
                <td colSpan={task.span}>
                  <div className="Dashboard_gantt-chart">
                    <div className={`Dashboard_bar Dashboard_${task.status}`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardView;
