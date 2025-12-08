import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MountainCard from './MountainCard';
import MountainPopup from './MountainPopup';
import UploadPopup from './UploadPopup';
import { useUser } from '../context/UserContext';
import Filter from './Filter';
import styles from './MountainList.module.css';
import Pagination from './Pagination';

function MountainList({ mountains, onOpenLogin, onOpenSignup, onUploadSuccess }) {
  const { currentUser } = useUser();
  console.log('[MountainList] Current User:', currentUser);
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [filter, setFilter] = useState({
    country: '',
    heightCategory: '',
    needsEquipment: null
  });
  const [sortOrder, setSortOrder] = useState('height-desc'); // Default to high to low

  // ------------------ Pagination states --------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const handleCardClick = (mountain) => {
    setSelectedMountain(mountain);
    setIsPopupOpen(true);
  };
  const closePopup = () => {
    setSelectedMountain(null);
    setIsPopupOpen(false);
  };
  const openUploadPopup = () => {
      console.log('[MountainList] openUploadPopup called. Setting isUploadPopupOpen to true.');
      setIsUploadPopupOpen(true);
  };
  const closeUploadPopup = () => {
    setIsUploadPopupOpen(false);
  };

  const handleUploadSuccess = (newMountain) => {
    console.log('New mountain uploaded: ', newMountain.name);
    onUploadSuccess(newMountain); // Call the prop to update parent state
    closeUploadPopup();
  };

  // ----------------------- Empty state handling --------------



  const heightCategories = {
    'baby': { min: 0, max: 3000, label: 'Baby heights' },
    '3000': { min: 3000, max: 4000, label: 'Three-thousanders' },
    '4000': { min: 4000, max: 5000, label: 'Four-thousanders' },
    '5000': { min: 5000, max: 6000, label: 'Five-thousanders' },
    '6000': { min: 6000, max: 7000, label: 'Six-thousanders' },
    '7000': { min: 7000, max: 8000, label: 'Seven-thousanders' },
    '8000': { min: 8000, max: 9000, label: 'Eight-thousanders' }
  };

  // Sort mountains based on the selected sortOrder
  const sortedMountains = [...mountains].sort((a, b) => {
    if (sortOrder === 'height-asc') {
      return a.height - b.height;
    }
    return b.height - a.height; // Default or 'height-desc'
  });

  const filteredMountains = sortedMountains.filter(mountain => {
    if (filter.heightCategory) {
      const category = heightCategories[filter.heightCategory];
      if (mountain.height < category.min || mountain.height >= category.max) {
        return false;
      }
    }
    if (filter.country && mountain.country !== filter.country) {
        return false;
    }
    if (filter.needsEquipment !== null && mountain.needsEquipment !== filter.needsEquipment) {
        return false;
    }
    return true;
  });

  // -----------------Calculate total pages -----------------
  const totalPages = Math.ceil(filteredMountains.length / itemsPerPage);

  // --------------- Get current mountains to display -------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMountains = filteredMountains.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filterType, value) => {
    setFilter(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilter({ country: '', heightCategory: '', needsEquipment: null });
    setSortOrder('height-desc'); // Reset sort order as well
    setCurrentPage(1); // Reset to first page on filter reset
  };
  const getFilteredTitle = () => {
    const totalCount = mountains.length;
    const filteredCount = filteredMountains.length;

    if (filteredCount === totalCount) {
      return `All Mountains (${totalCount})`;
    }

    const activeFilters = [];
    if (filter.country) activeFilters.push(filter.country);
    if (filter.heightCategory) activeFilters.push(heightCategories[filter.heightCategory].label);
    if (filter.needsEquipment !== null) {
      activeFilters.push(filter.needsEquipment ? 'Needs Equipment' : 'No Equipment');
    }
    if (sortOrder === 'height-desc') activeFilters.push('Height: High to Low');
    if (sortOrder === 'height-asc') activeFilters.push('Height: Low to High');


    if (activeFilters.length === 0) {
      return `All Mountains (${filteredCount} of ${totalCount})`;
    }

    return `Filtered Mountains: ${activeFilters.join(', ')} (${filteredCount} of ${totalCount})`;
  };

  return (
    <>
      <Helmet>
        <title>Browse Mountains | Bösenstein</title>
        <meta name="description" content="Explore and filter mountains, view detailed info, and share your climbs with the community." />
      </Helmet>
      <div>
      <div className={styles.resultsHeader}>
        <h2 className={styles.title}>{getFilteredTitle()}</h2>
        <div className={styles.filterWrapper}>
          <Filter
          filter={filter}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          mountains={mountains}
          heightCategories={heightCategories}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        </div>
      </div>
      {mountains.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No Mountains Found</h2>
          <p>There are no mountains to display yet.</p>
          {currentUser && (
            <button onClick={openUploadPopup} className={styles.uploadBtn}>
              Upload the First Mountain
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.mountainsGrid}>
            {currentMountains.map(mountain => (
              <MountainCard
                key={mountain.id}
                mountain={mountain}
                onCardClick={handleCardClick}
              />
            ))}

            {/*  ------------ Upload Card - Always show but handle click based on login ------------- */}
            <div
              className={`${styles.uploadCard} ${!currentUser ? styles.disabledUploadCard : ''}`}
              onClick={() => {
                console.log('[MountainList] Upload Card clicked. currentUser:', currentUser ? 'Logged In' : 'Not Logged In');
                if (currentUser) {
                  openUploadPopup();
                } else {
                  onOpenLogin();
                }
              }}
            >
              <div className={styles.uploadCardContent}>
                <div className={styles.uploadIcon}>+</div>
                <h3>Have now found your favourite?</h3>
                <p>{currentUser ? 'Upload here to share with the community!' : 'Log in to upload your own mountains!'}</p>
              </div>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {selectedMountain && (
        <MountainPopup
          mountain={selectedMountain}
          isOpen={isPopupOpen}
          onClose={closePopup}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
        />
      )}

      {console.log('[MountainList] isUploadPopupOpen before UploadPopup render:', isUploadPopupOpen)}
      <UploadPopup
        isOpen={isUploadPopupOpen}
        onClose={closeUploadPopup}
        onUploadSuccess={handleUploadSuccess}
    />
  </div>
  </>
);
}

export default MountainList;
