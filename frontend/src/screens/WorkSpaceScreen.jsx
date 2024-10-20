// frontend/src/screens/WorkSpaceScreen.jsx

import React, { useState, useEffect, useRef} from 'react';
import { useDispatch } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader'; // Import the Loader component
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TodoListView from '../components/TodoListView'; // Import the TodoListView component
import TodoBoardView from '../components/TodoBoardView';
import TodoTableView from '../components/TodoTableView';


// RTK Query Hooks
import {
  useGetProfileQuery,
} from '../slices/usersApiSlice'; // Import only useGetProfileQuery from usersApiSlice
import {
  useGetWorkspaceByIdQuery,
} from '../slices/workspaceApiSlice'; // Corrected to import useGetWorkspaceByIdQuery from workspaceApiSlice

// Import SVG Icons
import ListsIcon from '../assets/icons/Lists.svg';
import CalendarIcon from '../assets/icons/Calendar.svg';
import TableIcon from '../assets/icons/Table.svg';
import ChatIcon from '../assets/icons/Chat.svg';
import GanttIcon from '../assets/icons/Gantt.svg';
import BoardIcon from '../assets/icons/Board.svg';
import TimelineIcon from '../assets/icons/timeline.svg';
import DashboardIcon from '../assets/icons/Dashboard.svg';
import MapIcon from '../assets/icons/Map.svg';
import TeamsIcon from '../assets/icons/Teams.svg';
import RepositoryIcon from '../assets/icons/Repository.svg';

// Define a mapping from view labels to their respective icons
const iconMap = {
  Dashboard: DashboardIcon,
  Lists: ListsIcon, // Ensure "Lists" matches the label in selectedViews
  Calendar: CalendarIcon,
  Table: TableIcon,
  Chat: ChatIcon,
  'Gantt Chart': GanttIcon,
  Board: BoardIcon,
  Timeline: TimelineIcon,
  Map: MapIcon,
  Teams: TeamsIcon,
  Repository: RepositoryIcon,
};

const WorkSpaceScreen = () => {
  // Extract workspace ID from URL parameters
  const { id: workspaceId } = useParams();

  // Required for Sidebar
  const { userInfo } = useSelector((state) => state.auth);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Sidebar state

  const isDataURL = (str) => /^data:image\/[a-z]+;base64,/.test(str); // Helper function to determine if a string is a data URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Get Backend URL from Environment Variable

  // Fetching Profile Data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Construct the full profile image URL
  const profileImageUrl = profile?.profileImage
    ? isDataURL(profile.profileImage)
      ? profile.profileImage // Use data URL directly
      : `${BACKEND_URL}/${profile.profileImage}` // Prepend backend URL for server-hosted images
    : null;

  // Handle Sidebar Toggle
  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  // Fetch workspace data using RTK Query
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceByIdQuery(workspaceId, {
    skip: !workspaceId, // Skip the query if workspaceId is not present
  });


  // Effect to log workspace details when data is fetched
  useEffect(() => {
    if (workspace) {
      console.log('Workspace Details:', workspace);
      console.log('Selected Views:', workspace.selectedViews);
      console.log('Lists:', workspace.lists);
    } else {
      console.log('Workspace Details: Not Found');
    }
  }, [workspace]);

  // State to manage active menu item
  const [activeMenuItem, setActiveMenuItem] = useState('Lists');

  // State to manage visibility of toggle-container and line-below
  const [isToggleVisible, setIsToggleVisible] = useState(false);

  // Handler for menu item click
  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Handler for filter button click
  const handleFilterClick = () => {
    setIsToggleVisible(!isToggleVisible);
  };

  const dispatch = useDispatch(); // If you need to dispatch actions
  const eventSourceRef = useRef(null); // Use useRef to store the EventSource instance

  useEffect(() => {
    if (workspaceId) {
      const eventSource = new EventSource(`/api/workspaces/${workspaceId}/updates`);
      eventSourceRef.current = eventSource;
  
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerEvent(data);
      };
  
      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource.close();
      };
  
      return () => {
        eventSource.close();
      };
    }
  }, [workspaceId]);
  
  const handleServerEvent = (data) => {
    switch (data.type) {
      case 'TASK_UPDATED':
      case 'TASK_ADDED':
      case 'TASK_DELETED':
      case 'LIST_UPDATED':
      case 'LIST_COLOR_UPDATED':
      case 'LIST_ADDED':
      case 'LIST_DELETED':
      case 'LISTS_REORDERED':
      case 'WORKSPACE_UPDATED':
      case 'MEMBER_ADDED':
      case 'MEMBER_REMOVED':
        refetchWorkspace();
        break;
      case 'WORKSPACE_DELETED':
        // Handle workspace deletion (e.g., navigate away)
        navigate('/workspaces');
        break;
      default:
        break;
    }
  };

  // Inline styles (optional, consider using CSS modules or styled-components)
  const styles = {
    body: {
      margin: 0,
      fontFamily: '"Open Sans", sans-serif',
      backgroundColor: '#121212',
      color: 'white',
    },
    container: {
      padding: '20px',
      margin: '10px 30px',
      display: 'flex',
      position: 'relative',
    },
    mainContent: {
      marginLeft: '60px', // Adjusted for sidebar width + margins
      width: '100%',
    },
    workspaceName: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 2px 0',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #fff',
      paddingBottom: '2px',
      position: 'relative',
    },
    menu: {
      display: 'flex',
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    menuItem: {
      marginRight: '4px',
      position: 'relative',
    },
    menuLink: {
      color: '#fff',
      position: 'relative',
      textDecoration: 'none',
      fontSize: '14px',
      padding: '8px 10px',
      borderRadius: '0px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.3s ease',
    },
    activeMenuLink: {
      borderBottom: '3px solid #945cb7', // Purple underline
    },
    filterButton: {
      marginRight: '2%',
      marginBottom: '2px',
      border: '2px solid #fff',
      backgroundColor: 'transparent',
      color: '#fff',
      padding: '8px 40px',
      borderRadius: '20px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background 0.3s ease, color 0.3s ease',
    },
    customButton: {
      backgroundColor: 'transparent',
      border: '2px solid white',
      margin: '0px 8px',
      padding: '2px 12px',
      fontSize: '14px',
      color: 'white',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    },
    lineBelow: {
      border: '1px solid #fff',
      marginTop: '10px',
      padding: '0px',
      display: isToggleVisible ? 'block' : 'none',
    },
    buttonContainer: {
      display: isToggleVisible ? 'flex' : 'none',
      marginTop: '10px',
      transition: 'max-height 0.3s ease',
    },
  };

  // Define default menu items
  const defaultStartMenuItems = [
    { label: 'Dashboard', icon: DashboardIcon },
  ];
  const defaultEndMenuItems = [
    { label: 'Map', icon: MapIcon },
    { label: 'Teams', icon: TeamsIcon },
    { label: 'Repository', icon: RepositoryIcon },
  ];

  // Generate additional menu items from selectedViews, excluding defaults
  const additionalMenuItems = workspace?.selectedViews
    ? workspace.selectedViews
        .filter(
          (view) => !defaultStartMenuItems.some((defaultItem) => defaultItem.label === view)
        )
        .map((view) => ({
          label: view,
          icon: iconMap[view] || ListsIcon, // Default to ListsIcon if no match found
        }))
    : [];

  // Combine default and additional menu items
  const dynamicMenuItems = [...defaultStartMenuItems, ...additionalMenuItems, ...defaultEndMenuItems];

  return (
    <div style={styles.body}>
      <div style={styles.container}>
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
        {/* Handle loading and error states for workspace data */}
        {isWorkspaceLoading ? (
          <div
            style={{
              flex: 1,
              marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0',
              transition: 'margin 0.3s ease',
              padding: '20px',
            }}
          >
            <Loader />
          </div>
        ) : workspaceError ? (
          <div
            style={{
              flex: 1,
              marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0',
              transition: 'margin 0.3s ease',
              padding: '20px',
            }}
          >
            <p>
              Error loading workspace: {workspaceError.data?.message || workspaceError.error}
            </p>
          </div>
        ) : workspace ? (
          <div
            style={{
              flex: 1,
              marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0',
              transition: 'margin 0.3s ease',
              padding: '20px',
            }}
          >
            {/* Workspace Name */}
            <h1 style={styles.workspaceName}>{workspace?.workspaceTitle || 'Workspace Name'}</h1>

            {/* Navigation */}
            <div style={styles.nav}>
              {/* Menu */}
              <ul style={styles.menu}>
                {dynamicMenuItems.map((item, index) => (
                  <li key={`${item.label}-${index}`} style={styles.menuItem}>
                    <a
                      href="#"
                      style={{
                        ...styles.menuLink,
                        ...(activeMenuItem === item.label ? styles.activeMenuLink : {}),
                      }}
                      onClick={() => handleMenuClick(item.label)}
                    >
                      <img
                        src={item.icon}
                        alt={`${item.label} Icon`}
                        style={{ width: '18px', height: '18px', marginRight: '5px' }}
                      />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Filter Button */}
              <button style={styles.filterButton} onClick={handleFilterClick}>
                {isToggleVisible ? 'Hide' : 'Filter'}
              </button>
            </div>

            {/* Toggle Container */}
            <div
              style={{
                ...styles.buttonContainer,
                display: isToggleVisible ? 'flex' : 'none',
              }}
            >
              <button style={styles.customButton}>Expand All</button>
              <button style={styles.customButton}>Sort</button>
              <button style={styles.customButton}>Assigned</button>
              <button style={styles.customButton}>Closed</button>
            </div>

            {/* Line Below */}
            <div style={styles.lineBelow}></div>

            {/* Render components based on active menu item */}
            {activeMenuItem === 'Lists' && (
              <>
                <DndProvider backend={HTML5Backend}>
                  <TodoListView
                    stages={workspace.stages || []}
                    lists={workspace.lists || []}
                    workspaceId={workspace._id}
                    members={workspace.members || []}
                  />
                </DndProvider>
              </>
            )}
            {activeMenuItem === 'Board' && (
              <DndProvider backend={HTML5Backend}>
                <TodoBoardView
                  stages={workspace.stages || []}
                  lists={workspace.lists || []}
                  workspaceId={workspace._id}
                  members={workspace.members || []}
                />
              </DndProvider>
            )}
            {activeMenuItem === 'Table' && (
              <TodoTableView
                stages={workspace.stages || []}
                lists={workspace.lists || []}
                workspaceId={workspace._id}
                members={workspace.members || []}
              />
            )}
            {/* Placeholder for other menu items */}
            {!['Lists', 'Board', 'Table'].includes(activeMenuItem) && (
              <p>Content for {activeMenuItem} will go here.</p>
            )}
          </div>
        ) : (
          <p>No workspace data available.</p>
        )}
      </div>
    </div>
  );
};

export default WorkSpaceScreen;
