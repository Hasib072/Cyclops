// frontend/src/constants/defaultStages.js

export const defaultStages = [
    {
      id: `stage-${Date.now()}-open`,
      name: 'Open',
      color: '#7e57c2', // Purple
      category: 'Pending',
    },
    {
      id: `stage-${Date.now()}-in-progress`,
      name: 'In Progress',
      color: '#42a5f5', // Blue
      category: 'Active',
    },
    {
      id: `stage-${Date.now()}-review`,
      name: 'Review',
      color: '#fdd835', // Yellow
      category: 'Active',
    },
    {
      id: `stage-${Date.now()}-done`,
      name: 'Done',
      color: '#d4d4d4', // Grey
      category: 'Done',
    },
  ];
  