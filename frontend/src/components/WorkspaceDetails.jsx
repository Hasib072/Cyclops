// frontend/src/components/WorkspaceDetails.jsx

import React from 'react';
import { useGetWorkspaceByIdQuery, useAddListToWorkspaceMutation, useDeleteListFromWorkspaceMutation } from '../slices/workspaceApiSlice';
import { v4 as uuidv4 } from 'uuid';
import TodoListView from './TodoListView'; // Assuming this component handles lists and tasks

const WorkspaceDetails = ({ workspaceId }) => {
  const { data: workspace, isLoading, error } = useGetWorkspaceByIdQuery(workspaceId);
  const [addListToWorkspace] = useAddListToWorkspaceMutation();
  const [deleteListFromWorkspace] = useDeleteListFromWorkspaceMutation();

  const handleAddList = async () => {
    const listName = prompt('Enter list name:');
    if (!listName) return;

    try {
      await addListToWorkspace({ workspaceId, name: listName, description: '' }).unwrap();
      // Workspace data is refetched automatically
    } catch (err) {
      console.error(err);
      alert(err.data?.message || 'Failed to add list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteListFromWorkspace({ workspaceId, listId }).unwrap();
        // Workspace data is refetched automatically
      } catch (err) {
        console.error(err);
        alert(err.data?.message || 'Failed to delete list');
      }
    }
  };

  if (isLoading) return <p>Loading workspace...</p>;
  if (error) return <p>Error loading workspace: {error.data?.message || error.error}</p>;

  return (
    <div>
      <h1>{workspace.workspaceTitle}</h1>
      <p>{workspace.workspaceDescription}</p>
      {/* Display Stages and Lists */}
      <button onClick={handleAddList}>Add New List</button>
      {workspace.lists.map((list) => (
        <div key={list._id}>
          <h2>{list.name}</h2>
          <button onClick={() => handleDeleteList(list._id)}>Delete List</button>
          {/* Render TodoListView or a similar component to manage tasks within the list */}
          <TodoListView workspaceId={workspaceId} list={list} />
        </div>
      ))}
    </div>
  );
};

export default WorkspaceDetails;
