import React, { useState } from 'react';
import styles from './Filter.module.css';

function Filter({ filter, onFilterChange, onResetFilters, mountains, heightCategories, sortOrder, onSortChange }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const countries = [...new Set(mountains.map(mountain => mountain.country))];

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleApplyFilters = () => {
    setIsPopupOpen(false);
  };

  const handleResetAndClose = () => {
    onResetFilters();
    setIsPopupOpen(false);
  };

  return (
    <div className={styles.filterContainer}>
      {/* ------------------------- Filter Trigger Button ------------------------- */}
      <button className={styles.filterTriggerBtn} onClick={togglePopup}>
        <svg style={{height: '1.5rem', width: '1.5rem'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        Filter or sort here
        {Object.values(filter).some(value => value !== '' && value !== null) && (
          <span className={styles.filterIndicator}>•</span>
        )}
      </button>

      {/* ------------------------------ Filter Popup ------------------------------ */}
      {isPopupOpen && (
        <div className={styles.filterPopupOverlay} onClick={togglePopup}>
          <div className={styles.filterPopup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.filterPopupHeader}>
              <h3>Filter Mountains</h3>
              <button className={styles.closePopupBtn} onClick={togglePopup}>×</button>
            </div>

            <div className={styles.filterPopupContent}>
              {/* Country Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} style={{ marginTop: '-2rem' }}>📍 Country:</label>
                <select
                  value={filter.country}
                  onChange={(e) => onFilterChange('country', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---------------------- Height Category Filter --------------------------- */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>📏 Height Category:</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="heightCategory"
                      value=""
                      checked={filter.heightCategory === ''}
                      onChange={(e) => onFilterChange('heightCategory', e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>All Heights</span>
                  </label>
                  {Object.entries(heightCategories).map(([key, category]) => (
                    <label key={key} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="heightCategory"
                        value={key}
                        checked={filter.heightCategory === key}
                        onChange={(e) => onFilterChange('heightCategory', e.target.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ---------------------- Equipment Needs Filter --------------------------- */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>🎒 Equipment Needs:</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="equipment"
                      checked={filter.needsEquipment === null}
                      onChange={() => onFilterChange('needsEquipment', null)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>All Equipment Types</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="equipment"
                      checked={filter.needsEquipment === true}
                      onChange={() => onFilterChange('needsEquipment', true)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>⛏️ Needs Special Equipment</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="equipment"
                      checked={filter.needsEquipment === false}
                      onChange={() => onFilterChange('needsEquipment', false)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>🚶 No Special Equipment</span>
                  </label>
                </div>

                {/* ---------------------- Sort By Height Filter --------------------------- */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} style={{ marginTop: '2rem' }}>⛰️ Sort By Height:</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="sortOrder"
                        value="height-desc"
                        checked={sortOrder === 'height-desc'}
                        onChange={(e) => onSortChange(e.target.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>Height: High to Low</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="sortOrder"
                        value="height-asc"
                        checked={sortOrder === 'height-asc'}
                        onChange={(e) => onSortChange(e.target.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>Height: Low to High</span>
                    </label>
                  </div>
                </div>
              </div>

                {/* ---------------------- Active Filters Display --------------------------- */}
                <div className={styles.activeFilters}>
                  <h4>Active Filters:</h4>
                  <div className={styles.filterTags}>
                    {filter.country && (
                      <span className={styles.filterTag}>
                        Country: {filter.country}
                      </span>
                    )}
                    {filter.heightCategory && (
                      <span className={styles.filterTag}>
                        Height: {heightCategories[filter.heightCategory].label}
                      </span>
                    )}
                    {filter.needsEquipment !== null && (
                      <span className={styles.filterTag}>
                        Equipment: {filter.needsEquipment ? 'Needs Equipment' : 'No Equipment'}
                      </span>
                    )}
                    {sortOrder === 'height-desc' && (
                      <span className={styles.filterTag}>
                        Sort: Height High to Low
                      </span>
                    )}
                    {sortOrder === 'height-asc' && (
                      <span className={styles.filterTag}>
                        Sort: Height Low to High
                      </span>
                    )}
                    {Object.values(filter).every(value => value === '' || value === null) && (
                      <span className={styles.noFilters}>
                        No active filters
                      </span>
                    )}
                  </div>
                </div>
              </div>

            <div className={styles.filterPopupActions}>
              <button className={styles.btnSecondary} onClick={handleResetAndClose}>
                Reset
              </button>
              <button className={styles.btnPrimary} onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filter;
