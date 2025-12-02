import React, { useState, useEffect } from 'react';
import styles from './RanksPage.module.css';
import API_BASE_URL from '../config/api';

function RanksPage({ allMountains, onOpenMountainPopup, onOpenPublicProfilePage }) { // Receive allMountains, onOpenMountainPopup, and onOpenPublicProfilePage props
  const [highestPoints, setHighestPoints] = useState([]);
  const [mostSummited, setMostSummited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Highest Points Rank
        const highestPointsResponse = await fetch(`${API_BASE_URL}/api/ranks/highest-point`);
        const highestPointsData = await highestPointsResponse.json();
        if (highestPointsData.success) {
          setHighestPoints(highestPointsData.data);
        } else {
          console.error('Error fetching highest points rank:', highestPointsData.message);
          setError(prev => prev + 'Failed to load highest points. ');
        }

        // Fetch Most Summited Rank
        const mostSummitedResponse = await fetch(`${API_BASE_URL}/api/ranks/summited-count`);
        const mostSummitedData = await mostSummitedResponse.json();
        if (mostSummitedData.success) {
          setMostSummited(mostSummitedData.data);
        } else {
          console.error('Error fetching most summited rank:', mostSummitedData.message);
          setError(prev => prev + 'Failed to load most summited mountains. ');
        }

      } catch (err) {
        console.error('Network error fetching ranks:', err);
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, []);

  const getMedalEmoji = (rankPosition) => {
    if (rankPosition === 1) return '🥇';
    if (rankPosition === 2) return '🥈';
    if (rankPosition === 3) return '🥉';
    return `${rankPosition}.`;
  };

  const handleUsernameClick = (username) => {
    // Instead of opening a popup, navigate to the public profile page
    console.log(`[RanksPage] Clicked on username: ${username}`);
    onOpenPublicProfilePage(username);
  };

  if (loading) {
    return (
      <div className={styles.ranksPage}>
        <p>Loading ranks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ranksPage}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.ranksPage}>
      <h1 className={styles.title}>Mountain Ranks</h1>

      {/* Highest Point Achieved Section */}
      <section className={styles.rankSection}>
        <h2>🏆 Highest Point Achieved</h2>
        {highestPoints.length > 0 ? (
          <ol className={styles.rankList}>
            {highestPoints.map((user, index) => (
              <li key={user.username} className={styles.rankItem}>
                <span className={styles.rankPosition}>{getMedalEmoji(index + 1)}</span>
                <span className={styles.nickname}>{user.nickname}</span>
                <span
                  className={styles.usernameLink}
                  onClick={() => handleUsernameClick(user.username)} // Pass user.username
                >
                  @{user.username}
                </span>
                <span className={styles.value}>{user.highestPoint}m</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyState}>No data for highest points yet.</p>
        )}
      </section>

      {/* Most Mountains Summited Section */}
      <section className={styles.rankSection}>
        <h2>⛰️ Most Mountains Summited</h2>
        {mostSummited.length > 0 ? (
          <ol className={styles.rankList}>
            {mostSummited.map((user, index) => (
              <li key={user.username} className={styles.rankItem}>
                <span className={styles.rankPosition}>{getMedalEmoji(index + 1)}</span>
                <span className={styles.nickname}>{user.nickname}</span>
                <span
                  className={styles.usernameLink}
                  onClick={() => handleUsernameClick(user.username)} // Pass user.username
                >
                  @{user.username}
                </span>
                <span className={styles.value}>{user.summitedCount} mountains</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyState}>No data for most mountains summited yet.</p>
        )}
      </section>
    </div>
  );
}

export default RanksPage;
