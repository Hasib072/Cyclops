// frontend/src/constants/defaultStagesByType.js

export const defaultStagesByType = {
    Starter: [
      {
        id: `stage-${Date.now()}-open`,
        name: 'Open',
        color: '#7e57c2',
        category: 'Pending',
      },
      {
        id: `stage-${Date.now()}-in-progress`,
        name: 'In Progress',
        color: '#42a5f5',
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-review`,
        name: 'Review',
        color: '#fdd835',
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-done`,
        name: 'Done',
        color: '#d4d4d4',
        category: 'Done',
      },
    ],
    Kanban: [
      {
        id: `stage-${Date.now()}-backlog`,
        name: 'Backlog',
        color: '#ff9800', // Orange
        category: 'Pending',
      },
      {
        id: `stage-${Date.now()}-in-progress`,
        name: 'In Progress',
        color: '#2196f3', // Blue
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-review`,
        name: 'Review',
        color: '#ffeb3b', // Yellow
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-done`,
        name: 'Done',
        color: '#4caf50', // Green
        category: 'Done',
      },
    ],
    Project: [
      {
        id: `stage-${Date.now()}-planning`,
        name: 'Planning',
        color: '#9c27b0', // Purple
        category: 'Pending',
      },
      {
        id: `stage-${Date.now()}-execution`,
        name: 'Execution',
        color: '#3f51b5', // Indigo
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-monitoring`,
        name: 'Monitoring',
        color: '#00bcd4', // Cyan
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-closure`,
        name: 'Closure',
        color: '#8bc34a', // Light Green
        category: 'Done',
      },
    ],
    Scrum: [
      {
        id: `stage-${Date.now()}-product-backlog`,
        name: 'Product Backlog',
        color: '#ff5722', // Deep Orange
        category: 'Pending',
      },
      {
        id: `stage-${Date.now()}-sprint-backlog`,
        name: 'Sprint Backlog',
        color: '#3f51b5', // Indigo
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-in-progress`,
        name: 'In Progress',
        color: '#2196f3', // Blue
        category: 'Active',
      },
      {
        id: `stage-${Date.now()}-done`,
        name: 'Done',
        color: '#4caf50', // Green
        category: 'Done',
      },
    ],
    // Add other types and their default stages as needed
  };
  