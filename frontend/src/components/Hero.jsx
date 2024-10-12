// frontend/src/components/Hero.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import Sidebar from './Sidebar'; // Import the Sidebar component
import staticImagePath from '../assets/helloIMG.png'; // Ensure this path is correct
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Category from './Category';
import EditableText from './EditableText'; // Adjust the path as necessary
import { defaultStages } from '../constants/defaultStages'; // Import default stages
import { defaultStagesByType } from '../constants/defaultStagesByType'; // Import default stages by type

// Import SVG icons as React components
import ListsIcon from '../assets/icons/Lists.svg';
import CalendarIcon from '../assets/icons/Calendar.svg';
import TableIcon  from '../assets/icons/Table.svg';
import ChatIcon from '../assets/icons/Chat.svg';
import GanttIcon from '../assets/icons/Gantt.svg';
import BoardIcon from '../assets/icons/Board.svg';
import TimelineIcon from '../assets/icons/timeline.svg';


// RTK Query Hooks
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useCreateWorkspaceMutation, // Import the mutation hook
  useGetWorkspacesQuery, // Import the getWorkspaces query hook
} from '../slices/usersApiSlice';

// Toast Notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ItemTypes = {
  STAGE: 'stage',
};

const Categories = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  DONE: 'Done',
};

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Create Workspace Modal visibility
  const [isDefineModalOpen, setIsDefineModalOpen] = useState(false); // Define Workspace Modal visibility
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedViews, setSelectedViews] = useState([]);

    // Add this function inside the Hero component
  const handleViewSelection = (view) => {
    setSelectedViews((prevSelected) =>
      prevSelected.includes(view)
        ? prevSelected.filter((v) => v !== view)
        : [...prevSelected, view]
    );
  };


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
        // position: toast.POSITION.TOP_RIGHT,
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

  // State for Workspace Form (Step 1)
  const [workspaceFormStep1, setWorkspaceFormStep1] = useState({
    workspaceTitle: '',
    coverImage: null, // Changed from '' to null to store File object
    workspaceDescription: '',
    invitePeople: '',
  });

  // State for Workspace Type (Step 2)
  const [workspaceType, setWorkspaceType] = useState('');

  // Handle Form Input Changes (Step 1)
  const handleInputChangeStep1 = (e) => {
    const { name, value } = e.target;
    setWorkspaceFormStep1((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle Cover Image Upload (Step 1)
  const handleCoverImageUploadStep1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation for file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only .png, .jpg and .jpeg formats are allowed!', {
          //position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000,
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size exceeds 5MB!', {
          //position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000,
        });
        return;
      }

      setWorkspaceFormStep1((prevState) => ({
        ...prevState,
        coverImage: file,
      }));
    }
  };

  // Handle Form Submission (Step 1 - Navigate to Step 2)
  const handleFormSubmitStep1 = (e) => {
    e.preventDefault();
    // Client-side validation
    if (!workspaceFormStep1.workspaceTitle) {
      toast.error('Workspace title is required!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }
    // Proceed to Step 2
    setIsCreateModalOpen(false);
    setIsDefineModalOpen(true);
  };

  // Handle Workspace Type Selection (Step 2)
  const handleWorkspaceTypeSelect = (type) => {
    setWorkspaceType(type);
    setStagesByType(type);

  };

  
  const handleSaveViews = () => {
    if (selectedViews.length === 0) {
      toast.error('Please select at least one view!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }

    // Optionally, you can perform additional actions here, such as saving the selected views to state or making an API call.

    // Close the Customize Modal and reopen the Define Workspace Modal
    setIsCustomizeModalOpen(false);
    setIsDefineModalOpen(true);
  };

  // Update the handleFinalSubmit function inside the Hero component
  const handleFinalSubmit = async () => {
    if (!workspaceType) {
      toast.error('Please select a workspace type!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }
  
    try {
      // Prepare invitePeople as an array of emails (split by commas)
    const inviteEmails = workspaceFormStep1.invitePeople
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email);

  // Prepare stages as an array of objects
  const preparedStages = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    category: stage.category,
  }));
  
      // Create FormData
      const formData = new FormData();
      formData.append('workspaceTitle', workspaceFormStep1.workspaceTitle);
      formData.append('workspaceType', workspaceType); // Add workspace type
      if (workspaceFormStep1.coverImage) {
        formData.append('coverImage', workspaceFormStep1.coverImage);
      }
      formData.append('workspaceDescription', workspaceFormStep1.workspaceDescription);
      inviteEmails.forEach((email) => formData.append('invitePeople', email));
      formData.append('selectedViews', JSON.stringify(selectedViews)); // Add selected views
      formData.append('stages', JSON.stringify(preparedStages));
  
      // Send the form data via RTK Query mutation
      await createWorkspace(formData).unwrap();
  
      // **Console Logs for Workspace Details**
      console.log('Workspace Title:', workspaceFormStep1.workspaceTitle);
      console.log('Description:', workspaceFormStep1.workspaceDescription);
      console.log('Invited People:', inviteEmails);
      console.log('Cover Image Filename:', workspaceFormStep1.coverImage ? workspaceFormStep1.coverImage.name : 'No cover image');
      console.log('Workspace Type:', workspaceType);
      console.log('Selected Views:', selectedViews);
      console.log('Stages:', preparedStages);
  
      // Reset forms and close modals
      setWorkspaceFormStep1({
        workspaceTitle: '',
        coverImage: null,
        workspaceDescription: '',
        invitePeople: '',
      });
      setWorkspaceType('');
      setSelectedViews([]);
      resetStagesToDefault();
      setStages([]);
      setIsCustomizeModalOpen(false);
      setIsDefineModalOpen(false);
      refetchWorkspaces(); // Refresh workspace list
  
      // Show success notification
      toast.success('Workspace created successfully!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    } catch (err) {
      console.error('Failed to create workspace:', err);
      toast.error(err.data?.message || 'Failed to create workspace', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    }
  };

  // Define default views for each workspace type
  const defaultViewsByType = {
    Starter: ['Lists', 'Board','Table','Chat', 'Timeline'],
    Kanban: ['Board', 'Calendar', 'Timeline', 'Chat'],
    Project: ['Gantt', 'Timeline','Chat'],
    Scrum: ['Gantt', 'Board','Chat'],
    // Add other types and their default views as needed
  };


  // State Variables
  const [isTodoStagesModalOpen, setIsTodoStagesModalOpen] = useState(false);
  const [stages, setStages] = useState(defaultStages); // Initialize with default stages
  const [newStageCounter, setNewStageCounter] = useState(1);

  // Event Handlers
  const openTodoStagesModal = () => {
    setIsTodoStagesModalOpen(true);
  };

  const closeTodoStagesModal = () => {
    setIsTodoStagesModalOpen(false);
  };

  const addStage = (category) => {
    const newStage = {
      id: `stage-${Date.now()}`, // Unique string ID
      name: `New Stage ${newStageCounter}`,
      color: '#7e57c2', // Default color (purple)
      category: category,
    };
    setStages([...stages, newStage]);
    setNewStageCounter(newStageCounter + 1);
    // toast.success(`Stage "${newStage.name}" added to "${category}"!`, {
    //   //position: toast.POSITION.TOP_RIGHT,
    //   autoClose: 3000,
    // });
  };

  const resetStagesToDefault = () => {
    setStages(defaultStages);
    //toast.info('Stages have been reset to default.', {
      //position: toast.POSITION.TOP_RIGHT,
      //autoClose: 3000,
    //});
  };

  const setStagesByType = (type) => {
    if (defaultStagesByType[type]) {
      setStages(defaultStagesByType[type]);
      // toast.success(`Stages set for workspace type "${type}".`, {
      //   //position: toast.POSITION.TOP_RIGHT,
      //   autoClose: 3000,
      // });
    } else {
      setStages(defaultStages); // Fallback to default stages
      // toast.warning(`No predefined stages for "${type}". Using default stages.`, {
      //   //position: toast.POSITION.TOP_RIGHT,
      //   autoClose: 3000,
      // });
    }
  };
  
  

  const handleEditStageName = (id, newName) => {
    // Prevent duplicate stage names
    if (stages.some(stage => stage.name.toLowerCase() === newName.trim().toLowerCase() && stage.id !== id)) {
      toast.error('Stage name already exists!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }

    setStages(stages.map(stage => stage.id === id ? { ...stage, name: newName } : stage));
  };

  const handleChangeStageColor = (id, newColor) => {
    setStages(stages.map(stage => stage.id === id ? { ...stage, color: newColor } : stage));
  };

  const handleDeleteStage = (id) => {
    // Optional: Confirm deletion with the user
    // Commenting out the confirmation as deletion is now handled via drag
    // const confirmDelete = window.confirm('Are you sure you want to delete this stage?');
    // if (!confirmDelete) return;

    setStages(stages.filter((stage) => stage.id !== id));
     //toast.success('Stage deleted successfully!', {
    //   //position: toast.POSITION.TOP_RIGHT,
    //   autoClose: 3000,
     //});
  };

  const moveStage = (id, fromCategory, toCategory) => {
    setStages(stages.map(stage => {
      if (stage.id === id) {
        return { ...stage, category: toCategory };
      }
      return stage;
    }));
  };

  const handleSaveTodoStages = () => {
    // Optional: Validate stages before proceeding
    if (stages.length === 0) {
      toast.error('Please add at least one stage!', {
        //position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }

    // Log the stages for debugging
    console.log('Defined Stages:', stages);

    // Close the Todo Stages Modal
    setIsTodoStagesModalOpen(false);

    // Proceed to finalize workspace creation or navigate as needed
    // For example, you might want to call handleFinalSubmit here or another function
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
              onClick={() => setIsCreateModalOpen(true)} // Open modal on click
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

      {/* Create Workspace Modal (Step 1) */}
      {isCreateModalOpen && (
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
          onClick={() => {
            setIsCreateModalOpen(false);
            // Clear Step 1 Form Data
            setWorkspaceFormStep1({
              workspaceTitle: '',
              coverImage: null,
              workspaceDescription: '',
              invitePeople: '',
            });
          }} // Close modal and clear inputs when clicking outside
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
            <form onSubmit={handleFormSubmitStep1}>
              {/* Workspace Title */}
              <label htmlFor="workspaceTitle" style={{ display: 'block', margin: '10px 0 5px', fontSize: '1.1em', color: 'white' }}>
                Name your workspace
              </label>
              <input
                type="text"
                autoComplete="off"
                id="workspaceTitle"
                name="workspaceTitle"
                placeholder="Workspace Name"
                value={workspaceFormStep1.workspaceTitle}
                onChange={handleInputChangeStep1}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: 'white',
                  marginBottom: '15px',
                }}
              />

              {/* Cover Image Upload */}
              <label
                htmlFor="coverImageUploadStep1"
                style={{
                  display: 'block',
                  margin: '10px 0 5px',
                  fontSize: '1.1em',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cover Image
              </label>
              <div
                style={{
                  width: '100%',
                  height: '150px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: '#565656',
                  backgroundImage: workspaceFormStep1.coverImage
                    ? `url(${URL.createObjectURL(workspaceFormStep1.coverImage)})`
                    : 'url(https://via.placeholder.com/390x150.png?text=Cover+Image)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  marginBottom: '20px',
                }}
                onClick={() => document.getElementById('coverImageUploadStep1').click()} // Open file dialog on click
              >
                {/* Optional: Overlay text */}
                {!workspaceFormStep1.coverImage && (
                  <span style={{ color: '#fff', fontSize: '14px' }}>Click to Upload Cover Image</span>
                )}
                <input
                  type="file"
                  id="coverImageUploadStep1"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageUploadStep1}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Workspace Description */}
              <label htmlFor="workspaceDescription" style={{ display: 'block', margin: '10px 0 5px', fontSize: '1.1em', color: 'white' }}>
                Description <span style={{ fontSize: '10px', color: 'white' }}>(Optional)</span>
              </label>
              <textarea
                id="workspaceDescription"
                name="workspaceDescription"
                placeholder="Provide a short description of the workspace!"
                value={workspaceFormStep1.workspaceDescription}
                onChange={handleInputChangeStep1}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: 'white',
                  height: '80px',
                  resize: 'none',
                  marginBottom: '10px',
                }}
              ></textarea>

              {/* Invite People */}
              <label htmlFor="invitePeople" style={{ display: 'block', margin: '10px 0 5px', fontSize: '1.1em', color: 'white' }}>
                Invite People <span style={{ fontSize: '10px', color: 'white' }}>(Optional)</span>
              </label>
              <input
                type="text"
                autoComplete="off"
                id="invitePeople"
                name="invitePeople"
                placeholder="user1@mail.com, user2@mail.com"
                value={workspaceFormStep1.invitePeople}
                onChange={handleInputChangeStep1}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: 'white',
                  marginBottom: '20px',
                }}
              />

              {/* Next Button */}
              <button
                type="submit"
                className="next-btn"
                style={{
                  background: 'linear-gradient(to right, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '10px 0',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  width: '100%',
                  textAlign: 'center',
                }}
                disabled={isCreatingWorkspace}
              >
                Next
              </button>
            </form>
            {/* Note: Removed Close Button */}
          </div>
        </div>
      )}

      {/* Define Workspace Modal (Step 2) */}
      {isDefineModalOpen && (
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
          onClick={() => {
            setIsDefineModalOpen(false);
            // Clear Step 2 Form Data
            setWorkspaceType('');
          }} // Close modal and clear inputs when clicking outside
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
            <h2 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Define Workspace</h2>
            <p style={{ marginBottom: '10px', fontSize: '12px', color: '#fff' }}>
              Choose a pre-configured solution or customize to your liking with advanced ClickApps, required views, and task statuses.
            </p>

            {/* Workspace Type Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {['Starter', 'Kanban', 'Project', 'Scrum'].map((type) => (
                <div
                  key={type}
                  onClick={() => handleWorkspaceTypeSelect(type)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '60px',
                    background: workspaceType === type ? '#4a2e64' : 'transparent',
                    borderRadius: '20px',
                    border: '2px, solid, #4a2e64',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '5px 10px',
                    color: '#fff',
                    zIndex: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                  }}
                >
                  <h4 style={{ margin: '4px 0' }}>{type}</h4>
                  <p style={{ fontSize: '12px', marginLeft: '4px', color: '#999999', marginBottom: '0' }}>
                    For simple and short use
                  </p>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '8px', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Customize</h3>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
          if (!workspaceType) {
            toast.error('Please select a workspace type!', {
              //position: toast.POSITION.TOP_RIGHT,
              autoClose: 5000,
            });
            return;
          }
          setIsDefineModalOpen(false);
          setSelectedViews(defaultViewsByType[workspaceType] || []); // Set default views based on type
          setIsCustomizeModalOpen(true);
        }}
                style={{
                  background: 'linear-gradient(90deg, rgba(97, 40, 133, 1) 0%, rgba(146, 105, 186, 1) 100%, rgba(208, 182, 244, 1) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '1.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    'linear-gradient(90deg, rgba(97, 40, 133, 1) 0%, rgba(146, 105, 186, 1) 100%, rgba(208, 182, 244, 1) 100%)')
                }
              >
                {/* SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" style={{ width: '20px', height: '20px', marginRight: '4px' }}>
                  <path
                    d="M20.9825 32.445L8.085 22.4175L5.25 24.6225L21 36.8725L36.75 24.6225L33.8975 22.4L20.9825 32.445ZM21 28L33.88 17.9725L36.75 15.75L21 3.5L5.25 15.75L8.1025 17.9725L21 28ZM21 7.9275L31.045 15.75L21 23.5725L10.955 15.75L21 7.9275Z"
                    fill="white"
                  />
                </svg>
                Workspace View
              </button>
              <button
                onClick={openTodoStagesModal}
                style={{
                  background: 'linear-gradient(90deg, rgba(97, 40, 133, 1) 0%, rgba(146, 105, 186, 1) 100%, rgba(208, 182, 244, 1) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '1.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    'linear-gradient(90deg, rgba(97, 40, 133, 1) 0%, rgba(146, 105, 186, 1) 100%, rgba(208, 182, 244, 1) 100%)')
                }
              >
                {/* SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" style={{ width: '20px', height: '20px', marginRight: '4px' }}>
                  <path
                    d="M33.25 8.75V33.25H8.75V8.75H33.25ZM35.175 5.25H6.825C5.95 5.25 5.25 5.95 5.25 6.825V35.175C5.25 35.875 5.95 36.75 6.825 36.75H35.175C35.875 36.75 36.75 35.875 36.75 35.175V6.825C36.75 5.95 35.875 5.25 35.175 5.25V5.25ZM19.25 12.25H29.75V15.75H19.25V12.25ZM19.25 19.25H29.75V22.75H19.25V19.25ZM19.25 26.25H29.75V29.75H19.25V26.25ZM12.25 12.25H15.75V15.75H12.25V12.25ZM12.25 19.25H15.75V22.75H12.25V19.25ZM12.25 26.25H15.75V29.75H12.25V26.25Z"
                    fill="white"
                  />
                </svg>
                Todo Stages
              </button>
              {/* Create Workspace Button inside DefineWorkspaceModal */}
          <button
            onClick={handleFinalSubmit}
            className="next-btn"
            style={{
              background: 'linear-gradient(to right, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignSelf: 'end',
              alignItems: 'center',
              justifyContent: 'center',
              width: '70%',
              margin: '25px 0px 10px',
            }}
            disabled={isCreatingWorkspace || !workspaceType}
          >
            {isCreatingWorkspace ? 'Creating...' : 'Create Workspace'}
          </button>
            </div>
          </div>
        </div>
      )}
      {/* Customize Workspace Views Modal */}
      {isCustomizeModalOpen && (
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
          onClick={() => {
            setIsCustomizeModalOpen(false);
            setSelectedViews([]);
          }} // Close modal and clear inputs when clicking outside
        >
          <div
            style={{
              background: 'linear-gradient(to bottom, #2f263c 0%, #121212 100%)',
              borderRadius: '10px',
              padding: '20px 40px',
              maxWidth: '450px',
              width: '100%',
              height: '500px',
              textAlign: 'left',
              position: 'relative',
              // overflowY: 'auto', // Add scroll if content overflows
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
          >
            <h1 style={{ fontSize: '28px', margin: '10px 0' }}>Define Workspace Views</h1>
            <p style={{ margin: '5px 0 20px 0', fontSize: '14px' }}>
              Choose a pre-configured solution or customize to your liking with
              advanced ClickApps, required views, and task statuses.
            </p>
          
            <div
              className="options"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {[
                { name: 'Lists', icon: ListsIcon },
                { name: 'Calendar', icon: CalendarIcon },
                { name: 'Table', icon: TableIcon },
                { name: 'Chat', icon: ChatIcon },
                { name: 'Gantt', icon: GanttIcon },
                { name: 'Board', icon: BoardIcon },
                { name: 'Timeline', icon: TimelineIcon },
              ].map((view) => (
                <label
                  className="option"
                  key={view.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    background: selectedViews.includes(view.name) ? '#4a2e64' : 'transparent', // Purple background when selected
                    border: selectedViews.includes(view.name) ? '2px solid #945cb7' : '2px solid #622985', // Purple border when selected
                    borderRadius: '10px',
                    padding: '8px 12px', // Increased padding for better touch area
                    fontSize: '17px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  {/* Render the SVG icon using <img> */}
                  <img
                    src={view.icon}
                    alt={`${view.name} Icon`}
                    style={{ width: '20px', height: '20px', marginRight: '8px' }}
                  />
                  <span>{view.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedViews.includes(view.name)}
                    onChange={() => handleViewSelection(view.name)}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      cursor: 'pointer',
                      height: 0,
                      width: 0,
                    }}
                  />
                  {/* Custom Toggle */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      width: '32px',
                      height: '18px',
                      backgroundColor: selectedViews.includes(view.name) ? '#945cb7' : '#b0b0b0',
                      borderRadius: '15px',
                      transition: 'background-color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transform: selectedViews.includes(view.name) ? 'translateX(14px)' : 'translateX(0)',
                        transition: 'transform 0.3s ease',
                      }}
                    ></span>
                  </div>
                </label>
              ))}
            </div>
            
            {/* Save Button */}
            <button
              className="save-btn"
              onClick={handleSaveViews}
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
                position: 'absolute',
                bottom: '20px',
                right: '20px',
              }}
              disabled={isCreatingWorkspace || selectedViews.length === 0}
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <DndProvider backend={HTML5Backend}>
      <div>
      {/* Define Todo Stages Modal */}
      {isTodoStagesModalOpen && (
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
            onClick={closeTodoStagesModal} // Close modal when clicking outside
          >
            <div
              className="container"
              style={{
                background: 'linear-gradient(to bottom, #2f263c 0%, #121212 100%)',
                borderRadius: '10px',
                padding: '20px 40px',
                maxWidth: '450px', // Maintain original width
                width: '100%',
                height: '600px', // Maintain original height
                textAlign: 'left',
                position: 'relative',
                //overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
              <h1>Define Todo Stage</h1>
              <p>
                Customize your Todo Stages. You can add, edit, and rearrange stages as needed.
              </p>

              {/* Removed the Stages Template Section */}

              <div className="content" style={{
                  flex: 1, // Allow the content to grow and fill available space
                  overflowY: 'auto', // Enable vertical scrolling within the content
                  display: 'flex',
                  gap: '30px',
                  position: 'relative',
                  maxHeight: '300px'
                }}
              >
                <div className="right" style={{ width: '80%', padding: 'auto' }}>
                  {/* "Pending" Category */}
                  <Category
                    categoryName={Categories.PENDING}
                    stages={stages.filter(stage => stage.category === Categories.PENDING)}
                    moveStage={moveStage}
                    onEditName={handleEditStageName}
                    onChangeColor={handleChangeStageColor}
                    onDelete={handleDeleteStage}
                    onAddStage={addStage} 
                  />

                  {/* "Active" Category */}
                  <Category
                    categoryName={Categories.ACTIVE}
                    stages={stages.filter(stage => stage.category === Categories.ACTIVE)}
                    moveStage={moveStage}
                    onEditName={handleEditStageName}
                    onChangeColor={handleChangeStageColor}
                    onDelete={handleDeleteStage}
                    onAddStage={addStage} 
                  />

                  {/* "Done / Finished" Category */}
                  <Category
                    categoryName={Categories.DONE}
                    stages={stages.filter(stage => stage.category === Categories.DONE)}
                    moveStage={moveStage}
                    onEditName={handleEditStageName}
                    onChangeColor={handleChangeStageColor}
                    onDelete={handleDeleteStage}
                    onAddStage={addStage} 
                  />
                </div>
              </div>

              {/* Next Button */}
              <button
                className="next-btn"
                onClick={handleSaveTodoStages}
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
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  alignSelf: 'flex-end', // Align the button to the bottom right
                  marginBottom: '10px',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>


      {/* Toast Container for Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Hero;
