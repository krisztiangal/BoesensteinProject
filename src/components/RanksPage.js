import React, { useState, useEffect } from 'react';
import styles from './RanksPage.module.css';
import API_BASE_URL from '../config/api';
import { Helmet } from 'react-helmet-async';

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
    <>
      <Helmet>
        <title>Mountain Ranks</title>
      </Helmet>
      <div className={styles.ranksPage}>
      <h1 className={styles.title}>Mountain Ranks</h1>

      {/* Highest Point Achieved Section */}
      <section className={styles.rankSection}>
        <h2><svg style={{height: '2.2rem', width: '2.2rem', marginBottom: '-0.5rem'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M11.47 10.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 12.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M11.47 4.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 6.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
        </svg> Highest Point Achieved</h2>
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
          <h2><svg style={{ width: '2rem', height: '2rem', marginBottom: '-0.5rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
          <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
          <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
        </svg> Most Mountains Summited</h2>
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
    </>
  );
}

export default RanksPage;
