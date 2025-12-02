import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import styles from './UploadPopup.module.css';
import API_BASE_URL from '../config/api';

function UploadPopup({ isOpen, onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    country: '',
    needsEquipment: false,
    images: [],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useUser();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // -------------- image upload ----------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let currentErrors = [];
    let processedFiles = [];

    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        currentErrors.push(`File '${file.name}' is not an image.`);
      } else if (file.size > 10 * 1024 * 1024) {
        currentErrors.push(`File '${file.name}' size exceeds 10MB (max 10MB).`);
      } else {
        processedFiles.push(file);
      }
    });

    if (currentErrors.length > 0) {
      setError(currentErrors.join(' '));
      setFormData(prev => ({ ...prev, images: [] }));
    } else {
      setFormData(prev => ({ ...prev, images: processedFiles }));
      setError('');
    }
  };

  // --------------------- submit ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a mountain name');
      return;
    }
    if (!formData.height || formData.height <= 0) {
      setError('Please enter a valid height');
      return;
    }
    if (!formData.country.trim()) {
      setError('Please enter a country');
      return;
    }
    if (formData.images.length === 0) {
      setError('Please select at least one image');
      return;
    }
    if (!currentUser) {
      setError('You need to be logged in to upload mountains');
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('height', formData.height);
      uploadData.append('country', formData.country);
      uploadData.append('needsEquipment', formData.needsEquipment);
      uploadData.append('description', formData.description);

      // Append all selected image files with field name 'images' for multer
      formData.images.forEach((imageFile) => {
        uploadData.append('images', imageFile);
      });

      const response = await fetch(`${API_BASE_URL}/api/mountains`, { // CHANGED FROM /mountains/upload to /mountains
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: uploadData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Reset form and close popup
        setFormData({
          name: '',
          height: '',
          country: '',
          needsEquipment: false,
          images: [],
          description: ''
        });
        onUploadSuccess(result.data);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onClose();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error. Please try again. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------- close -----------------
  const handleCloseAndClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData({
      name: '',
      height: '',
      country: '',
      needsEquipment: false,
      images: [],
      description: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // --------------------- RETURN ------------------- STATEMENT ---------------------------
  return (
    <div className={styles.modalOverlay} onClick={handleCloseAndClear}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleCloseAndClear}>×</button>

        <div className={styles.modalBody}>
          <h2>Upload New Mountain</h2>
          <p className={styles.subtitle}>Share your favorite peak with the community!</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              {/* --------- name ---------------------- */}
              <label htmlFor="name">Mountain Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter mountain name"
              />
            </div>

            {/* ----------- height ------------------------- */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="height">Height (meters) *</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Enter height in meters"
                  min="1"
                />
              </div>

              {/* --------------------- country ----------- */}
              <div className={styles.formGroup}>
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* --------------------- description ----------- */}
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Tell us about this mountain..."
                rows="4"
              ></textarea>
            </div>

            {/* --------------------- equipment ----------- */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="needsEquipment"
                  checked={formData.needsEquipment}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxText}>⛏️ Special equipment needed</span>
              </label>
            </div>

            {/* --------------------- images ----------- */}
            <div className={styles.formGroup}>
              <label htmlFor="images">Mountain Images *</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                required
                className={styles.fileInput}
                ref={fileInputRef}
              />
              {formData.images.length > 0 && (
                <div className={styles.imagePreview}>
                  {formData.images.map((imageFile, index) => (
                    <div key={index} className={styles.imagePreviewItem}>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt={`Preview ${index + 1}`}
                        className={styles.previewImage}
                      />
                      <span>{imageFile.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---------- submit ---------- */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Mountain'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadPopup;
