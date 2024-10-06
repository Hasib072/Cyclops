// src/components/Hero.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import Sidebar from './Sidebar'; // Import the Sidebar component
import staticImagePath from '../assets/helloIMG.png'; // Ensure this path is correct

// RTK Query Hooks
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} from '../slices/usersApiSlice';

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Sidebar state

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  // Fetching Profile Data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch,
  } = useGetProfileQuery();

  // Mutation for Updating Profile
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // State for Profile Info
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    jobRole: '',
    city: '',
    country: '',
    gitHubLink: '',
    linkedInLink: '',
  });

  useEffect(() => {
    if (profile) {
      console.log('Profile Data: ', profile); // Debugging line
      setProfileFormData({
        name: profile.user?.name || '',
        email: profile.user?.email || '',
        companyName: profile.companyName || '',
        jobRole: profile.jobRole || '',
        city: profile.city || '',
        country: profile.country || '',
        gitHubLink: profile.gitHubLink || '',
        linkedInLink: profile.linkedInLink || '',
      });
    }
  }, [profile]);

  // State for Active Tab
  const [activeTab, setActiveTab] = useState('recentlyVisited');

  // Sample Workspace Data (Replace with actual data or API calls)
  const workspaces = [
    {
      id: 1,
      title: 'Material UI',
      lastEdited: 'Edited 5hrs ago',
      image: 'https://via.placeholder.com/200x100',
      avatars: [
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
      ],
    },
    {
      id: 2,
      title: 'UI/UX Case Study',
      lastEdited: 'Edited 5hrs ago',
      image: 'https://via.placeholder.com/200x100',
      avatars: [],
    },
    {
      id: 3,
      title: 'Grocery App',
      lastEdited: 'Edited 5hrs ago',
      image: 'https://via.placeholder.com/200x100',
      avatars: [
        'https://via.placeholder.com/30',
        'https://via.placeholder.com/30',
      ],
    },
    // Add more workspaces as needed
  ];

  // Filter workspaces based on active tab (placeholder logic)
  const filteredWorkspaces = workspaces; // Replace with actual filtering based on activeTab

  // Get Backend URL from Environment Variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Construct the full profile image URL
  const profileImageUrl = profile?.profileImage ? `${BACKEND_URL}/${profile.profileImage}` : null;

  return (
    <div style={{
      display: 'flex',
      fontFamily: '"Open Sans", sans-serif',
      backgroundColor: '#121212',
      color: '#fff',
      minHeight: '100vh'
    }}>
      {/* Sidebar */}
      {userInfo && (
        <Sidebar
          user={userInfo}
          profileImage={profileImageUrl}
          onToggle={handleSidebarToggle}
          isExpanded={isSidebarExpanded}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0',
          transition: 'margin 0.3s ease',
          padding: '20px',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px',
          display: 'flex',
          justifyContent: 'flex-start', // Changed from 'space-between' to 'flex-start'
          alignItems: 'center',
          backgroundColor: '#121212',
          marginBottom: '14px',
          gap: '40px', // Added gap between user-info and actions
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            color: '#4a2e64',
            padding: '4px',
            borderRadius: '10px',
            width: 'fit-content',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              marginRight: '30px',
            }}>
              <h1 style={{
                margin: '0',
                fontSize: '34px',
                fontWeight: 'bolder',
                paddingLeft: '20px',
              }}>
                {profileFormData.name ? `Hello ${profileFormData.name}!` : 'Hello User!'}
              </h1>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: 'bold',
                paddingLeft: '20px',
              }}>
                {profileFormData.name ? "It's good to see you again." : ''}
              </p>
            </div>
            {/* Static Image */}
            <img src={staticImagePath} alt="User Avatar" style={{
              width: '350px',
              height: '160px',
              objectFit: 'cover',
            }} />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
                border: 'none',
                padding: '12px 12px',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                width: '300px',
              }}
              onClick={() => navigate('/add-workspace')} // Adjust navigation as needed
            >
              {/* SVG Icon */}
              <svg
                width="35"
                height="35"
                viewBox="0 0 61 61"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '14px' }}
              >
                <g clipPath="url(#clip0_127_988)">
                  <path
                    d="M25.4168 10.1665H10.1668C7.371 10.1665 5.10891 12.454 5.10891 15.2498L5.0835 45.7498C5.0835 48.5457 7.371 50.8332 10.1668 50.8332H50.8335C53.6293 50.8332 55.9168 48.5457 55.9168 45.7498V20.3332C55.9168 17.5373 53.6293 15.2498 50.8335 15.2498H30.5002L25.4168 10.1665Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_127_988">
                    <rect width="61" height="61" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                ADD WORKSPACE
                <p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: 'normal' }}>
                  Create a new Workspace
                </p>
              </div>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
                border: 'none',
                padding: '12px 12px',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                width: '300px',
              }}
              onClick={() => navigate('/join-workspace')} // Adjust navigation as needed
            >
              {/* SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" style={{ width: '35px', height: '35px', marginRight: '14px' }}>
                <path
                  d="M24.1667 7.25016H14.5001L12.7963 5.54641C12.3372 5.08725 11.7209 4.8335 11.0805 4.8335H4.83341C3.50425 4.8335 2.42883 5.921 2.42883 7.25016L2.41675 21.7502C2.41675 23.0793 3.50425 24.1668 4.83341 24.1668H24.1667C25.4959 24.1668 26.5834 23.0793 26.5834 21.7502V9.66683C26.5834 8.33766 25.4959 7.25016 24.1667 7.25016ZM18.1251 10.8752C19.4542 10.8752 20.5417 11.9627 20.5417 13.2918C20.5417 14.621 19.4542 15.7085 18.1251 15.7085C16.7959 15.7085 15.7084 14.621 15.7084 13.2918C15.7084 11.9627 16.7959 10.8752 18.1251 10.8752ZM22.9584 20.5418H13.2917V19.3335C13.2917 17.7264 16.518 16.9168 18.1251 16.9168C19.7322 16.9168 22.9584 17.7264 22.9584 19.3335V20.5418Z"
                  fill="white"
                />
              </svg>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                JOIN WORKSPACE
                <p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: 'normal' }}>
                  Join a workspace of another user
                </p>
              </div>
            </button>
          </div>
        </div>

        <hr style={{ borderColor: '#444' }} />

        {/* Workspaces Section */}
        <div style={{ padding: '20px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <button
              id="recentlyVisited"
              onClick={() => setActiveTab('recentlyVisited')}
              style={{
                background: activeTab === 'recentlyVisited' ? '#444' : 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '13px',
                padding: '8px',
                borderRadius: '5px',
              }}
            >
              Recently Visited
            </button>
            <button
              id="myWorkspace"
              onClick={() => setActiveTab('myWorkspace')}
              style={{
                background: activeTab === 'myWorkspace' ? '#444' : 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '13px',
                padding: '8px',
                borderRadius: '5px',
              }}
            >
              My Workspace
            </button>
            <button
              id="sharedWorkspace"
              onClick={() => setActiveTab('sharedWorkspace')}
              style={{
                background: activeTab === 'sharedWorkspace' ? '#444' : 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '13px',
                padding: '8px',
                borderRadius: '5px',
              }}
            >
              Shared Workspace
            </button>
          </div>

          {/* Grid Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
            }}>
            {filteredWorkspaces.map((workspace) => (
              <div key={workspace.id} style={{
                backgroundColor: '#121212',
                borderRadius: '10px',
                padding: '10px',
                position: 'relative',
                width: '100%',
              }}>
                <img
                  src={workspace.image}
                  alt={workspace.title}
                  style={{
                    width: '100%',
                    height: '130px',
                    borderRadius: '5px',
                    objectFit: 'cover',
                  }}
                />
                <h3 style={{
                  margin: '10px 0 5px',
                  fontSize: '14px',
                }}>
                  {workspace.title}
                </h3>
                <small style={{
                  color: '#fff',
                  opacity: '30%',
                  fontSize: '12px',
                  position: 'absolute',
                  bottom: '-15px',
                  marginBottom: '10px',
                }}>
                  {workspace.lastEdited}
                </small>
                {workspace.avatars.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '4px',
                    display: 'flex',
                  }}>
                    {workspace.avatars.map((avatarUrl, index) => (
                      <img
                        key={index}
                        src={avatarUrl}
                        alt={`User ${index + 1}`}
                        style={{
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          marginLeft: '-6px',
                          border: '2px solid #121212',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
