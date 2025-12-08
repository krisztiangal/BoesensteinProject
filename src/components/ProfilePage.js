import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import styles from './ProfilePage.module.css';
import MountainCard from './MountainCard';
import MountainPopup from './MountainPopup';
import API_BASE_URL from '../config/api';
import { Helmet } from 'react-helmet-async';

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
    <>
      <Helmet>
        <title>{`${currentUser.nickname} — My Profile | Bösenstein`}</title>
        <meta
          name="description"
          content={`See ${currentUser.nickname}'s profile: ${wishlistMountains.length} in wishlist, ${summitedMountains.length} summited, ${uploadedMountains.length} uploaded.`}
        />
      </Helmet>
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.profilePictureFrame}>
          <img
          src={currentUser.pfp && currentUser.pfp.trim() !== "" ?
            `${API_BASE_URL}/${currentUser.pfp}` : "/placeholderP.png"}
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
          <h2><svg style={{width: '1.5rem', height: '1.5rem', marginBottom: '-0.25rem'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
          </svg> My Wishlist ({wishlistMountains.length})</h2>
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
          <h2><svg style={{width: '1.5rem', height: '1.5rem', marginBottom: '-0.25rem'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.116-.062l3-3.75Z" clipRule="evenodd" />
          </svg> Summited Mountains ({summitedMountains.length})</h2>
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
          <h2><svg style={{width: '2rem', height: '2rem', marginBottom: '-0.25rem'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
          </svg> Uploaded Mountains ({uploadedMountains.length})</h2>
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
    </>
  );
}

export default ProfilePage;
