// frontend/src/components/Hero.jsx

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
  useCreateWorkspaceMutation, // Import the mutation hook
  useGetWorkspacesQuery, // Import the getWorkspaces query hook
} from '../slices/usersApiSlice';

// Optional: Import toast notifications for user feedback
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to determine if a string is a data URL
const isDataURL = (str) => /^data:image\/[a-z]+;base64,/.test(str);

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout Mutation
  const [logoutApiCall] = useLogoutMutation();

  // Sidebar and Modal States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Sidebar state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  // Create Workspace Mutation
  const [createWorkspace, { isLoading: isCreatingWorkspace }] = useCreateWorkspaceMutation();

  // Handle Logout
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || 'Failed to logout', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    }
  };

  // Handle Sidebar Toggle
  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  // Fetching Profile Data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
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

  // Fetching Workspaces
  const {
    data: workspacesData,
    isLoading: isWorkspacesLoading,
    error: workspacesError,
    refetch: refetchWorkspaces,
  } = useGetWorkspacesQuery();

  // State for Workspaces
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    if (workspacesData) {
      setWorkspaces(workspacesData);
    }
  }, [workspacesData]);

  // State for Active Tab
  const [activeTab, setActiveTab] = useState('recentlyVisited');

  // Get Backend URL from Environment Variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Construct the full profile image URL
  const profileImageUrl = profile?.profileImage
    ? isDataURL(profile.profileImage)
      ? profile.profileImage // Use data URL directly
      : `${BACKEND_URL}/${profile.profileImage}` // Prepend backend URL for server-hosted images
    : null;

  // State for Workspace Form
  const [workspaceForm, setWorkspaceForm] = useState({
    workspaceTitle: '',
    coverImage: null, // Changed from '' to null to store File object
    workspaceDescription: '',
    invitePeople: '',
  });

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkspaceForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle Cover Image Upload
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation for file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only .png, .jpg and .jpeg formats are allowed!');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size exceeds 5MB!');
        return;
      }

      setWorkspaceForm((prevState) => ({
        ...prevState,
        coverImage: file,
      }));
    }
  };

  // Handle Form Submission
const handleFormSubmit = async (e) => {
  e.preventDefault();
  try {
    const { workspaceTitle, coverImage, workspaceDescription, invitePeople } = workspaceForm;

    // Client-side validation
    if (!workspaceTitle) {
      toast.error('Workspace title is required!', { /* ... */ });
      return;
    }

    // Prepare invitePeople as an array of emails (split by commas)
    const inviteEmails = invitePeople
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);

    // Create FormData
    const formData = new FormData();
    formData.append('workspaceTitle', workspaceTitle);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    formData.append('workspaceDescription', workspaceDescription);
    inviteEmails.forEach((email) => formData.append('invitePeople', email));

    // Send the form data via RTK Query mutation
    await createWorkspace(formData).unwrap();

    // Reset form and close modal
    setWorkspaceForm({
      workspaceTitle: '',
      coverImage: null,
      workspaceDescription: '',
      invitePeople: '',
    });
    setIsModalOpen(false);
    refetchWorkspaces(); // Refresh workspace list

    // Show success notification
    toast.success('Workspace created successfully!', { /* ... */ });
  } catch (err) {
    console.error('Failed to create workspace:', err);
    toast.error(err.data?.message || 'Failed to create workspace', { /* ... */ });
  }
};


  return (
    <div
      style={{
        display: 'flex',
        fontFamily: '"Open Sans", sans-serif',
        backgroundColor: '#121212',
        color: '#fff',
        minHeight: '100vh',
      }}
    >
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
        <div
          style={{
            padding: '14px',
            display: 'flex',
            justifyContent: 'flex-start', // Changed from 'space-between' to 'flex-start'
            alignItems: 'center',
            backgroundColor: '#121212',
            marginBottom: '14px',
            gap: '40px', // Added gap between user-info and actions
          }}
        >
          {/* User Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              color: '#4a2e64',
              padding: '4px',
              borderRadius: '10px',
              width: 'fit-content',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginRight: '30px',
              }}
            >
              <h1
                style={{
                  margin: '0',
                  fontSize: '34px',
                  fontWeight: 'bolder',
                  paddingLeft: '20px',
                }}
              >
                {profileFormData.name ? `Hello ${profileFormData.name}!` : 'Hello User!'}
              </h1>
              <p
                style={{
                  margin: '0',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  paddingLeft: '20px',
                }}
              >
                {profileFormData.name ? "It's good to see you again." : ''}
              </p>
            </div>
            {/* Static Image */}
            <img
              src={staticImagePath}
              alt="User Avatar"
              style={{
                width: '350px',
                height: '160px',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
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
              onClick={() => setIsModalOpen(true)} // Open modal on click
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 26 26"
                style={{ width: '35px', height: '35px', marginRight: '14px' }}
              >
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

        <hr style={{ borderColor: '#A5A5A5', opacity: '20%' }} />

        {/* Workspaces Section */}
        <div style={{ padding: '10px', marginTop: '-15px' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
            }}
          >
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                style={{
                  backgroundColor: '#121212',
                  borderRadius: '10px',
                  padding: '10px',
                  position: 'relative',
                  width: '100%',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/workspace/${workspace._id}`)} // Navigate to workspace detail
              >
                <img
                  src={
                    workspace.coverImage
                      ? isDataURL(workspace.coverImage)
                        ? workspace.coverImage // Use data URL directly
                        : `${BACKEND_URL}/${workspace.coverImage}` // Prepend backend URL for server-hosted images
                      : `${BACKEND_URL}/uploads/workspaces/defaultCover.png` // Use default image if coverImage is empty
                  }
                  alt={workspace.workspaceTitle}
                  style={{
                    width: '100%',
                    height: '130px',
                    borderRadius: '5px',
                    objectFit: 'cover',
                  }}
                />
                <h3
                  style={{
                    margin: '10px 0 5px',
                    fontSize: '14px',
                  }}
                >
                  {workspace.workspaceTitle}
                </h3>
                <small
                  style={{
                    color: '#fff',
                    opacity: '30%',
                    fontSize: '12px',
                    position: 'absolute',
                    bottom: '-15px',
                    marginBottom: '10px',
                  }}
                >
                  {new Date(workspace.creationDateTime).toLocaleString()}
                </small>
                {workspace.members?.length > 0 && ( // Safeguard against undefined members
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '4px',
                      display: 'flex',
                    }}
                  >
                    {workspace.members.map((member, index) => (
                      <img
                        key={index}
                        src={
                          member.user.profileImage
                            ? isDataURL(member.user.profileImage)
                              ? member.user.profileImage // Use data URL directly
                              : `${BACKEND_URL}/${member.user.profileImage}` // Prepend backend URL for server-hosted images
                            : 'https://via.placeholder.com/30'
                        }
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

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)} // Close modal when clicking outside the form
        >
          <div
            style={{
              background: 'linear-gradient(to bottom, #2f263c 0%, #121212 100%)',
              padding: '25px 20px',
              borderRadius: '10px',
              width: '390px',
              color: '#fff',
              height: 'auto',
              textAlign: 'left',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
          >
            <h2 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Create Workspace</h2>
            <p style={{ marginBottom: '10px', fontSize: '12px', color: '#fff' }}>
              A Space represents teams, departments, or groups,<br />each with its own Lists, workflows, and settings.
            </p>
            <form onSubmit={handleFormSubmit}>
              {/* Workspace Title & Cover Image */}
              <label htmlFor="workspaceTitle" style={{ display: 'flex', alignItems: 'center', margin: '10px 5px', fontSize: '1.1em', color: 'white' }}>
                Name your workspace
              </label>
              <div style={{ display: 'flex', alignItems: 'center', margin: '10px 5px' }}>
                <input
                  type="text"
                  id="workspaceTitle"
                  name="workspaceTitle"
                  placeholder="Workspace Name"
                  value={workspaceForm.workspaceTitle}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '70%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: 'none',
                    outline: 'none',
                    color: '#999999',
                    backgroundColor: 'white',
                  }}
                />
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  style={{
                    width: '30%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: 'none',
                    outline: 'none',
                    color: '#999999',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Workspace Description */}
              <label htmlFor="workspaceDescription" style={{ display: 'flex', alignItems: 'center', margin: '10px 5px', fontSize: '1.1em', color: 'white' }}>
                Description
                <span style={{ fontSize: '10px', color: 'white', marginLeft: '4px' }}>(Optional)</span>
              </label>
              <textarea
                id="workspaceDescription"
                name="workspaceDescription"
                placeholder="Provide a short description of the workspace!"
                value={workspaceForm.workspaceDescription}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  color: '#999999',
                  backgroundColor: 'white',
                  height: '80px',
                  resize: 'none',
                  marginBottom: '10px',
                }}
              ></textarea>

              {/* Invite People */}
              <label htmlFor="invitePeople" style={{ display: 'flex', alignItems: 'center', margin: '10px 5px', fontSize: '1.1em', color: 'white' }}>
                Invite People
                <span style={{ fontSize: '10px', color: 'white', marginLeft: '4px' }}>(Optional)</span>
              </label>
              <input
                type="text"
                id="invitePeople"
                name="invitePeople"
                placeholder="user1@mail.com, user2@mail.com"
                value={workspaceForm.invitePeople}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  color: '#999999',
                  backgroundColor: 'white',
                  marginBottom: '20px',
                }}
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="next-btn"
                style={{
                  background: 'linear-gradient(to right, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '10px 60px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  width: '100%',
                  textAlign: 'center',
                }}
                disabled={isCreatingWorkspace}
              >
                {isCreatingWorkspace ? 'Creating...' : 'Create Workspace'}
              </button>
            </form>
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
