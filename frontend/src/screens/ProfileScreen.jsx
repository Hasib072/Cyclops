// frontend/src/screens/ProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// RTK Query Hooks
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../slices/usersApiSlice';

// Redux Actions
import { logout } from '../slices/authSlice';

// Custom Components
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth); // Get user info from Redux

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

  // State for Images
  const [profileImage, setProfileImage] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);

  // State for Sidebar expansion
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleCloseModal = () => setShowEditModal(false);
  const handleShowModal = () => setShowEditModal(true);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap(); // Ensure logout action is properly handled
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  useEffect(() => {
    if (profile) {
      console.log('Profile Data: ', profile); // Debugging line
      console.log('Profile Image Path: ', profile.profileImage);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (name === 'profileImage') {
      setProfileImage(files[0]);
    } else if (name === 'profileBanner') {
      setProfileBanner(files[0]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('name', profileFormData.name);
    formData.append('companyName', profileFormData.companyName);
    formData.append('jobRole', profileFormData.jobRole);
    formData.append('city', profileFormData.city);
    formData.append('country', profileFormData.country);
    formData.append('gitHubLink', profileFormData.gitHubLink);
    formData.append('linkedInLink', profileFormData.linkedInLink);

    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    if (profileBanner) {
      formData.append('profileBanner', profileBanner);
    }

    try {
      const updatedProfile = await updateProfile(formData).unwrap();
      toast.success('Profile updated successfully');
      handleCloseModal();
      refetch();
      // Reset image states
      setProfileImage(null);
      setProfileBanner(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Inline Styles
  const styles = {
    container: {
      display: 'flex',
    },
    mainContent: {
      marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0', // Adjust based on sidebar
      transition: 'margin 0.3s ease',
      width: '100%',
      padding: '20px',
      backgroundColor: '#121212',
      minHeight: '100vh',
      color: 'white',
    },
    profileCard: {
      width: '80%',
      margin: '30px auto',
      borderRadius: '20px',
      backgroundColor: '#302f2f',
      overflow: 'hidden',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '350px',
    },
    banner: {
      height: '200px', // Same as HTML
      width: '100%',
      borderRadius: '20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#444', // Fallback color
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    uploadBannerButton: {
      background: 'transparent',
      border: 'none',
      color: '#a7a7a7',
      fontSize: '28px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBannerText: {
      marginRight: '10px',
    },
    uploadBannerIcon: {
      width: '30px',
      height: '30px',
      marginLeft: '4px',
      fontWeight: 'normal',
    },
    profileInfo: {
      padding: '20px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      backgroundColor: '#302f2f',
      height: 'auto',
    },
    photoUpload: {
      marginLeft: '6%',
      marginRight: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '-7%',
    },
    photoImage: {
      width: '100px',
      height: '100px',
      // cursor: 'pointer',
      borderRadius: '20px',
      backgroundColor: '#565656',
      objectFit: 'cover',
    },
    editProfileButton: {
      background: 'transparent',
      border: '2px solid #8a8a8a',
      color: '#8a8a8a',
      padding: '4px 10px',
      fontSize: '12px',
      borderRadius: '16px',
      cursor: 'pointer',
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.3s ease',
    },
    editProfileButtonHover: {
      backgroundColor: 'rgba(138, 138, 138, 0.1)',
    },
    editProfileIcon: {
      width: '16px',
      height: '16px',
      marginRight: '6px',
    },
    details: {
      flexGrow: 1,
      color: '#ccc',
      textAlign: 'left',
    },
    name: {
      fontSize: '24px',
      color: '#fff',
      marginBottom: '8px',
      fontWeight: 'bold',
    },
    job: {
      fontSize: '14px',
      color: '#fff',
      marginBottom: '8px',
    },
    location: {
      fontSize: '14px',
      color: '#fff',
      marginBottom: '8px',
    },
    socialIcons: {
      display: 'flex',
      marginRight: '2.5%',
      marginTop: '-6.5%',
      alignItems: 'center',
    },
    socialIcon: {
      fontSize: '18px',
      color: '#888',
      textDecoration: 'none',
      marginLeft: '4px',
      transition: 'color 0.3s ease',
    },
    socialIconHover: {
      color: '#fff',
    },
    signOutButton: {
      backgroundColor: 'transparent',
      border: '3px solid #c54848',
      color: '#c54848',
      padding: '4px 10px',
      fontSize: '12px',
      borderRadius: '16px',
      cursor: 'pointer',
      position: 'absolute',
      bottom: '5.5%',
      right: '4.5%',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.3s ease',
    },
    signOutButtonHover: {
      backgroundColor: 'rgba(197, 72, 72, 0.1)',
    },
    signOutIcon: {
      width: '16px',
      height: '16px',
      marginRight: '6px',
    },
  };

  // Get Backend URL from Environment Variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {userInfo && <Sidebar user={userInfo} onToggle={handleSidebarToggle} />}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {isProfileLoading ? (
          <Loader />
        ) : profileError ? (
          <p style={{ color: 'red' }}>{profileError.data?.message || profileError.error}</p>
        ) : (
          profile && (
            <div style={styles.profileCard}>
              {/* Profile Banner */}
              <div style={styles.banner}>
                {profile.profileBanner ? (
                  <img
                    src={`${BACKEND_URL}/${profile.profileBanner}`}
                    alt="Profile Banner"
                    style={styles.bannerImage}
                  />
                ) : (
                  <label htmlFor="banner-upload" style={styles.uploadBannerButton}>
                    <span style={styles.uploadBannerText}>Upload Banner</span>
                    {/* SVG Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18 18"
                      style={styles.uploadBannerIcon}
                    >
                      <path
                        d="M14.284 5.83333L13.1376 7.00833L15.2352 9.16667H6.96692V10.8333H15.2352L13.1376 12.9833L14.284 14.1667L18.349 10L14.284 5.83333ZM3.71488 4.16667H10.2189V2.5H3.71488C2.82057 2.5 2.08887 3.25 2.08887 4.16667V15.8333C2.08887 16.75 2.82057 17.5 3.71488 17.5H10.2189V15.8333H3.71488V4.16667Z"
                        fill="#A7A7A7"
                      />
                    </svg>
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      id="banner-upload"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div style={styles.profileInfo}>
                {/* Photo Upload */}
                <div style={styles.photoUpload}>
                  <label htmlFor="photo-upload">
                    <img
                      src={
                        profile.profileImage
                          ? `${BACKEND_URL}/${profile.profileImage}`
                          : 'https://via.placeholder.com/100.png?text=Profile+Image'
                      }
                      alt="Upload Photo"
                      style={styles.photoImage}
                    />
                  </label>
                  {/* <input
                    type="file"
                    id="photo-upload"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                  /> */}
                  <Button
                    style={styles.editProfileButton}
                    onClick={handleShowModal}
                  >
                    {/* SVG Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18 18"
                      style={styles.editProfileIcon}
                    >
                      <path
                        d="M3 17.25V21h3.75l11.92-11.92-3.75-3.75L3 17.25zm16.8-11.92l1.44-1.44c.19-.19.19-.51 0-.7l-2.8-2.8c-.19-.19-.51-.19-.7 0l-1.44 1.44 3.75 3.75z"
                        fill="#8A8A8A"
                      />
                    </svg>
                    Edit Profile
                  </Button>
                </div>

                {/* Details */}
                <div style={styles.details}>
                  <h1 style={styles.name}>{profileFormData.name}</h1>
                  <p style={styles.job}>
                    {profileFormData.companyName || 'N/A'}, {profileFormData.jobRole || 'N/A'}
                  </p>
                  <p style={styles.location}>
                    {profileFormData.city || 'N/A'}, {profileFormData.country || 'N/A'}
                  </p>
                </div>

                {/* Social Icons */}
                <div style={styles.socialIcons}>
                {profileFormData.email && (
                    <a
                      href={profileFormData.email}
                      className="icon mail"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialIcon}
                    >
                      {/* GitHub SVG */}
                      <svg
                         width='30'
                         height='30'
                         viewBox='0 0 50 50'
                         fill='#8A8A8A'
                         xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d="M12 23.403V23.39 10.389L11.88 10.3h-.01L9.14 8.28C7.47 7.04 5.09 7.1 3.61 8.56 2.62 9.54 2 10.9 2 12.41v3.602L12 23.403zM38 23.39v.013l10-7.391V12.41c0-1.49-.6-2.85-1.58-3.83-1.46-1.457-3.765-1.628-5.424-.403L38.12 10.3 38 10.389V23.39zM14 24.868l10.406 7.692c.353.261.836.261 1.189 0L36 24.868V11.867L25 20l-11-8.133V24.868zM38 25.889V41c0 .552.448 1 1 1h6.5c1.381 0 2.5-1.119 2.5-2.5V18.497L38 25.889zM12 25.889L2 18.497V39.5C2 40.881 3.119 42 4.5 42H11c.552 0 1-.448 1-1V25.889z" />
                      </svg>
                      
                    </a>
                  )}
                  {profileFormData.gitHubLink && (
                    <a
                      href={profileFormData.gitHubLink}
                      className="icon mail"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialIcon}
                    >
                      {/* GitHub SVG */}
                      <svg
                         width='30'
                         height='30'
                         viewBox='0 0 24 24'
                         fill='#8A8A8A'
                         xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577 
                        0-.285-.011-1.042-.016-2.046-3.338.726-4.042-1.611-4.042-1.611-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 
                        1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.419-1.304.762-1.605-2.665-.304-5.466-1.335-5.466-5.93 
                        0-1.31.469-2.381 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.403 
                        1.018.004 2.046.137 3.006.403 2.288-1.552 3.294-1.23 3.294-1.23.655 1.653.243 2.874.119 3.176.77.839 1.235 1.91 1.235 3.22 
                        0 4.61-2.807 5.624-5.479 5.921.43.372.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.216.694.825.576C20.565 21.801 24 
                        17.309 24 12C24 5.373 18.627 0 12 0z" />
                      </svg>
                    </a>
                  )}
                  {profileFormData.linkedInLink && (
                    <a
                      href={profileFormData.linkedInLink}
                      className="icon linkedin"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialIcon}
                    >
                      {/* LinkedIn SVG */}
                      <svg
                         width='30'
                         height='30'
                         viewBox='0 0 50 50'
                         fill='#8A8A8A'
                         xmlns='http://www.w3.org/2000/svg'
                        
                      >
                        <path d='M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z' />
                      </svg>
                      
                    </a>
                  )}
                </div>
              </div>
              {/* Sign Out Button */}
      {profile && (
        <button
          style={styles.signOutButton}
          onClick={handleLogout}
        >
          {/* SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            style={styles.signOutIcon}
          >
            <path
              d="M14.284 5.83333L13.1376 7.00833L15.2352 9.16667H6.96692V10.8333H15.2352L13.1376 12.9833L14.284 14.1667L18.349 10L14.284 5.83333ZM3.71488 4.16667H10.2189V2.5H3.71488C2.82057 2.5 2.08887 3.25 2.08887 4.16667V15.8333C2.08887 16.75 2.82057 17.5 3.71488 17.5H10.2189V15.8333H3.71488V4.16667Z"
              fill="#C54848"
            />
          </svg>
          Sign Out
        </button>
      )}
            </div>
            )
          )
        }
      </div>

      

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler} encType="multipart/form-data">
            {/* Name */}
            <Form.Group controlId='name' className='my-2'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter name'
                name='name'
                value={profileFormData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Company Name */}
            <Form.Group controlId='companyName' className='my-2'>
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter company name'
                name='companyName'
                value={profileFormData.companyName}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Job Role */}
            <Form.Group controlId='jobRole' className='my-2'>
              <Form.Label>Job Role</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter job role'
                name='jobRole'
                value={profileFormData.jobRole}
                onChange={handleChange}
              />
            </Form.Group>

            {/* City */}
            <Form.Group controlId='city' className='my-2'>
              <Form.Label>City</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter city'
                name='city'
                value={profileFormData.city}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Country */}
            <Form.Group controlId='country' className='my-2'>
              <Form.Label>Country</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter country'
                name='country'
                value={profileFormData.country}
                onChange={handleChange}
              />
            </Form.Group>

            {/* GitHub Link */}
            <Form.Group controlId='gitHubLink' className='my-2'>
              <Form.Label>GitHub Link</Form.Label>
              <Form.Control
                type='url'
                placeholder='Enter GitHub link'
                name='gitHubLink'
                value={profileFormData.gitHubLink}
                onChange={handleChange}
              />
            </Form.Group>

            {/* LinkedIn Link */}
            <Form.Group controlId='linkedInLink' className='my-2'>
              <Form.Label>LinkedIn Link</Form.Label>
              <Form.Control
                type='url'
                placeholder='Enter LinkedIn link'
                name='linkedInLink'
                value={profileFormData.linkedInLink}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Profile Image */}
            <Form.Group controlId='profileImage' className='my-2'>
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type='file'
                name='profileImage'
                accept='image/*'
                onChange={handleImageChange}
              />
              {profileImage && (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt='Profile Preview'
                  style={styles.photoImage}
                />
              )}
              {!profileImage && profile?.profileImage && (
                <img
                  src={`${BACKEND_URL}/${profile.profileImage}`}
                  alt='Current Profile'
                  style={styles.photoImage}
                />
              )}
            </Form.Group>

            {/* Profile Banner */}
            <Form.Group controlId='profileBanner' className='my-2'>
              <Form.Label>Profile Banner</Form.Label>
              <Form.Control
                type='file'
                name='profileBanner'
                accept='image/*'
                onChange={handleImageChange}
              />
              {profileBanner && (
                <img
                  src={URL.createObjectURL(profileBanner)}
                  alt='Banner Preview'
                  style={styles.bannerImage}
                />
              )}
              {!profileBanner && profile?.profileBanner && (
                <img
                  src={`${BACKEND_URL}/${profile.profileBanner}`}
                  alt='Current Banner'
                  style={styles.bannerImage}
                />
              )}
            </Form.Group>

            {isUpdatingProfile && <Loader />}

            <Button variant='primary' type='submit' disabled={isUpdatingProfile} className='mt-3'>
              Update Profile
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfileScreen;
