// frontend/src/components/DashboardView.jsx

import React from 'react';
import './DashboardView.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

/**
 * DashboardView Component
 * Renders the Dashboard view with Recently Added Tasks, Progress Pie Chart, and Gantt Chart.
 */
const DashboardView = () => {
  // Sample data for Recently Added Tasks
  const recentTasks = [
    {
      id: 1,
      name: 'Task01 Make UI',
      stage: 'Reviewing',
      avatars: [
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
      ],
    },
    {
      id: 2,
      name: 'Task02 Backend',
      stage: 'In Progress',
      avatars: [
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
      ],
    },
    {
      id: 3,
      name: 'Task03 Documentation',
      stage: 'In Progress',
      avatars: [
        'https://via.placeholder.com/30',
      ],
    },
    {
      id: 4,
      name: 'Notes',
      stage: 'Reviewing',
      avatars: [
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
      ],
    },
  ];

  // Sample data for Progress Pie Chart
  const progressData = [
    { name: 'Reviewing', value: 2 },
    { name: 'In Progress', value: 5 },
    { name: 'Rejected', value: 1 },
  ];

  // Colors for the pie chart slices
  const COLORS = ['#e5cf59', '#343ad5', '#bf5b5b'];

  return (
    <div className="Dashboard_container">
      {/* Recently Added Tasks and Progress Pie Chart */}
      <div className="Dashboard_top-section">
        {/* Recently Added Tasks */}
        <div className="Dashboard_recent-opens">
          <h3>Recent Opens</h3>
          <ul>
            {recentTasks.map((task) => (
              <li key={task.id}>
                <span className="Dashboard_span_1">
                  <span
                    className={`Dashboard_name-icon ${
                      task.stage === 'Reviewing' ? 'Dashboard_yellow' :
                      task.stage === 'In Progress' ? 'Dashboard_dark-blue' :
                      'Dashboard_orange'
                    }`}
                  ></span>
                  {task.name}
                </span>
                <span className="Dashboard_span_2">{task.stage}</span>
                {task.avatars && task.avatars.length > 0 && (
                  <div className="Dashboard_avatar-group2">
                    {task.avatars.map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt={`User ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Pie Chart */}
        <div className="Dashboard_progress">
          <h3>Progress</h3>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {/* Optionally, you can include a legend */}
            {/* <Legend /> */}
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
            <tr>
              <td>1</td>
              <td>
                <span className="Dashboard_name-icon Dashboard_blue"></span>Task01 Name
              </td>
              <td colSpan="7">
                <div className="Dashboard_gantt-chart">
                  <div className="Dashboard_bar Dashboard_opened">OPENED</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>
                <span className="Dashboard_name-icon Dashboard_blue"></span>Another Task
              </td>
              <td colSpan="7">
                <div className="Dashboard_gantt-chart">
                  <div className="Dashboard_bar Dashboard_opened_1">OPENED</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>
                <span className="Dashboard_name-icon Dashboard_blue"></span>Something to do
              </td>
              <td colSpan="7">
                <div className="Dashboard_gantt-chart">
                  <div className="Dashboard_bar Dashboard_in-progress_1">IN PROGRESS</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                <span className="Dashboard_name-icon Dashboard_orange"></span>From other list
              </td>
              <td colSpan="7">
                <div className="Dashboard_gantt-chart">
                  <div className="Dashboard_bar Dashboard_in-progress_2">IN PROGRESS</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardView;
