// frontend/src/components/Maps.jsx

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Loader from './Loader';
import { useDispatch } from 'react-redux';
import {
  useGetMindMapQuery,
  useAddNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  useAddEdgeMutation,
  useDeleteEdgeMutation,
} from '../slices/workspaceApiSlice';

import { setMindMap } from '../slices/mindMapSlice';
import { v4 as uuidv4 } from 'uuid';

import NodeDetailsModal from './NodeDetailsModal';
import CustomNode from './CustomNode'; // Import the custom node component

const nodeTypes = {
  custom: CustomNode, // Define the custom node type
};

const Maps = ({ workspaceId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Fetch mind map data from the backend
  const { data: mindMapData, isLoading, isSuccess, error } = useGetMindMapQuery(workspaceId);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // RTK Query mutations
  const [addNodeMutation] = useAddNodeMutation();
  const [updateNodeMutation] = useUpdateNodeMutation();
  const [deleteNodeMutation] = useDeleteNodeMutation();
  const [addEdgeMutation] = useAddEdgeMutation();
  const [deleteEdgeMutation] = useDeleteEdgeMutation();

  // Modal state
  const [selectedNode, setSelectedNode] = useState(null);

  // Handle deleting a node
  const handleDeleteNode = useCallback(
    async (nodeId) => {
      // Optimistically remove the node from local state
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

      try {
        await deleteNodeMutation({ workspaceId, nodeId }).unwrap();
        // Optionally, show a success notification
      } catch (error) {
        console.error('Failed to delete node:', error);
        // Optionally, refetch mind map or revert the state
      }
    },
    [deleteNodeMutation, workspaceId, setNodes, setEdges],
  );

  // Initialize nodes and edges when data is fetched
  useEffect(() => {
    if (isSuccess && mindMapData) {
      const flowNodes = mindMapData.nodes.map((node) => ({
        id: node.id,
        type: 'custom', // Use the custom node type
        data: { 
          label: node.label,
          onDelete: handleDeleteNode, // Pass the delete handler to the node
        },
        position: node.position,
        style: { background: node.color, borderRadius: '10px' }, // Ensure background is set
      }));

      const flowEdges = mindMapData.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      dispatch(setMindMap({ nodes: flowNodes, edges: flowEdges }));
    }
  }, [isSuccess, mindMapData, setNodes, setEdges, dispatch, handleDeleteNode]);

  // Handle connecting nodes (adding edges)
  const onConnectHandler = useCallback(
    async (params) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);

      try {
        await addEdgeMutation({
          workspaceId,
          edgeData: {
            source: params.source,
            target: params.target,
          },
        }).unwrap();
        // Optionally, show a success notification
      } catch (error) {
        console.error('Failed to add edge:', error);
        // Optionally, revert the local state if mutation fails
        setEdges((eds) => eds.filter((e) => e.id !== params.id));
        // Optionally, show an error notification
      }
    },
    [addEdgeMutation, edges, workspaceId, setEdges],
  );

  // Handle node drag stop (updating node position)
  const onNodeDragStopHandler = useCallback(
    async (event, node) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)),
      );

      try {
        await updateNodeMutation({
          workspaceId,
          nodeId: node.id,
          nodeData: { position: node.position },
        }).unwrap();
        // Optionally, show a success notification
      } catch (error) {
        console.error('Failed to update node position:', error);
        // Optionally, revert the position if mutation fails
      }
    },
    [updateNodeMutation, workspaceId, setNodes],
  );

  // Handle node click (for editing)
  const onNodeClickHandler = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [],
  );

  // Handle saving node details from the modal
  const handleModalSave = async (updatedNode) => {
    setSelectedNode(null);

    try {
      await updateNodeMutation({
        workspaceId,
        nodeId: updatedNode.id,
        nodeData: {
          label: updatedNode.data.label,
          color: updatedNode.style.background,
        },
      }).unwrap();

      // Update local state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === updatedNode.id
            ? { 
                ...n, 
                data: { label: updatedNode.data.label, onDelete: handleDeleteNode }, 
                style: { background: updatedNode.style.background, borderRadius: '10px' } 
              }
            : n,
        ),
      );
      // Optionally, show a success notification
    } catch (error) {
      console.error('Failed to update node:', error);
      // Optionally, handle the error (e.g., show a notification)
    }
  };

  // Handle adding a new node
  const addNewNode = async () => {
    const newNodeId = uuidv4();
    const newNode = {
      id: newNodeId,
      type: 'custom', // Use the custom node type
      data: { 
        label: 'New Node',
        onDelete: handleDeleteNode, // Pass the delete handler
      },
      position: { x: 250, y: 250 },
      style: { background: '#737373',borderRadius: '10px' }, // Default color
    };

    // Update local state
    setNodes((nds) => [...nds, newNode]);

    // Send to backend
    try {
      await addNodeMutation({
        workspaceId,
        nodeData: {
          id: newNode.id, // Ensure the backend uses the same ID
          label: newNode.data.label,
          position: newNode.position,
          color: newNode.style.background,
        },
      }).unwrap();
      // Optionally, show a success notification
    } catch (error) {
      console.error('Failed to add node:', error);
      // Optionally, remove the node from local state if mutation fails
      setNodes((nds) => nds.filter((n) => n.id !== newNodeId));
      // Optionally, show an error notification
    }
  };

  
  

  // Real-Time Updates via SSE
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
    const { token } = userInfo || {}; // Extract token from userInfo

    const eventSource = new EventSource(
      `${BACKEND_URL}/api/workspaces/${workspaceId}/updates?token=${token}`
    );

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case 'NODE_ADDED':
          setNodes((nds) => [
            ...nds,
            {
              id: data.payload.id,
              type: 'custom',
              data: { 
                label: data.payload.label,
                onDelete: handleDeleteNode,
              },
              position: data.payload.position,
              style: { background: data.payload.color || '#737373', borderRadius: '10px' },
            },
          ]);
          break;
        case 'NODE_UPDATED':
          setNodes((nds) =>
            nds.map((node) =>
              node.id === data.payload.id
                ? { 
                    ...node, 
                    data: { label: data.payload.label, onDelete: handleDeleteNode }, 
                    style: { background: data.payload.color || '#737373', borderRadius: '10px' } 
                  }
                : node,
            ),
          );
          break;
        case 'NODE_DELETED':
          setNodes((nds) => nds.filter((node) => node.id !== data.payload.nodeId));
          setEdges((eds) => eds.filter((edge) => edge.source !== data.payload.nodeId && edge.target !== data.payload.nodeId));
          break;
        case 'EDGE_ADDED':
          setEdges((eds) => [
            ...eds,
            {
              id: data.payload.id,
              source: data.payload.source,
              target: data.payload.target,
              animated: true,
            },
          ]);
          break;
        case 'EDGE_UPDATED':
          setEdges((eds) =>
            eds.map((edge) =>
              edge.id === data.payload.id
                ? { ...edge, source: data.payload.source, target: data.payload.target }
                : edge,
            ),
          );
          break;
        case 'EDGE_DELETED':
          setEdges((eds) => eds.filter((edge) => edge.id !== data.payload.edgeId));
          break;
        default:
          break;
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [workspaceId, setNodes, setEdges, handleDeleteNode]);

  if (isLoading) return <div><Loader/></div>;
  if (error) return <div>Error loading mind map: {error.data?.message || error.error}</div>;

  return (
    <div style={{ width: '87vw', height: '77vh' }}>
      <button
        onClick={addNewNode}
        style={{
          position: 'absolute',
          zIndex: 4,
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: '#402b5e',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Add Node
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes} // Pass the custom node types
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        onNodeDragStop={onNodeDragStopHandler}
        onNodeClick={onNodeClickHandler}
        deleteKeyCode={46} // 'delete'-key
        fitView
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'custom') return '#737373';
            return '#555';
          }}
          nodeColor={(n) => {
            if (n.type === 'custom') return n.style.background || '#737373';
            return '#fff';
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {selectedNode && (
        <NodeDetailsModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Maps;
