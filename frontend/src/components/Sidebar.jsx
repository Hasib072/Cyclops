// src/components/Sidebar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user, onToggle }) => { // Add onToggle prop
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHomeExpanded, setIsHomeExpanded] = useState(true);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);
  const [teams, setTeams] = useState(['Team Name', 'Jason\'s Crew', 'Times Team']);

  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null); // Ref to store the timeout ID

  // Handle clicks outside the sidebar to collapse it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isExpanded) {
          setIsExpanded(false);
          if (onToggle) onToggle(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, onToggle]);

  // Handle adding a new team
  const handleAddTeam = () => {
    const newTeam = prompt('Enter new team name:');
    if (newTeam) {
      setTeams((prevTeams) => [...prevTeams, newTeam]);
    }
  };

  // Toggle Sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) {
      onToggle(!isExpanded);
    }
  };

  // Handle mouse leaving the sidebar
  const handleMouseLeave = () => {
    // Start a 2-second timer to collapse the sidebar
    hoverTimeoutRef.current = setTimeout(() => {
      if (isExpanded) {
        setIsExpanded(false);
        if (onToggle) onToggle(false);
      }
    }, 500); // 1000 milliseconds = 1 seconds
  };

  // Handle mouse entering the sidebar
  const handleMouseEnter = () => {
    // Clear the collapse timer if it exists
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Clear the timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Inline Styles
  const styles = {
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: isExpanded ? '250px' : '80px',
      backgroundColor: '#402b5e',
      color: '#d1c4e9', // Lighter purple for text
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      justifyContent: 'space-between',
      borderRadius: '0px 30px 30px 0px',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      overflow: 'hidden',
      // Remove cursor:pointer to prevent confusion, since interactive elements have their own cursors
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
      marginTop: isExpanded ? '0px' : '18px',
    },
    profileImg: {
      borderRadius: '50%',
      marginRight: isExpanded ? '15px' : '0',
      marginLeft: isExpanded ? '0px' : '-8px',
      width: '50px',
      height: '50px',
      transition: 'margin 0.3s ease',
    },
    profileInfo: {
      display: isExpanded ? 'block' : 'none',
      transition: 'display 0.3s ease',
    },
    menuSection: {
      marginBottom: '30px',
    },
    menuHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    menuTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      display: isExpanded ? 'block' : 'none',
    },
    toggleIcon: {
      width: '20px',
      height: '20px',
      fill: '#d1c4e9',
      cursor: 'pointer',
      display: isExpanded ? 'block' : 'none',
    },
    menuItem: {
      listStyle: 'none',
      marginBottom: '10px',
      marginLeft: '-15px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    svgIcon: {
      width: '22px',
      height: '22px',
      marginRight: isExpanded ? '10px' : '0',
      marginLeft: isExpanded ? '0px' : '-10px',
      fill: '#d1c4e9',
      transition: 'margin 0.3s ease',
    },
    submenu: {
      maxHeight: isHomeExpanded ? '500px' : '0px',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
      marginLeft: '0px',
      marginTop: isExpanded ? '0px' : '28px',
    },
    teamsList: {
      maxHeight: isTeamsExpanded ? '500px' : '0px',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
      marginLeft: '0px',
    },
    addTeamButton: {
      background: 'linear-gradient(90deg, #1f1333 0%, #3a2450 56%, #65387b 100%)',
      color: '#ffffff',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      width: '150%',
      borderRadius: '10px',
      marginTop: '10px',
      marginLeft: '-15px',
      transition: 'background 0.3s ease',
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
    },
    footerItem: {
      listStyle: 'none',
      marginBottom: '15px',
      marginLeft: '-15px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    footerText: {
      display: isExpanded ? 'block' : 'none',
      marginLeft: '8px',
    },
    horizontalLineIcon: {
      width: '20px',
      height: '20px',
      marginLeft: isExpanded ? '0px' : '0px',
      fill: '#d1c4e9',
      cursor: 'pointer',
      display: isExpanded ? 'block' : 'none',
    },
  };

  return (
    <div
      ref={sidebarRef}
      style={styles.sidebar}
      onClick={toggleSidebar} // Toggle sidebar when clicking on the sidebar body
      onMouseLeave={handleMouseLeave} // Handle mouse leaving the sidebar
      onMouseEnter={handleMouseEnter} // Handle mouse entering the sidebar
    >
      {/* Sidebar main content */}
      <div>

        {/* User Profile Section */}
        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={styles.profile}>
            <img
              src={user.profilePicture || 'https://placehold.co/50'}
              alt="Profile"
              style={styles.profileImg}
              onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking on the image
            />
            <div style={styles.profileInfo} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '20px', marginBottom: '5px', color: 'white', marginTop: '20px' }}>{user.name || 'Name Here'}</h2>
              <p style={{ fontSize: '14px', color: 'white' }}>{user.email || 'usermail@gmail.com'}</p>
            </div>
          </div>
        </Link>

        {/* Home Navigation Group */}
        <div style={styles.menuSection}>
          <div style={styles.menuHeader}>
            {/* You can add a section title here if needed */}
          </div>
          <ul style={styles.submenu}>
            <li style={styles.menuItem} onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3z" />
              </svg>
              {isExpanded && <Link to="/dashboard" className='FontBody02' style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>}
            </li>
            <li style={styles.menuItem} onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v2.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {isExpanded && <Link to="/notifications" className='FontBody02' style={{ textDecoration: 'none', color: 'inherit' }}>Notifications</Link>}
            </li>
            <li style={styles.menuItem} onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5c-1.1 0-2 .9-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm0-4H8V7h4v6zm6 4h-4v-4h4v4zm0-6h-4v-2h4v2z" />
              </svg>
              {isExpanded && <Link to="/timesheet" className='FontBody02' style={{ textDecoration: 'none', color: 'inherit' }}>Timesheet</Link>}
            </li>
          </ul>
        </div>

        {/* Teams Navigation Group */}
        <div style={styles.menuSection}>
          <div style={styles.menuHeader}>
            <span style={styles.menuTitle}>Teams</span>
            {/* Toggle Teams Group with Horizontal Line "-" */}
            <svg
              onClick={(e) => {
                e.stopPropagation(); // Prevent sidebar toggle
                setIsTeamsExpanded(!isTeamsExpanded);
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              style={styles.horizontalLineIcon}
            >
              <line x1="5" y1="10" x2="15" y2="10" stroke="#d1c4e9" strokeWidth="2" />
            </svg>
          </div>
          <ul style={styles.teamsList}>
            {teams.map((team, index) => (
              <li key={index} style={styles.menuItem} onClick={(e) => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
                  <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                {isExpanded && <span>{team}</span>}
              </li>
            ))}
            <li style={styles.menuItem} onClick={(e) => e.stopPropagation()}>
              <button onClick={handleAddTeam} style={styles.addTeamButton}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: isExpanded ? '8px' : '0', fill: '#ffffff' }}>
                  <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {isExpanded && 'Add Team'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Links */}
      <div style={styles.footer}>
        <ul>
          <li style={styles.footerItem} onClick={(e) => e.stopPropagation()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
              10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 
              0-8-3.59-8-8s3.59-8 8-8 8 3.59 
              8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 
              8h2v2h-2z" />
            </svg>
            {isExpanded && <span>About us</span>}
          </li>
          <li style={styles.footerItem} onClick={(e) => e.stopPropagation()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
              <path d="M19.14,12.94a7.07,7.07,0,0,0,.06-.94,7.07,7.07,0,0,0-.06-.94l2.11-1.65a.5.5,0,0,0,.12-.63l-2-3.46a.5.5,0,0,0-.61-.22l-2.49,1a7.06,7.06,0,0,0-1.62-.94l-.38-2.65A.5.5,0,0,0,14,3H10a.5.5,0,0,0-.5.43L9.12,6.08a7.06,7.06,0,0,0-1.62.94l-2.49-1a.5.5,0,0,0-.61.22l-2,3.46a.5.5,0,0,0,.12.63L4.86,11a7.07,7.07,0,0,0-.06.94,7.07,7.07,0,0,0,.06.94L2.75,14.59a.5.5,0,0,0-.12.63l2,3.46a.5.5,0,0,0,.61.22l2.49-1a7.06,7.06,0,0,0,1.62.94l.38,2.65a.5.5,0,0,0,.5.43h4a.5.5,0,0,0,.5-.43l.38-2.65a7.06,7.06,0,0,0,1.62-.94l2.49,1a.5.5,0,0,0,.61-.22l2-3.46a.5.5,0,0,0-.12-.63ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            {isExpanded && <span>Settings</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
