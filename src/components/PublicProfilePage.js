import React from 'react';
import styles from './PublicProfilePage.module.css'; // Assuming this CSS module exists
import API_BASE_URL from '../config/api';
import { Helmet } from 'react-helmet-async';

const PublicProfilePage = ({ viewedUser, onOpenMountainPopup, onBackToRanks }) => {
  if (!viewedUser) {
    return (
      <div className={styles.publicProfilePage}>
        <p>No user selected for public profile. Please go back to ranks.</p>
        <button onClick={onBackToRanks} className={styles.backButton}>
          &larr; Back to Ranks
        </button>
      </div>
    );
  }

  const summitedMountains = viewedUser.summited_mountains || [];
  const wishlistMountains = viewedUser.wishlist_mountains || [];

  return (
    <>
      <Helmet>
        <title>{viewedUser.nickname}'s Profile</title>
      </Helmet>
      <div className={styles.publicProfilePage}>
      <button onClick={onBackToRanks} className={styles.backButton}>
        &larr; Back to Ranks
      </button>
      <h1 className={styles.username}>{viewedUser.nickname}'s Profile</h1>

      <div className={styles.profileHeader}>
        <div className={styles.profilePictureFrame}>
          <img
            src={viewedUser.pfp ? `${API_BASE_URL}/${viewedUser.pfp}` : "https://via.placeholder.com/150"}
            alt={`${viewedUser.nickname}'s Profile`}
            className={styles.profilePicture}
          />
        </div>

      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Summited Mountains ({summitedMountains.length})</h2>
        {summitedMountains.length > 0 ? (
          <ul className={styles.mountainList}>
            {summitedMountains.map((mountain) => (
              <li key={mountain.id} className={styles.mountainItem}>
                <span onClick={() => onOpenMountainPopup(mountain)} className={styles.mountainLink}>
                  {mountain.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No mountains summited yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Wishlist Mountains ({wishlistMountains.length})</h2>
        {wishlistMountains.length > 0 ? (
          <ul className={styles.mountainList}>
            {wishlistMountains.map((mountain) => (
              <li key={mountain.id} className={styles.mountainItem}>
                <span onClick={() => onOpenMountainPopup(mountain)} className={styles.mountainLink}>
                  {mountain.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>Wishlist is empty.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default PublicProfilePage;
