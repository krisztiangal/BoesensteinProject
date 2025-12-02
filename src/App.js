import React, { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import MountainList from './components/MountainList';
import ProfilePage from './components/ProfilePage';
import ToggleSwitch from './components/ToggleSwitch';
import RanksPage from './components/RanksPage';
import PublicProfilePage from './components/PublicProfilePage';
import { useUser } from './context/UserContext';
import LoginPopup from './components/LoginPopup';
import SignupPopup from './components/SignupPopup';
import MountainPopup from './components/MountainPopup';
import API_BASE_URL from './config/api';
import ProfileMenuPopup from './components/ProfileMenuPopup';
import AdminPage from './components/AdminPage';
import SearchResultsPage from './components/SearchResultsPage';

function App() {
  const [mountains, setMountains] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedMountainForPopup, setSelectedMountainForPopup] = useState(null);
  const [isMountainPopupGlobalOpen, setIsMountainPopupGlobalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // New state for ProfileMenuPopup
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
  const [searchResults, setSearchResults] = useState({ mountains: [], users: [] }); // New state for search results

  // State for view management, replacing react-router-dom
  const [currentView, setCurrentView] = useState('mountains'); // 'mountains', 'profile', 'ranks', 'publicProfile', 'searchResults'
  const [viewedUser, setViewedUser] = useState(null); // State to hold the user for PublicProfilePage

  const { currentUser, logout } = useUser();
  const isAdmin = currentUser?.role === 'admin'; // Derive isAdmin from currentUser's role

  // Effect to manage body scroll when popups are open
  useEffect(() => {
    // Admin page can also prevent scroll if it has internal scrolling content, or if we want to treat it as a "full-page overlay"
    // The noScroll class should only be applied when a modal/popup is open, not for main content views like the admin page itself.
    const isAnyPopupOpen = showLogin || showSignup || isMountainPopupGlobalOpen || isProfileMenuOpen;
    if (isAnyPopupOpen) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }
    // Cleanup function to ensure class is removed on unmount
    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, [showLogin, showSignup, isMountainPopupGlobalOpen, isProfileMenuOpen]);


  // Fetch mountains from API
  useEffect(() => {
    const fetchMountains = async () => {
      try {
        console.log('Fetching mountains from API...');
        const response = await fetch(`${API_BASE_URL}/api/mountains`);
        const data = await response.json();

        if (data.success) {
          console.log(`Loaded ${data.data.length} mountains from API`);
          setMountains(data.data);
        } else {
          console.error('Error fetching mountains:', data.message);
          setMountains([]);
        }
      } catch (error) {
        console.error('Error fetching mountains:', error);
        setMountains([]);
      }
    };

    fetchMountains();
  }, []);

  const openLogin = () => setShowLogin(true);
  const openSignup = () => setShowSignup(true);
  const closeLogin = () => setShowLogin(false);
  const closeSignup = () => setShowSignup(false);

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleViewToggle = (view) => {
    if (view === 'admin' && !isAdmin) {
        // Optionally, you could show a message or redirect if not admin
        console.warn('Attempted to access admin page without admin privileges.');
        return; // Do not switch view
    }
    if (view === 'profile' && !currentUser) {
      openLogin(); // Prompt login if trying to access profile without being logged in
    } else {
      setCurrentView(view); // Switch the view
      setViewedUser(null); // Clear any viewed user when switching main tabs
      setSearchResults({ mountains: [], users: [] }); // Clear search results when switching views
      setSearchQuery(''); // Clear search query when switching views
    }
  };

  const handleMountainUploadSuccess = (newMountain) => {
    setMountains(prevMountains => [...prevMountains, newMountain]);
    setCurrentView('mountains'); // Switch back to mountains view after upload
  };

  const handleOpenMountainPopup = (mountain) => {
    setSelectedMountainForPopup(mountain);
    setIsMountainPopupGlobalOpen(true);
  };

  const handleCloseMountainPopup = () => {
    setSelectedMountainForPopup(null);
    setIsMountainPopupGlobalOpen(false);
  };

  // Handlers for Profile Menu Popup
  const openProfileMenu = () => {
    setIsProfileMenuOpen(true);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // Handler to fetch user data and switch to PublicProfilePage
  const handleOpenPublicProfilePage = useCallback(async (username) => {
      console.log(`[App] handleOpenPublicProfilePage called for username: ${username}`);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${username}`);
        const data = await response.json();
        if (data.success) {
            console.log('[App] Fetched user data:', data.data);
            setViewedUser(data.data);
            setCurrentView('publicProfile');
            console.log('[App] Set currentView to publicProfile');
        } else {
            console.error("[App] Could not fetch user profile:", data.message);
        }
    } catch (error) {
        console.error("[App] Error fetching user profile:", error);
    }
  }, []);

  // Handler to perform search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query); // Update search query state
    if (!query.trim()) {
      setSearchResults({ mountains: [], users: [] });
      setCurrentView('mountains'); // Or clear search and stay on current page
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
        setCurrentView('searchResults'); // Switch to search results view
      } else {
        console.error('[App] Search failed:', data.message);
        setSearchResults({ mountains: [], users: [] });
        setCurrentView('mountains'); // Fallback to mountains view on error
      }
    } catch (error) {
      console.error('[App] Error during search:', error);
      setSearchResults({ mountains: [], users: [] });
      setCurrentView('mountains'); // Fallback to mountains view on network error
    }
  }, []);

  // Handler to go back to Ranks page from a public profile
  const handleBackToRanks = () => {
      setCurrentView('ranks');
      setViewedUser(null);
  };

  const handleBackToSearchResults = () => {
    setCurrentView('searchResults');
    setViewedUser(null);
  };

  const renderContent = () => {
    console.log(`[App] Rendering view: ${currentView}`);
    console.log('[App] Current Search Results:', searchResults); // Debugging search results

    if (currentView === 'admin' && isAdmin) { // Conditionally render AdminPage if currentView is 'admin' and user is admin
      return <AdminPage />;
    }

    if (currentView === 'searchResults') {
      return (
        <SearchResultsPage
          searchResults={searchResults}
          onOpenMountainPopup={handleOpenMountainPopup}
          onOpenPublicProfilePage={handleOpenPublicProfilePage}
          onBackToPreviousView={() => setCurrentView('mountains')} // A simple way to go back for now
        />
      );
    }

    if (currentView === 'publicProfile') {
      return (
        <PublicProfilePage
          viewedUser={viewedUser}
          onOpenMountainPopup={handleOpenMountainPopup}
          onBackToRanks={handleBackToRanks}
        />
      );
    }

    switch (currentView) {
      case 'mountains':
        return (
          <MountainList
            className={styles.contentSection}
            mountains={mountains}
            onOpenLogin={openLogin}
            onOpenSignup={openSignup}
            onUploadSuccess={handleMountainUploadSuccess}
            onOpenMountainPopup={handleOpenMountainPopup}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            className={styles.contentSection}
            mountains={mountains}
          />
        );
      case 'ranks':
        return (
          <RanksPage
            className={styles.contentSection}
            allMountains={mountains}
            onOpenMountainPopup={handleOpenMountainPopup}
            onOpenPublicProfilePage={handleOpenPublicProfilePage}
          />
        );
      default:
        return <h1>Page not found</h1>;
    }
  };

  // ----------------------------------------------------- RETURN -------------------------------------------------------------------
  return (
    <div className={styles.app}>
      {/* ---------------- HEADER ---------------- */}
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <img
            src="/tattooLogo.svg"
            alt="Logo"
            className={styles.logo}
            /*style={{ width: '80px', height: '80px', marginTop: '-10px', marginBottom: '-10px' }}*/
          />
          <h1>Bösenstein project</h1>
          {/*<p className={styles.subtitle}>No bitches? Come, get into mountaineering!</p>*/}
        </div>
        <div className={styles.headerRight}>
          {isAdmin && ( // Only render admin button if user is an admin
            <button
              onClick={() => setCurrentView(prevView => prevView === 'admin' ? 'mountains' : 'admin')}
              className={`${styles.adminToggleBtn} ${currentView === 'admin' ? styles.adminToggleBtnActive : ''}`}
            >
              {currentView === 'admin' ? 'Exit Admin' : 'Admin Page'}
            </button>
          )}

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search mountains or users..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
            />
            <button onClick={() => handleSearch(searchQuery)} className={styles.searchButton}>
              Search
            </button>
          </div>
          <nav className={styles.navigation}>
            {currentView !== 'publicProfile' && (
              <ToggleSwitch
                currentState={currentView}
                onToggle={handleViewToggle}
              />
            )}
          </nav>
          <div className={styles.userInfo}>
            {currentUser ? (
              <div className={styles.loggedInUserInfo}>
                <button onClick={openProfileMenu} className={styles.pfpButton}>
                  <img
                    src={currentUser.pfp ? `${API_BASE_URL}/${currentUser.pfp}` : "https://via.placeholder.com/50"}
                    alt={`${currentUser.nickname}'s Profile`}
                    className={styles.pfpImage}
                  />
                </button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                {/* ----------------- not logged in? ----------------- */}
                <span>Not logged in</span>
                <button onClick={openLogin} className={styles.loginBtn}>
                  Login
                </button>
                <button onClick={openSignup} className={styles.signupBtn}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------- Main content --------- */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>

      {/* -------------------------- Popups -------------------------- */}
      <LoginPopup
        isOpen={showLogin}
        onClose={closeLogin}
        onSwitchToSignup={switchToSignup}
      />
      <SignupPopup
        isOpen={showSignup}
        onClose={closeSignup}
        onSwitchToLogin={switchToLogin}
      />
      {selectedMountainForPopup && (
        <MountainPopup
          mountain={selectedMountainForPopup}
          isOpen={isMountainPopupGlobalOpen}
          onClose={handleCloseMountainPopup}
          onOpenLogin={openLogin}
          onOpenSignup={openSignup}
        />
      )}

      <ProfileMenuPopup
        isOpen={isProfileMenuOpen}
        onClose={closeProfileMenu}
        onLogout={logout} // Pass logout function to the ProfileMenuPopup
      />
    </div>
  );
}

export default App;
