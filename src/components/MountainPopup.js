import React, { useState } from 'react';
import styles from './MountainPopup.module.css';
import API_BASE_URL from '../config/api';
import { useUser } from '../context/UserContext';

function MountainPopup({ mountain, isOpen, onClose, onOpenLogin, onOpenSignup }) {
  const { currentUser, addToWishlist, markAsSummited, removeFromWishlist, unmarkSummited } = useUser();
  const [loading, setLoading] = useState({ wishlist: false, summited: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // For image gallery
  const [newImagesToUpload, setNewImagesToUpload] = useState([]); // For new uploads
  const [isUploadSectionOpen, setIsUploadSectionOpen] = useState(false); // To toggle upload form
  const [uploadingExtraImages, setUploadingExtraImages] = useState(false);
  const [extraImageError, setExtraImageError] = useState('');

  if (!isOpen) return null;

  const mountainId = mountain.id;

  // Ensure these checks use mountainId consistently
  const isInWishlist = currentUser?.wishlist?.includes(mountainId);
  const isSummited = currentUser?.summited?.includes(mountainId);

  // ------------------------------------------- Wishlist toggle -------------------------------
  const handleToggleWishlist = async () => {
    if (!mountainId) {
      console.error('No mountain ID found!');
      alert('Error: Mountain ID not found');
      return;
    }

    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setLoading(prev => ({ ...prev, wishlist: true }));
    try {
      let success;
      if (isInWishlist) {
        success = await removeFromWishlist(mountainId);
        if (success) {
          alert(`Removed ${mountain.name} from your wishlist!`);
        } else {
          alert(`Failed to remove ${mountain.name} from your wishlist!`);
        }
      } else {
        success = await addToWishlist(mountainId);
        if (success) {
          alert(`Added ${mountain.name} to your wishlist!`);
        } else {
          alert(`Failed to add ${mountain.name} to your wishlist!`);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('An error occurred. Please check the console.');
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }));
    }
  };
  // ----------------------------------- Summited toggle -----------------------------------
  const handleToggleSummited = async () => {
    if (!mountainId) {
      console.error('No mountain ID found!');
      alert('Error: Mountain ID not found');
      return;
    }

    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setLoading(prev => ({ ...prev, summited: true }));
    try {
      let success;
      if (isSummited) {
        success = await unmarkSummited(mountainId);
        if (success) {
          alert(`Removed ${mountain.name} from your summited list!`);
        } else {
          alert(`Failed to remove ${mountain.name} from your summited list!`);
        }
      } else {
        success = await markAsSummited(mountainId);
        if (success) {
          alert(`Marked ${mountain.name} as summited!`);
        } else {
          alert(`Failed to mark ${mountain.name} as summited!`);
        }
      }
    } catch (error) {
      console.error('Error toggling summited list:', error);
      alert('An error occurred. Please check the console.');
    } finally {
      setLoading(prev => ({ ...prev, summited: false }));
    }
  };

  // ---------------------------------- Image change ----------------------
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    let validFiles = [];
    let hasError = false;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setExtraImageError(`File '${file.name}' is not an image.`);
        hasError = true;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setExtraImageError(`File '${file.name}' size exceeds 10MB.`);
        hasError = true;
        return;
      }
      validFiles.push(file);
    });

    if (hasError) {
      setNewImagesToUpload([]);
    } else {
      setNewImagesToUpload(validFiles);
      setExtraImageError('');
    }
  };

  // ---------------------------------- Uploading new pics for existing mountains ----------
  const handleUploadMorePictures = async () => {
    setExtraImageError('');
    if (newImagesToUpload.length === 0) {
      setExtraImageError('Please select images to upload.');
      return;
    }
    if (!currentUser) {
      setExtraImageError('You must be logged in to upload images.');
      onOpenLogin();
      return;
    }

    setUploadingExtraImages(true);

    try {
      const uploadData = new FormData();
      newImagesToUpload.forEach((imageFile) => {
        uploadData.append('images', imageFile);
      });

      // Use PATCH method to /api/mountains/:id/images
      const response = await fetch(`${API_BASE_URL}/api/mountains/${mountainId}/images`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: uploadData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        alert('Images uploaded successfully!');
        setNewImagesToUpload([]);
        setIsUploadSectionOpen(false);
        const updatedMountain = {
          ...mountain,
          images: [...mountain.images, ...result.data.newImageUrls]
        };

        window.location.reload();
      } else {
        setExtraImageError(result.message || 'Failed to upload images.');
      }
    } catch (error) {
      console.error('Error uploading extra images:', error);
      setExtraImageError('Network error or server issue: ' + error.message);
    } finally {
      setUploadingExtraImages(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? mountain.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === mountain.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // --------------------------------- RETURN ------------------------ STATEMENT ------------------
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.modalBody}>
          {/* ----------- Main image display -------------------- */}
          <div className={styles.imageGallery}>
            {(mountain.images && mountain.images.length > 0) ? (
              <>
                <img
                  src={`${API_BASE_URL}/${mountain.images[currentImageIndex]}`}
                  alt={mountain.name}
                  className={styles.mainImage}
                />
                {mountain.images.length > 1 && (
                  <>
                    <button className={styles.navButtonLeft} onClick={handlePrevImage}>&#10094;</button>
                    <button className={styles.navButtonRight} onClick={handleNextImage}>&#10095;</button>
                  </>
                )}
              </>
            ) : (
              <img src={`${API_BASE_URL}/${mountain.images[currentImageIndex]}`}
                   alt={mountain.name}
                   className={styles.mainImage} />
            )}
          </div>
          <div className={styles.modalInfo}>
            <h2>{mountain.name}</h2>
            <div className={styles.detailsGrid}>
              {/*---- country ---------------------- */}
              <div className={styles.detailItem}>
                <span className={styles.label}>Country:</span>
                <span className={styles.value}>{mountain.country}</span>
              </div>
              {/*---- height ---------------------- */}
              <div className={styles.detailItem}>
                <span className={styles.label}>Height:</span>
                <span className={styles.value}>{mountain.height}m</span>
              </div>
              {/*---- difficulty ---------------------- */}
              {mountain.difficulty && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>Difficulty:</span>
                  <span className={`${styles.value} ${styles.difficultyRating}`}>
                    {mountain.difficulty}
                    <a
                      href="https://www.bergfreunde.eu/alpine-grades-calculator/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.difficultyInfoLink}
                      title="Learn more about difficulty ratings"
                    >
                      ❓
                    </a>
                  </span>
                </div>
              )}
              {/*---- equipment ---------------------- */}
              <div className={styles.detailItem}>
                <span className={styles.label}>Equipment:</span>
                <span className={styles.value}>
                  {mountain.needsEquipment ? '⛏️ Special equipment needed' : '🚶 No special equipment'}
                </span>
              </div>
            </div>
            {/*<div className={styles.detailItem}>
              <span className={styles.label}>Season: </span>
              <span className={styles.value}>{mountain.season}</span>
            </div>*/}
            {/* ---------------- description ------------ */}
            <div className={styles.descriptionSection}>
              <h3>About {mountain.name}</h3>
              <p>{mountain.description}</p>
            </div>

            {currentUser ? (
              <div className={styles.modalActions}>
                {/* ----------------- Wishlist Button -------------- */}
                <button
                  onClick={handleToggleWishlist}
                  className={`${styles.btn} ${isInWishlist ? styles.removeBtn : styles.wishlistBtn}`}
                  disabled={loading.wishlist}
                >
                  {loading.wishlist
                    ? (isInWishlist ? 'Removing...' : 'Adding...')
                    : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
                </button>

                {/* ------------------ Summited Button ---------------- */}
                <button
                  onClick={handleToggleSummited}
                  className={`${styles.btn} ${isSummited ? styles.removeBtn : styles.summitedBtn}`}
                  disabled={loading.summited}
                >
                  {loading.summited
                    ? (isSummited ? 'Removing...' : 'Marking...')
                    : (isSummited ? 'Unmark Summited' : 'Mark as Summited')}
                </button>

                {/* ------------------ Upload More Pictures Button ---------------- */}
                <button
                  onClick={() => setIsUploadSectionOpen(prev => !prev)}
                  className={`${styles.btn} ${styles.uploadMoreBtn}`}
                >
                  {isUploadSectionOpen ? 'Cancel Upload' : 'Upload More Pictures'}
                </button>
              </div>
            ) : (
              <div className={styles.loginPrompt}>
                {/* --------------------------- not logged in --------------------------- */}
                <h3>Want to track this mountain?</h3>
                <p>Log in or sign up to add mountains to your wishlist and track your summits!</p>
                <div className={styles.authActions}>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className={`${styles.btn} ${styles.loginBtn}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSignup();
                    }}
                    className={`${styles.btn} ${styles.signupBtn}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
            {currentUser && isUploadSectionOpen && (
              <div className={styles.uploadExtraImagesSection}>
                {/* --------------------------- upload new image --------------------------- */}
                <h3>Add More Pictures</h3>
                {extraImageError && <div className={styles.error}>{extraImageError}</div>}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImageChange}
                  className={styles.fileInput}
                />
                {newImagesToUpload.length > 0 && (
                  <div className={styles.newImagePreviews}>
                    {newImagesToUpload.map((file, index) => (
                      <div key={index} className={styles.newImagePreviewItem}>
                        <img src={URL.createObjectURL(file)} alt={`New upload ${index + 1}`} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleUploadMorePictures}
                  className={styles.uploadExtraBtn}
                  disabled={newImagesToUpload.length === 0 || uploadingExtraImages}
                >
                  {uploadingExtraImages ? 'Uploading...' : 'Upload Selected Images'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MountainPopup;
