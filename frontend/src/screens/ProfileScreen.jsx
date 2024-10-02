// frontend/src/screens/ProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

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
    header: {
      marginBottom: '20px',
    },
    profileCard: {
      backgroundColor: '#302f2f',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
      position: 'relative',
      overflow: 'hidden',
    },
    profileBanner: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '10px',
      marginBottom: '20px',
      backgroundColor: '#444',
    },
    profileImage: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #fff',
      position: 'absolute',
      top: '100px',
      left: '20px',
      backgroundColor: '#555',
    },
    profileDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginLeft: '140px', // To accommodate the profile image
    },
    detailItem: {
      fontSize: '16px',
    },
    socialLinks: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    socialIcon: {
      width: '24px',
      height: '24px',
      fill: '#8A8A8A',
      cursor: 'pointer',
      transition: 'fill 0.3s ease',
    },
    editButton: {
      marginTop: '20px',
      background: 'linear-gradient(90deg, #1f1333 0%, #3a2450 56%, #65387b 100%)',
      border: 'none',
      padding: '10px 20px',
      color: 'white',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
    },
    imagePreview: {
      marginTop: '10px',
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '50%',
    },
    bannerPreview: {
      marginTop: '10px',
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '10px',
    },
  };

  // Get Backend URL from Environment Variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {userInfo && (
        <Sidebar user={userInfo} onToggle={handleSidebarToggle} />
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.header}>Your Profile</h1>

        {isProfileLoading ? (
          <Loader />
        ) : profileError ? (
          <p style={{ color: 'red' }}>{profileError.data?.message || profileError.error}</p>
        ) : (
          profile && ( // Ensure profile is defined
            <div style={styles.profileCard}>
              {/* Profile Banner */}
              <img
                src={
                  profile.profileBanner
                    ? `${BACKEND_URL}/${profile.profileBanner}`
                    : 'https://via.placeholder.com/800x150.png?text=Profile+Banner'
                }
                alt="Profile Banner alt text"
                style={styles.profileBanner}
              />
               
              {/* Profile Image */}
              <img
                src={
                  profile.profileImage
                    ? `${BACKEND_URL}/${profile.profileImage}`
                    : 'https://via.placeholder.com/100.png?text=Profile+Image'
                }
                alt="Profile alt text"
                style={styles.profileImage}
              />

              <div style={styles.profileDetails}>
                <div style={styles.detailItem}>
                  <strong>Name:</strong> {profileFormData.name}
                </div>
                <div style={styles.detailItem}>
                  <strong>Email:</strong> {profileFormData.email}
                </div>
                <div style={styles.detailItem}>
                  <strong>Company Name:</strong> {profileFormData.companyName || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>Job Role:</strong> {profileFormData.jobRole || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>City:</strong> {profileFormData.city || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>Country:</strong> {profileFormData.country || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>GitHub Link:</strong>{' '}
                  {profileFormData.gitHubLink ? (
                    <a href={profileFormData.gitHubLink} target='_blank' rel='noopener noreferrer' style={{ color: '#1e90ff' }}>
                      {profileFormData.gitHubLink}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
                <div style={styles.detailItem}>
                  <strong>LinkedIn Link:</strong>{' '}
                  {profileFormData.linkedInLink ? (
                    <a href={profileFormData.linkedInLink} target='_blank' rel='noopener noreferrer' style={{ color: '#1e90ff' }}>
                      {profileFormData.linkedInLink}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              {/* Social Icons */}
              <div style={styles.socialLinks}>
                {profileFormData.gitHubLink && (
                  <a href={profileFormData.gitHubLink} target='_blank' rel='noopener noreferrer'>
                    {/* GitHub SVG */}
                    <svg
                      style={styles.socialIcon}
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577 
                      0-.285-.011-1.042-.016-2.046-3.338.726-4.042-1.611-4.042-1.611-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 
                      1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.419-1.304.762-1.605-2.665-.304-5.466-1.335-5.466-5.93 
                      0-1.31.469-2.381 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.403 
                      1.018.004 2.046.137 3.006.403 2.288-1.552 3.294-1.23 3.294-1.23.655 1.653.243 2.874.119 3.176.77.839 1.235 1.91 1.235 3.22 
                      0 4.61-2.807 5.624-5.479 5.921.43.372.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.216.694.825.576C20.565 21.801 24 
                      17.309 24 12C24 5.373 18.627 0 12 0z' />
                    </svg>
                  </a>
                )}
                {profileFormData.linkedInLink && (
                  <a href={profileFormData.linkedInLink} target='_blank' rel='noopener noreferrer'>
                    {/* LinkedIn SVG */}
                    <svg
                      style={styles.socialIcon}
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                    >
                      <path d='M4.98 3C3.33 3 2 4.33 2 5.98C2 7.62 3.33 8.95 4.98 8.95S7.96 7.62 7.96 5.98 
                      C7.96 4.33 6.63 3 4.98 3zM2 21H6V12H2V21zM12 21C16.42 21 20 
                      17.42 20 13S16.42 5 12 5 4 8.58 4 
                      13s3.58 8 8 8zm0-11c-2.21 0-4 
                      1.79-4 4s1.79 4 4 4 4-1.79 
                      4-4-1.79-4-4-4zM18 21h-4v-2h4v2z' />
                    </svg>
                  </a>
                )}
              </div>

              {/* Edit Profile Button */}
              <Button style={styles.editButton} onClick={handleShowModal}>
                Edit Profile
              </Button>
            </div>
          )
        )}
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
                  style={styles.imagePreview}
                />
              )}
              {!profileImage && profile?.profileImage && (
                <img
                  src={`${BACKEND_URL}/${profile.profileImage}`}
                  alt='Current Profile'
                  style={styles.imagePreview}
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
                  style={styles.bannerPreview}
                />
              )}
              {!profileBanner && profile?.profileBanner && (
                <img
                  src={`${BACKEND_URL}/${profile.profileBanner}`}
                  alt='Current Banner'
                  style={styles.bannerPreview}
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
