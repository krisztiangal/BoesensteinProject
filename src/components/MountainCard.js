import React from 'react';
import styles from './MountainCard.module.css';
import API_BASE_URL from '../config/api';

function MountainCard({ mountain, onCardClick }) {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(mountain);
    }
  };

  const imageUrl = (mountain.images && mountain.images.length > 0)
    ? `${API_BASE_URL}/${mountain.images[0]}`
    : 'mountains/backend/placeholderM.jpg'; // A default placeholder image

  return (
    <div
      className={styles.mountainCard}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={imageUrl}
        alt={mountain.name}
        className={styles.cardImage}
      />
      <div className={styles.cardContent}>
        <h2>{mountain.name}</h2>
        <p>{mountain.height} m</p>
      </div>
    </div>
  );
}

MountainCard.defaultProps = {
  onCardClick: () => {},
};

export default MountainCard;
