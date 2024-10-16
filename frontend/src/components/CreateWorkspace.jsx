// frontend/src/components/CreateWorkspace.jsx

import React, { useState } from 'react';
import { useCreateWorkspaceMutation } from '../slices/workspaceApiSlice';

const CreateWorkspace = () => {
  const [workspaceTitle, setWorkspaceTitle] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceType, setWorkspaceType] = useState('Starter');
  const [selectedViews, setSelectedViews] = useState(['List View']);
  const [invitePeople, setInvitePeople] = useState('');
  const [stages, setStages] = useState([
    { id: uuidv4(), name: 'Not Started', color: '#ff5722', category: 'Pending' },
    { id: uuidv4(), name: 'Active', color: '#3f51b5', category: 'Active' },
    { id: uuidv4(), name: 'Done', color: '#4caf50', category: 'Done' },
  ]);
  const [lists, setLists] = useState([
    { _id: uuidv4(), name: 'Default List', description: '', tasks: [] },
  ]);

  const [createWorkspace, { isLoading, error }] = useCreateWorkspaceMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data
    const workspaceData = {
      workspaceTitle,
      workspaceDescription,
      workspaceType,
      selectedViews: JSON.stringify(selectedViews),
      invitePeople: JSON.stringify(invitePeople.split(',').map(email => email.trim())),
      stages: JSON.stringify(stages),
      lists: JSON.stringify(lists),
    };

    try {
      const createdWorkspace = await createWorkspace(workspaceData).unwrap();
      // Handle success (e.g., redirect to workspace page)
      console.log('Workspace created:', createdWorkspace);
    } catch (err) {
      // Error handling is managed by the `error` from the hook
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Workspace Title:</label>
        <input
          type="text"
          value={workspaceTitle}
          onChange={(e) => setWorkspaceTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Workspace Description:</label>
        <textarea
          value={workspaceDescription}
          onChange={(e) => setWorkspaceDescription(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label>Workspace Type:</label>
        <select value={workspaceType} onChange={(e) => setWorkspaceType(e.target.value)}>
          <option value="Starter">Starter</option>
          <option value="Kanban">Kanban</option>
          <option value="Project">Project</option>
          <option value="Scrum">Scrum</option>
        </select>
      </div>
      <div>
        <label>Selected Views (comma separated):</label>
        <input
          type="text"
          value={selectedViews.join(', ')}
          onChange={(e) => setSelectedViews(e.target.value.split(',').map(view => view.trim()))}
          required
        />
      </div>
      <div>
        <label>Invite People (comma separated emails):</label>
        <input
          type="text"
          value={invitePeople}
          onChange={(e) => setInvitePeople(e.target.value)}
        />
      </div>
      <div>
        <label>Stages:</label>
        {stages.map((stage, index) => (
          <div key={stage.id}>
            <input
              type="text"
              placeholder="Stage Name"
              value={stage.name}
              onChange={(e) => {
                const newStages = [...stages];
                newStages[index].name = e.target.value;
                setStages(newStages);
              }}
              required
            />
            <input
              type="color"
              value={stage.color}
              onChange={(e) => {
                const newStages = [...stages];
                newStages[index].color = e.target.value;
                setStages(newStages);
              }}
              required
            />
            <select
              value={stage.category}
              onChange={(e) => {
                const newStages = [...stages];
                newStages[index].category = e.target.value;
                setStages(newStages);
              }}
              required
            >
              <option value="Not Started">Not Started</option>
              <option value="Active">Active</option>
              <option value="Done">Done</option>
              <option value="Pending">Pending</option>
            </select>
            {/* Optionally, add a button to remove a stage */}
          </div>
        ))}
        {/* Optionally, add a button to add a new stage */}
      </div>
      <div>
        <label>Lists:</label>
        {lists.map((list, index) => (
          <div key={list._id}>
            <input
              type="text"
              placeholder="List Name"
              value={list.name}
              onChange={(e) => {
                const newLists = [...lists];
                newLists[index].name = e.target.value;
                setLists(newLists);
              }}
              required
            />
            <textarea
              placeholder="List Description"
              value={list.description}
              onChange={(e) => {
                const newLists = [...lists];
                newLists[index].description = e.target.value;
                setLists(newLists);
              }}
            ></textarea>
            {/* Optionally, add a button to remove a list */}
          </div>
        ))}
        {/* Optionally, add a button to add a new list */}
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Workspace'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.data?.message || error.error}</p>}
    </form>
  );
};

export default CreateWorkspace;
