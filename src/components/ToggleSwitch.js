import React from 'react';
import styles from './ToggleSwitch.module.css';

const ToggleSwitch = ({ currentState, onToggle }) => {
  const getSliderClass = () => {
    if (currentState === 'mountains') return '';
    if (currentState === 'profile') return styles.right;
    if (currentState === 'ranks') return styles.mid;
    return '';
  };

  return (
    <div className={styles.switchContainer}>
      <div
        className={`${styles.switchOption} ${currentState === 'mountains' ? styles.active : ''}`}
        onClick={() => onToggle('mountains')}
      >
        Home
      </div>
      <div
        className={`${styles.switchOption} ${currentState === 'ranks' ? styles.active : ''}`}
        onClick={() => onToggle('ranks')}
      >
        Ranks
      </div>
      <div
        className={`${styles.switchOption} ${currentState === 'profile' ? styles.active : ''}`}
        onClick={() => onToggle('profile')}
      >
        Profile
      </div>
      <div className={`${styles.slider} ${getSliderClass()}`} />
    </div>
  );
};

export default ToggleSwitch;
