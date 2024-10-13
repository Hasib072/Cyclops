// frontend/src/screens/WorkSpaceScreen.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader'; // Import the Loader component

// RTK Query Hooks
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useLogoutMutation,
    useCreateWorkspaceMutation, // Import the mutation hook
    useGetWorkspacesQuery, // Import the getWorkspaces query hook
    useGetWorkspaceByIdQuery,
  } from '../slices/usersApiSlice';


const WorkSpaceScreen = () => {

    // Extract workspace ID from URL parameters
    const { id: workspaceId } = useParams();

    // required for Sidebar
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
    } = useGetWorkspaceByIdQuery(workspaceId, {
      skip: !workspaceId, // Skip the query if workspaceId is not present
    });

    // Effect to log workspace details when data is fetched
    useEffect(() => {
      if (workspace) {
        console.log('Workspace Details:', workspace);
      } else{
        console.log('Workspace Details: Not Found')
      }
    }, [workspace]);
    

  // State to manage active menu item
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  
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

  // Inline styles
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
    menuLinkHover: {
      backgroundColor: '#3a3a3a',
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
    filterButtonHover: {
      background: 'linear-gradient(to right, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
      color: 'white',
    },
    buttonContainer: {
      display: isToggleVisible ? 'flex' : 'none',
      marginTop: '10px',
      transition: 'max-height 0.3s ease',
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
    customButtonHover: {
      background: 'linear-gradient(to right, #2a1a41 0%, #4a2e64 56%, #945cb7 100%)',
      color: 'white',
    },
    lineBelow: {
      border: '1px solid #fff',
      marginTop: '10px',
      padding: '0px',
      display: isToggleVisible ? 'block' : 'none',
    },
    buttonContainerInvisible: {
      display: 'none',
    },
    buttonContainerShow: {
      display: 'flex',
    },
  };

  // Menu items with labels and SVG icons
  const menuItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M4.5 14.625H11.25C11.8687 14.625 12.375 14.1187 12.375 13.5V4.5C12.375 3.88125 11.8687 3.375 11.25 3.375H4.5C3.88125 3.375 3.375 3.88125 3.375 4.5V13.5C3.375 14.1187 3.88125 14.625 4.5 14.625ZM4.5 23.625H11.25C11.8687 23.625 12.375 23.1187 12.375 22.5V18C12.375 17.3813 11.8687 16.875 11.25 16.875H4.5C3.88125 16.875 3.375 17.3813 3.375 18V22.5C3.375 23.1187 3.88125 23.625 4.5 23.625ZM15.75 23.625H22.5C23.1187 23.625 23.625 23.1187 23.625 22.5V13.5C23.625 12.8813 23.1187 12.375 22.5 12.375H15.75C15.1313 12.375 14.625 12.8813 14.625 13.5V22.5C14.625 23.1187 15.1313 23.625 15.75 23.625ZM14.625 4.5V9C14.625 9.61875 15.1313 10.125 15.75 10.125H22.5C23.1187 10.125 23.625 9.61875 23.625 9V4.5C23.625 3.88125 23.1187 3.375 22.5 3.375H15.75C15.1313 3.375 14.625 3.88125 14.625 4.5Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'List',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 2 22 22"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M3.5 15.1665H5.83333V12.8332H3.5V15.1665ZM3.5 19.8332H5.83333V17.4998H3.5V19.8332ZM3.5 10.4998H5.83333V8.1665H3.5V10.4998ZM8.16667 15.1665H24.5V12.8332H8.16667V15.1665ZM8.16667 19.8332H24.5V17.4998H8.16667V19.8332ZM8.16667 8.1665V10.4998H24.5V8.1665H8.16667Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'Board',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 26"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M3.5 14.625C5.7375 14.625 6.75 13.6125 6.75 12.375C6.75 11.1375 5.7375 10.125 4.5 10.125C3.2625 10.125 2.25 11.1375 2.25 12.375C2.25 13.6125 3.2625 14.625 4.5 14.625ZM5.77125 15.8625C5.355 15.795 4.93875 15.75 4.5 15.75C3.38625 15.75 2.32875 15.9862 1.3725 16.4025C0.54 16.7625 0 17.5725 0 18.4838V20.25H5.0625V18.4387C5.0625 17.505 5.32125 16.6275 5.77125 15.8625ZM22.5 14.625C23.7375 14.625 24.75 13.6125 24.75 12.375C24.75 11.1375 23.7375 10.125 22.5 10.125C21.2625 10.125 20.25 11.1375 20.25 12.375C20.25 13.6125 21.2625 14.625 22.5 14.625ZM27 18.4838C27 17.5725 26.46 16.7625 25.6275 16.4025C24.6713 15.9862 23.6138 15.75 22.5 15.75C22.0613 15.75 21.645 15.795 21.2288 15.8625C21.6788 16.6275 21.9375 17.505 21.9375 18.4387V20.25H27V18.4838ZM18.27 15.3562C16.9538 14.7712 15.3337 14.3438 13.5 14.3438C11.6663 14.3438 10.0463 14.7825 8.73 15.3562C7.515 15.8962 6.75 17.1112 6.75 18.4387V20.25H20.25V18.4387C20.25 17.1112 19.485 15.8962 18.27 15.3562ZM9.07875 18C9.18 17.7413 9.225 17.5613 10.1025 17.2238C11.1937 16.7963 12.3413 16.5938 13.5 16.5938C14.6587 16.5938 15.8063 16.7963 16.8975 17.2238C17.7638 17.5613 17.8088 17.7413 17.9212 18H9.07875ZM13.5 9C14.1187 9 14.625 9.50625 14.625 10.125C14.625 10.7438 14.1187 11.25 13.5 11.25C12.8813 11.25 12.375 10.7438 12.375 10.125C12.375 9.50625 12.8813 9 13.5 9ZM13.5 6.75C11.0138 6.75 9 8.51375 9 10.125C9 11.4862 11.0138 13.5 13.5 13.5C15.3675 13.5 16.875 11.4862 16.875 10.125C16.875 8.51375 15.3675 6.75 13.5 6.75Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'Gantt Chart',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M15.75 19.125H4.5V21.375H15.75V19.125ZM22.5 10.125H4.5V12.375H22.5V10.125ZM4.5 16.875H22.5V14.625H4.5V16.875ZM4.5 5.625V7.875H22.5V5.625H4.5Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'Map',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M19.125 3.375H7.875C6.6375 3.375 5.625 4.3875 5.625 5.625V23.625C5.625 24.8625 6.6375 25.875 7.875 25.875H22.5C23.7375 25.875 24.75 24.8625 24.75 23.625V5.625C24.75 4.3875 23.7375 3.375 22.5 3.375ZM21.375 23.625H5.625C5.00625 23.625 4.5 23.1187 4.5 22.5V9H22.5V22.5C22.5 23.1187 21.9937 23.625 21.375 23.625Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'Calendar',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M13.5 6.6375C14.805 6.6375 15.8625 7.695 15.8625 9C15.8625 10.305 14.805 11.3625 13.5 11.3625C12.195 11.3625 11.1375 10.305 11.1375 9C11.1375 7.695 12.195 6.6375 13.5 6.6375ZM13.5 16.7625C16.8413 16.7625 20.3625 18.405 20.3625 19.125V20.3625H6.6375V19.125C6.6375 18.405 10.1588 16.7625 13.5 16.7625ZM13.5 4.5C14.1187 4.5 14.625 4.50625 14.625 5.125C14.625 5.74375 14.1187 6.25 13.5 6.25C12.8813 6.25 12.375 5.74375 12.375 5.125C12.375 4.50625 12.8813 4.5 13.5 4.5ZM13.5 14.625C10.4963 14.625 6.5 16.1325 6.5 19.125V22.5H22.5V19.125C22.5 16.1325 18.5037 14.625 15.5 14.625Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      label: 'Repository',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 26 26"
          style={{ width: '18px', height: '18px', marginRight: '5px' }}
        >
          <path
            d="M15.75 1.125H11.25C10.6312 1.125 10.125 1.63125 10.125 2.25C10.125 2.86875 10.6312 3.375 11.25 3.375H15.75C16.3687 3.375 16.875 2.86875 16.875 2.25C16.875 1.63125 16.3687 1.125 15.75 1.125ZM13.5 15.75C14.1187 15.75 14.625 15.2437 14.625 14.625V10.125C14.625 9.50625 14.1187 9 13.5 9C12.8812 9 12.375 9.50625 12.375 10.125V14.625C12.375 15.2437 12.8812 15.75 13.5 15.75ZM21.4087 8.31375L22.2525 7.47C22.68 7.0425 22.6912 6.33375 22.2525 5.895L22.2412 5.88375C21.8025 5.445 21.105 5.45625 20.6662 5.88375L19.8225 6.7275C18.0787 5.3325 15.885 4.5 13.5 4.5C8.09999 4.5 3.50999 8.955 3.37499 14.355C3.22874 20.07 7.80749 24.75 13.5 24.75C19.1025 24.75 23.625 20.2162 23.625 14.625C23.625 12.24 22.7925 10.0462 21.4087 8.31375ZM13.5 22.5C9.14624 22.5 5.62499 18.9788 5.62499 14.625C5.62499 10.2712 9.14624 6.75 13.5 6.75C17.8537 6.75 21.375 10.2712 21.375 14.625C21.375 18.9788 17.8537 22.5 13.5 22.5Z"
            fill="white"
          />
        </svg>
      ),
    },
  ];

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
            <p>Error loading workspace: {workspaceError.data?.message || workspaceError.error}</p>
            </div>
          ) : workspace ? (
            <>
            
        <div style={{
          flex: 1,
          marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0',
          transition: 'margin 0.3s ease',
          padding: '20px',
        }}>
          {/* Workspace Name */}
          <h1 style={styles.workspaceName}>{workspace?.workspaceTitle || 'Workspace Name'}</h1>

          {/* Navigation */}
          <div style={styles.nav}>
            {/* Menu */}
            <ul style={styles.menu}>
              {menuItems.map((item) => (
                <li key={item.label} style={styles.menuItem}>
                  <a
                    href="#"
                    style={{
                      ...styles.menuLink,
                      ...(activeMenuItem === item.label
                        ? styles.activeMenuLink
                        : {}),
                    }}
                    onClick={() => handleMenuClick(item.label)}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Filter Button */}
            <button
              style={styles.filterButton}
              onClick={handleFilterClick}
            >
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
          <div
            style={{
              ...styles.lineBelow,
              display: isToggleVisible ? 'block' : 'none',
            }}
          ></div>
        </div>
          </>
            ) : (
            <p>No workspace data available.</p>
          )}
      </div>
    </div>
  );
};

export default WorkSpaceScreen;
