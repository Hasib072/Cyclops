// frontend/src/screens/ProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// RTK Query Hooks
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../slices/usersApiSlice';

// Custom Components
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';

// Redux Actions
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();

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

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);

  const handleCloseModal = () => setShowEditModal(false);
  const handleShowModal = () => setShowEditModal(true);

  useEffect(() => {
    if (profile) {
      console.log(profile);
      setProfileFormData({
        name: profile.user.name || '',
        email: profile.user.email || '',
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

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const updatedProfile = await updateProfile(profileFormData).unwrap();
      toast.success('Profile updated successfully');
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1 style={{color:'white'}}>Your Profile</h1>

      {isProfileLoading ? (
        <Loader />
      ) : profileError ? (
        <p className='text-danger'>{profileError.data.message || profileError.error}</p>
      ) : (
        <div style={{color:'white'}}>
          {/* Display Profile Details */}
          <Row>
            <Col md={6}>
              <p>
                <strong>Name:</strong> {profileFormData.name}
              </p>
              <p>
                <strong>Email:</strong> {profileFormData.email}
              </p>
              <p>
                <strong>Company Name:</strong> {profileFormData.companyName || 'N/A'}
              </p>
              <p>
                <strong>Job Role:</strong> {profileFormData.jobRole || 'N/A'}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>City:</strong> {profileFormData.city || 'N/A'}
              </p>
              <p>
                <strong>Country:</strong> {profileFormData.country || 'N/A'}
              </p>
              <p>
                <strong>GitHub Link:</strong>{' '}
                {profileFormData.gitHubLink ? (
                  <a href={profileFormData.gitHubLink} target='_blank' rel='noopener noreferrer'>
                    {profileFormData.gitHubLink}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p>
                <strong>LinkedIn Link:</strong>{' '}
                {profileFormData.linkedInLink ? (
                  <a href={profileFormData.linkedInLink} target='_blank' rel='noopener noreferrer'>
                    {profileFormData.linkedInLink}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
            </Col>
          </Row>

          {/* Edit Button */}
          <Button variant='primary' onClick={handleShowModal}>
            Edit Profile
          </Button>

          {/* Edit Profile Modal */}
          <Modal show={showEditModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={submitHandler}>
                {/* Name and Email */}
                <Form.Group controlId='name' className='my-2'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter name'
                    name='name'
                    value={profileFormData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* <Form.Group controlId='email' className='my-2'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    name='email'
                    value={profileFormData.email}
                    onChange={handleChange}
                    disabled // Make the email field read-only
                  />
                </Form.Group> */}

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

                {isUpdatingProfile && <Loader />}

                <Button variant='primary' type='submit' disabled={isUpdatingProfile}>
                  Update Profile
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </FormContainer>
  );
};

export default ProfileScreen;
