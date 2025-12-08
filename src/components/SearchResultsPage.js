import React from 'react';
import styles from './SearchResultsPage.module.css';
import MountainCard from './MountainCard';
import UserSearchResultCard from './UserSearchResultCard';
import { Helmet } from 'react-helmet-async';

function SearchResultsPage({ searchResults, onOpenMountainPopup, onOpenPublicProfilePage, onBackToPreviousView }) {
  const { mountains, users } = searchResults;

  const handleMountainClick = (mountain) => {
    onOpenMountainPopup(mountain);
  };

  const handleUserClick = (username) => {
    onOpenPublicProfilePage(username);
  };

  return (
    <>
    <Helmet>
      <title>Search Results</title>
    </Helmet>
    <div className={styles.searchResultsPage}>
      <div className={styles.header}>
        <button onClick={onBackToPreviousView} className={styles.backButton}>
          &larr; Back
        </button>
        <h1 className={styles.title}>Search Results</h1>
      </div>

      {mountains.length === 0 && users.length === 0 ? (
        <p className={styles.noResults}>No results found for your search query.</p>
      ) : (
        <>
          {/* Mountain Results Section */}
          {mountains.length > 0 && (
            <section className={styles.resultsSection}>
              <h2>Mountains ({mountains.length})</h2>
              <div className={styles.mountainsGrid}>
                {mountains.map(mountain => (
                  <MountainCard
                    key={mountain.id}
                    mountain={mountain}
                    onCardClick={handleMountainClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* User Results Section */}
          {users.length > 0 && (
            <section className={styles.resultsSection}>
              <h2>Users ({users.length})</h2>
              <div className={styles.usersGrid}>
                {users.map(user => (
                  <UserSearchResultCard
                    key={user._id} // Using _id for user key
                    user={user}
                    onClick={() => handleUserClick(user.username)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default SearchResultsPage;
