// frontend/src/components/CreateWorkspaceModal.jsx

import React, { useState } from 'react';
import { useCreateWorkspaceMutation } from '../slices/usersApiSlice';
import { useGetWorkspacesQuery } from '../slices/usersApiSlice';

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [createWorkspace, { isLoading, error }] = useCreateWorkspaceMutation();

  const [formData, setFormData] = useState({
    workspaceTitle: '',
    workspaceDescription: '',
    coverImage: '', // Optional
  });

  const [inviteEmail, setInviteEmail] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInviteChange = (e) => {
    setInviteEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare workspace data
      const workspaceData = {
        workspaceTitle: formData.workspaceTitle,
        workspaceDescription: formData.workspaceDescription,
        coverImage: formData.coverImage, // Can be empty
      };

      // Create workspace
      const response = await createWorkspace(workspaceData).unwrap();

      // Optionally, invite members here using inviteEmail
      // You might need to create an endpoint for inviting members

      // Callback to refresh workspace list
      onWorkspaceCreated(response);

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Failed to create workspace:', err);
      // Optionally, display error messages to the user
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create Workspace</h2>
        <p>
          A Workspace represents teams, departments, or groups, each with its
          own Lists, workflows, and settings.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Workspace Title */}
          <label htmlFor="workspaceTitle" style={styles.label}>
            Name & Icon
          </label>
          <div style={styles.inputGroup}>
            <input
              type="text"
              id="workspaceTitle"
              name="workspaceTitle"
              placeholder="Workspace Name"
              value={formData.workspaceTitle}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <div style={styles.svgBox}>
              {/* SVG Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style={styles.svgIcon}
              >
                <path
                  d="M13.6035 15.4492C13.6035 16.6341 13.3164 17.6641 12.7422 18.5391C12.168 19.4141 11.3294 20.0885 10.2266 20.5625C9.13281 21.0365 7.80208 21.2734 6.23438 21.2734C5.54167 21.2734 4.86263 21.2279 4.19727 21.1367C3.54102 21.0456 2.90755 20.9134 2.29688 20.7402C1.69531 20.5579 1.12109 20.3346 0.574219 20.0703V16.1328C1.52214 16.5521 2.50651 16.9303 3.52734 17.2676C4.54818 17.6048 5.5599 17.7734 6.5625 17.7734C7.25521 17.7734 7.8112 17.6823 8.23047 17.5C8.65885 17.3177 8.96875 17.0671 9.16016 16.748C9.35156 16.429 9.44727 16.0645 9.44727 15.6543C9.44727 15.153 9.27865 14.7246 8.94141 14.3691C8.60417 14.0137 8.13932 13.681 7.54688 13.3711C6.96354 13.0612 6.30273 12.7285 5.56445 12.373C5.09961 12.1543 4.59375 11.89 4.04688 11.5801C3.5 11.2611 2.98047 10.8737 2.48828 10.418C1.99609 9.96224 1.59049 9.41081 1.27148 8.76367C0.961589 8.10742 0.806641 7.32357 0.806641 6.41211C0.806641 5.2181 1.08008 4.19727 1.62695 3.34961C2.17383 2.50195 2.95312 1.85482 3.96484 1.4082C4.98568 0.952474 6.1888 0.724609 7.57422 0.724609C8.61328 0.724609 9.60221 0.847656 10.541 1.09375C11.4889 1.33073 12.4779 1.67708 13.5078 2.13281L12.1406 5.42773C11.2201 5.05404 10.3952 4.76693 9.66602 4.56641C8.93685 4.35677 8.19401 4.25195 7.4375 4.25195C6.90885 4.25195 6.45768 4.33854 6.08398 4.51172C5.71029 4.67578 5.42773 4.91276 5.23633 5.22266C5.04492 5.52344 4.94922 5.87435 4.94922 6.27539C4.94922 6.74935 5.08594 7.15039 5.35938 7.47852C5.64193 7.79753 6.0612 8.10742 6.61719 8.4082C7.18229 8.70898 7.88411 9.0599 8.72266 9.46094C9.74349 9.94401 10.6139 10.4499 11.334 10.9785C12.0632 11.498 12.6237 12.1133 13.0156 12.8242C13.4076 13.526 13.6035 14.401 13.6035 15.4492Z"
                  fill="#999999"
                />
              </svg>
            </div>
          </div>

          {/* Cover Image */}
          <label htmlFor="coverImage" style={styles.label}>
            Cover Image (Optional)
          </label>
          <div style={styles.inputGroup}>
            <input
              type="text"
              id="coverImage"
              name="coverImage"
              placeholder="Cover Image URL"
              value={formData.coverImage}
              onChange={handleChange}
              style={styles.input}
            />
            <div style={styles.svgBox}>
              {/* SVG Icon for Cover Image */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.svgIcon}>
                <path
                  d="M15.75 2.25H6.75C5.5125 2.25 4.51125 3.2625 4.51125 4.5L4.5 22.5C4.5 23.7375 5.50125 24.75 6.73875 24.75H20.25C21.4875 24.75 22.5 23.7375 22.5 22.5V9L15.75 2.25ZM20.25 22.5H6.75V4.5H14.625V10.125H20.25V22.5ZM9 16.8863L10.5862 18.4725L12.375 16.695V21.375H14.625V16.695L16.4137 18.4837L18 16.8863L13.5113 12.375L9 16.8863Z"
                  fill="#A7A7A7"
                />
              </svg>
              <input
                type="text"
                id="banner"
                name="banner" // Changed name to 'banner' for clarity
                placeholder="Banner URL (Optional)"
                className="custom-placeholder"
                style={styles.input}
                value={inviteEmail} // It seems 'inviteEmail' was incorrectly used here; should be 'coverImage'
                onChange={handleInviteChange} // Should be handleChange for 'coverImage'
              />
            </div>
          </div>

          {/* Description */}
          <label htmlFor="workspaceDescription" style={styles.label}>
            Description
            <span style={styles.optional}>(Optional)</span>
          </label>
          <textarea
            id="workspaceDescription"
            name="workspaceDescription"
            placeholder="Provide a short description of the workspace!"
            value={formData.workspaceDescription}
            onChange={handleChange}
            style={styles.textarea}
          ></textarea>

          {/* Invite People */}
          <label htmlFor="invitePeople" style={styles.label}>
            Invite People
            <span style={styles.optional}>(Optional)</span>
          </label>
          <input
            type="email"
            id="invitePeople"
            name="invitePeople"
            placeholder="user@mail.com"
            value={inviteEmail}
            onChange={handleInviteChange}
            style={styles.input}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="next-btn"
            style={styles.nextBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Next'}
          </button>
        </form>

        {/* Close Button */}
        <button onClick={onClose} style={styles.closeBtn}>
          &times;
        </button>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'linear-gradient(to bottom, #2f263c 0%, #121212 100%)',
    padding: '25px 20px',
    borderRadius: '10px',
    width: '390px',
    color: '#fff',
    height: '500px',
    textAlign: 'left',
    position: 'relative',
    overflowY: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 5px',
    fontSize: '1.1em',
    color: 'white',
  },
  optional: {
    fontSize: '10px',
    color: 'white',
    marginLeft: '4px',
  },
  inputGroup: {
    display: 'flex',
    position: 'relative',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    color: '#999999',
    backgroundColor: 'white',
  },
  svgBox: {
    width: '10%',
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '8px 6px',
  },
  svgIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '6px',
    fill: '#999999',
    width: '22px',
    height: '22px',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    color: '#999999',
    backgroundColor: 'white',
    height: '80px',
    resize: 'none',
  },
  nextBtn: {
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
  },
  closeBtn: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
  },
};

export default CreateWorkspaceModal;
