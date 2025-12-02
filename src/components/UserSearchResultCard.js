import React from 'react';
import styles from './UserSearchResultCard.module.css';
import API_BASE_URL from '../config/api';

function UserSearchResultCard({ user, onClick }) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(user.username);
    }
  };

  const pfpUrl = user.pfp
    ? `${API_BASE_URL}/${user.pfp}`
    : "https://via.placeholder.com/100"; // Default placeholder

  return (
    <div className={styles.userCard} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img src={pfpUrl} alt={`${user.nickname}'s Profile`} className={styles.userPfp} />
      <div className={styles.userInfo}>
        <h3 className={styles.nickname}>{user.nickname}</h3>
        <p className={styles.username}>@{user.username}</p>
      </div>
    </div>
  );
}

export default UserSearchResultCard;
