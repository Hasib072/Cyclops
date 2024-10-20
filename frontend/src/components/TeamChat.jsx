// frontend/src/components/TeamChat.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useGetMessagesQuery, useSendMessageMutation } from '../slices/workspaceApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Message Bubble Component
const MessageBubble = ({ message, isOwnMessage }) => {
  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

  const profileImageUrl = message.sender.profileImage
    ? message.sender.profileImage.startsWith('data:image/')
      ? message.sender.profileImage
      : `${BACKEND_URL}/${message.sender.profileImage}`
    : 'path_to_default_profile_image.png'; // Replace with a default image path

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
        alt={`${message.sender.name}'s profile`}
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
          backgroundColor: isOwnMessage ? '#4caf50' : '#ffffff',
          color: isOwnMessage ? '#fff' : '#000',
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

const TeamChat = ({ workspaceId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [sendMessage] = useSendMessageMutation();
  const [messages, setMessages] = useState([]);

  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch initial messages
  const { data: fetchedMessages, isLoading, isError, error } = useGetMessagesQuery(workspaceId, {
    // Since the token is in cookies, no need for additional headers
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!workspaceId) return;

    const eventSource = new EventSource(`/api/workspaces/${workspaceId}/updates`, {
      // No need to set headers; cookies are sent automatically with 'credentials: include' in apiSlice
    });

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        setMessages((prev) => [...prev, data.payload]);
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
      toast.success('Message sent!');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message.');
    }
  };

  if (isLoading) return <p>Loading messages...</p>;
  if (isError) return <p>Error loading messages: {error.data?.message || error.error}</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h2>Team Chat</h2>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#e5ddd5',
          borderRadius: '8px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwnMessage={msg.sender._id === userInfo?._id}
          />
        ))}
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
            border: '1px solid #ccc',
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
            backgroundColor: '#4caf50',
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
