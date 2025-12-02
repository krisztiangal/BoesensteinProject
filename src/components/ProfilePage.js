import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import styles from './ProfilePage.module.css';
import MountainCard from './MountainCard';
import MountainPopup from './MountainPopup';
import API_BASE_URL from '../config/api';

function ProfilePage({ mountains, onOpenLogin, onOpenSignup }) {
  const { currentUser, addToWishlist, markAsSummited, removeFromWishlist, unmarkSummited } = useUser();
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [isMountainPopupOpen, setIsMountainPopupOpen] = useState(false);
  // Remove rank position states since we don't need them for basic stats
  const [userHighestPoint, setUserHighestPoint] = useState(0);
  const [userSummitedCount, setUserSummitedCount] = useState(0);

  useEffect(() => {
    // Compute user stats locally from their data and mountains
    if (!currentUser || !mountains.length) {
      setUserHighestPoint(0);
      setUserSummitedCount(0);
      return;
    }

    // Calculate highest point from user's summited mountains
    let highestPoint = 0;
    const summitedMountains = mountains.filter(mountain =>
      currentUser.summited?.includes(mountain.id)
    );

    summitedMountains.forEach(mountain => {
      if (mountain.height > highestPoint) {
        highestPoint = mountain.height;
      }
    });

    setUserHighestPoint(highestPoint);
    setUserSummitedCount(summitedMountains.length);

  }, [currentUser, mountains]);

  const handleCardClick = (mountain) => {
    setSelectedMountain(mountain);
    setIsMountainPopupOpen(true);
  };

  const closeMountainPopup = () => {
    setSelectedMountain(null);
    setIsMountainPopupOpen(false);
  };

  if (!currentUser) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.notLoggedIn}>
          <h2>Please log in to view your profile</h2>
          <p>You need to be logged in to see your wishlist and summited mountains.</p>
        </div>
      </div>
    );
  }

  const wishlistMountains = mountains.filter(mountain =>
    currentUser.wishlist?.includes(mountain.id)
  );

  const summitedMountains = mountains.filter(mountain =>
    currentUser.summited?.includes(mountain.id)
  );

  const uploadedMountains = mountains.filter(mountain =>
    mountain.uploadedBy === currentUser.username
  );

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.profilePictureFrame}>
          <img
            src={currentUser.pfp ? `${API_BASE_URL}/${currentUser.pfp}` : "https://via.placeholder.com/150"} //was localhost:5000
            alt={`${currentUser.nickname}'s Profile`}
            className={styles.profilePicture}
          />
        </div>
        <div className={styles.profileTitleContainer}>
          <h1>Welcome, {currentUser.nickname}!</h1>
        </div>
        <p className={styles.username}>@{currentUser.username}</p>

        {/* ------------------------------- Social Links Section ----------------------------- */}
        {/*currentUser.socials && currentUser.socials.length > 0 && (
          <div className={styles.socialLinks}>
            {currentUser.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialIcon} ${styles[social.type.toLowerCase()]}`}
                title={social.type}
              >
                {social.type === 'Instagram' && '📸'}
                {social.type === 'YouTube' && '▶️'}
                {social.type === 'Website' && '🌐'}
              </a>
            ))}
          </div>
        )*/}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>{wishlistMountains.length}</h3>
          <p>Mountains in Wishlist</p>
        </div>
        <div className={styles.statCard}>
          <h3>{summitedMountains.length}</h3>
          <p>Mountains Summited</p>
        </div>
        <div className={styles.statCard}>
          <h3>{uploadedMountains.length}</h3>
          <p>Mountains Uploaded</p>
        </div>

        {/* ------------------ stat cards ---------- */}
        <div className={styles.statCard}>
          <h3>{userHighestPoint}m</h3>
          <p>Highest Point</p>
        </div>
        <div className={styles.statCard}>
          <h3>{userSummitedCount}</h3>
          <p>Total Summits</p>
        </div>
      </div>

      <div className={styles.sections}>
        {/* --------------- Wishlist Section ------------- */}
        <section className={styles.section}>
          <h2>⭐ My Wishlist ({wishlistMountains.length})</h2>
          {wishlistMountains.length > 0 ? (
            <div className={styles.mountainsGrid}>
              {wishlistMountains.map(mountain => (
                <MountainCard
                  key={mountain.id}
                  mountain={mountain}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No mountains in your wishlist yet.</p>
              <p>Start exploring and add some mountains to your wishlist!</p>
            </div>
          )}
        </section>

        {/* --------------- Summited Section ------------- */}
        <section className={styles.section}>
          <h2>🏔️ Summited Mountains ({summitedMountains.length})</h2>
          {summitedMountains.length > 0 ? (
            <div className={styles.mountainsGrid}>
              {summitedMountains.map(mountain => (
                <MountainCard
                  key={mountain.id}
                  mountain={mountain}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No mountains marked as summited yet.</p>
              <p>Keep climbing and mark your achievements!</p>
            </div>
          )}
        </section>

        {/* --------------- Uploaded Mountains Section ------------- */}
        <section className={styles.section}>
          <h2>⬆️ My Uploaded Mountains ({uploadedMountains.length})</h2>
          {uploadedMountains.length > 0 ? (
            <div className={styles.mountainsGrid}>
              {uploadedMountains.map(mountain => (
                <MountainCard
                  key={mountain.id}
                  mountain={mountain}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>You haven't uploaded any mountains yet.</p>
              <p>Share your discoveries with the community!</p>
            </div>
          )}
        </section>
      </div>

      {selectedMountain && (
        <MountainPopup
          mountain={selectedMountain}
          isOpen={isMountainPopupOpen}
          onClose={closeMountainPopup}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
          isProfileView={true}
        />
      )}
    </div>
  );
}

export default ProfilePage;
