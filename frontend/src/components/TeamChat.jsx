// frontend/src/components/TeamChat.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSendMessageMutation, useGetMessagesQuery } from '../slices/workspaceApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import './TeamChat.css';
import Loader from './Loader';

// MessageBubble Component as defined earlier
const MessageBubble = ({ message, sender, isOwnMessage }) => {
  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

  const profileImageUrl = sender.profileImage
    ? sender.profileImage.startsWith('data:image/')
      ? sender.profileImage
      : `${BACKEND_URL}/${sender.profileImage}`
    : '/assets/default-profile.png'; // Ensure this path is correct

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: '10px',
      }}
    >
      <img
        src={profileImageUrl}
        alt={`${sender.name}'s profile`}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          marginRight: isOwnMessage ? '0' : '10px',
          marginLeft: isOwnMessage ? '10px' : '0',
        }}
      />
      <div
        style={{
          backgroundColor: isOwnMessage ? '#382251' : '#2f2f2f',
          color: isOwnMessage ? '#fff' : '#fff',
          padding: '10px 15px',
          borderRadius: '15px',
          maxWidth: '60%',
        }}
      >
        <p style={{ margin: 0 }}>{message.content}</p>
        <span style={{ fontSize: '0.8em', color: isOwnMessage ? '#e0e0e0' : '#757575' }}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const TeamChat = ({ workspaceId, members }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [sendMessage] = useSendMessageMutation();
  const [messages, setMessages] = useState([]);

  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Create a map from user ID to user object for quick lookup
  const userMap = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.user._id] = member.user;
    });
    return map;
  }, [members]);

  // Fetch initial messages
  const { data: fetchedMessages, isLoading, isError, error } = useGetMessagesQuery(workspaceId, {
    // No need for additional headers; cookies are included automatically
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!workspaceId) return;

    // Initialize EventSource
    const eventSource = new EventSource(`/api/workspaces/${workspaceId}/updates`, {
      withCredentials: true, // Ensures cookies are sent
    });

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerEvent(data);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
      toast.error('Real-time updates lost.');
    };

    return () => {
      eventSource.close();
    };
  }, [workspaceId]);

  const handleServerEvent = (data) => {
    switch (data.type) {
      case 'NEW_MESSAGE':
        setMessages((prev) => [...prev, data.payload]);
        break;
      case 'MEMBER_REMOVED':
        // Handle member removal (e.g., update members list or show notification)
        toast.info(`Member with ID ${data.payload.userId} has been removed.`);
        break;
      // Handle other event types as needed
      default:
        console.warn('Unhandled SSE event type:', data.type);
    }
  };

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await sendMessage({ workspaceId, content: newMessage.trim() }).unwrap();
      setNewMessage('');
      // toast.success('Message sent!');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err?.data?.message || 'Failed to send message.');
    }
  };

  if (isLoading) return <div><Loader/></div>;
  if (isError) return <p>Error loading messages: {error.data?.message || error.error}</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '76vh',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#121212',
      }}
    >
      {/* <h2>Team Chat</h2> */}
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#121212',
          borderRadius: '8px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg) => {
          const sender = userMap[msg.sender._id];
          if (!sender) {
            console.warn(`Sender with ID ${msg.sender._id} not found in members.`);
            return null; // Or render a placeholder
          }

          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              sender={sender}
              isOwnMessage={msg.sender._id === userInfo?._id}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '20px',
            border: '2px solid #8159ad',
            backgroundColor: '#121212',
            color: 'white',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: '#8159ad',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
