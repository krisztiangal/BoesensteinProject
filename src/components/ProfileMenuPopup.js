import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import styles from './ProfileMenuPopup.module.css';

function ProfileMenuPopup({ isOpen, onClose, onLogout }) {
  const [pfp, setPfp] = useState(null);
  const [pfpError, setPfpError] = useState('');
  const [pfpLoading, setPfpLoading] = useState(false);

  const { currentUser, updateUserPfp } = useUser();

  useEffect(() => {
  }, [currentUser]);

  const handlePfpFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setPfpError('File is too large. Maximum size is 10MB.');
      e.target.value = null; // Clear the input
      setPfp(null);
    } else {
      setPfp(file);
      setPfpError('');
    }
  };

  const handlePfpSubmit = async (e) => {
    e.preventDefault();
    if (!pfp) {
      setPfpError('Please select a file to upload.');
      return;
    }
    setPfpError('');
    setPfpLoading(true);

    try {
      const formData = new FormData();
      formData.append('pfp', pfp);

      const result = await updateUserPfp(formData);

      if (result.success) {
        alert('Profile picture updated successfully!');
        setPfp(null);
        e.target.reset();
      } else {
        setPfpError(result.message || 'Failed to update profile picture.');
      }
    } catch (err) {
      setPfpError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setPfpLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div className={styles.modalBody}>
          <h2>Profile Menu</h2>

          {/* ------------------ Current User Info ----------------- */}
          {currentUser && (
            <div className={styles.currentUserInfo}>
              <img
                src={currentUser.pfp ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${currentUser.pfp}` : "https://via.placeholder.com/50"}
                alt={`${currentUser.nickname}'s Profile`}
                className={styles.currentUserPfp}
              />
              <p className={styles.currentUsername}>{currentUser.nickname}</p>
            </div>
          )}

          <div className={styles.menuSection}>
            <h3>Update Profile Picture</h3>
            <form onSubmit={handlePfpSubmit} className={styles.form}>
              {pfpError && <div className={styles.error}>{pfpError}</div>}
              <div className={styles.formGroup}>
                <label htmlFor="pfp-upload">Select New Picture:</label>
                <input
                  type="file"
                  id="pfp-upload"
                  name="pfp-upload"
                  accept="image/*"
                  onChange={handlePfpFileChange}
                  required
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={pfpLoading || !pfp}>
                {pfpLoading ? 'Uploading...' : 'Update'}
              </button>
            </form>
          </div>

          <div className={styles.logoutSection}>
            <button onClick={() => { onLogout(); onClose(); }} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileMenuPopup;
