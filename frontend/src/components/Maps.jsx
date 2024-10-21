// frontend/src/components/Maps.jsx

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

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

const Maps = ({ workspaceId }) => {
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

  // Initialize nodes and edges when data is fetched
  useEffect(() => {
    if (isSuccess && mindMapData) {
      const flowNodes = mindMapData.nodes.map((node) => ({
        id: node.id,
        data: { label: node.label },
        position: node.position,
        style: { background: node.color },
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
  }, [isSuccess, mindMapData, setNodes, setEdges, dispatch]);

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
      } catch (error) {
        console.error('Failed to add edge:', error);
        // Optionally, revert the local state if mutation fails
        setEdges((eds) => eds.filter((e) => e.id !== params.id));
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
      } catch (error) {
        console.error('Failed to update node position:', error);
        // Optionally, revert the position if mutation fails
      }
    },
    [updateNodeMutation, workspaceId, setNodes],
  );

  // Handle element removal (nodes or edges)
  const onRemoveHandler = useCallback(
    async (elementsToRemove) => {
      const nodesToRemove = elementsToRemove.filter((el) => el.position); // Nodes have position
      const edgesToRemove = elementsToRemove.filter((el) => el.source && el.target); // Edges have source and target

      // Update local state
      setNodes((nds) => nds.filter((n) => !nodesToRemove.find((r) => r.id === n.id)));
      setEdges((eds) => eds.filter((e) => !edgesToRemove.find((r) => r.id === e.id)));

      // Delete nodes
      for (const node of nodesToRemove) {
        try {
          await deleteNodeMutation({ workspaceId, nodeId: node.id }).unwrap();
        } catch (error) {
          console.error('Failed to delete node:', error);
          // Optionally, revert the node removal in local state
        }
      }

      // Delete edges
      for (const edge of edgesToRemove) {
        try {
          await deleteEdgeMutation({ workspaceId, edgeId: edge.id }).unwrap();
        } catch (error) {
          console.error('Failed to delete edge:', error);
          // Optionally, revert the edge removal in local state
        }
      }
    },
    [deleteNodeMutation, deleteEdgeMutation, workspaceId, setNodes, setEdges],
  );

  // Handle node click (for editing)
  const onNodeClickHandler = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [],
  );

  // Handle edge click (optional: for editing edges)
  const onEdgeClickHandler = useCallback(
    (event, edge) => {
      // Implement edge editing if needed
      console.log('Edge clicked:', edge);
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
            ? { ...n, data: { label: updatedNode.data.label }, style: { background: updatedNode.style.background } }
            : n,
        ),
      );
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
      data: { label: 'New Node' },
      position: { x: 250, y: 250 },
      style: { background: '#ffffff' },
    };

    // Update local state
    setNodes((nds) => [...nds, newNode]);

    // Send to backend
    try {
      await addNodeMutation({
        workspaceId,
        nodeData: {
          label: newNode.data.label,
          position: newNode.position,
          color: newNode.style.background,
        },
      }).unwrap();
    } catch (error) {
      console.error('Failed to add node:', error);
      // Optionally, remove the node from local state if mutation fails
      setNodes((nds) => nds.filter((n) => n.id !== newNodeId));
    }
  };

  // Real-Time Updates via SSE
  useEffect(() => {
    const eventSource = new EventSource(`/api/workspaces/${workspaceId}/updates`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case 'NODE_ADDED':
          setNodes((nds) => [
            ...nds,
            {
              id: data.payload.id,
              data: { label: data.payload.label },
              position: data.payload.position,
              style: { background: data.payload.color },
            },
          ]);
          break;
        case 'NODE_UPDATED':
          setNodes((nds) =>
            nds.map((node) =>
              node.id === data.payload.id
                ? { ...node, data: { label: data.payload.label }, style: { background: data.payload.color } }
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
  }, [workspaceId, setNodes, setEdges]);

  if (isLoading) return <div>Loading Mind Map...</div>;
  if (error) return <div>Error loading mind map: {error.data?.message || error.error}</div>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={addNewNode}
        style={{ position: 'absolute', zIndex: 4, padding: '10px', margin: '10px' }}
      >
        Add Node
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        onNodeDragStop={onNodeDragStopHandler}
        onRemove={onRemoveHandler} // Updated prop
        onNodeClick={onNodeClickHandler} // Updated prop
        onEdgeClick={onEdgeClickHandler} // Optional: Handle edge clicks
        deleteKeyCode={46} // 'delete'-key
      >
        <Controls />
        <MiniMap />
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
