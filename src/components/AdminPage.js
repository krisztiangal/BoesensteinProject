import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import API_BASE_URL from '../config/api';
import { useUser } from '../context/UserContext'; // Import useUser to get the token
import MountainCard from './MountainCard'; // Import MountainCard for consistent display
import MountainPopup from './MountainPopup'; // In case admin wants to view full details

const AdminPage = () => {
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useUser(); // Get the current user to access the token

    const fetchMountainsForAdmin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/mountains`);
            const data = await response.json();
            if (data.success) {
                setMountains(data.data);
            } else {
                console.error('Error fetching mountains for admin:', data.message);
                setError(data.message || 'Failed to fetch mountains.');
                setMountains([]);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setError('Network error or server issue while fetching mountains.');
            setMountains([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMountainsForAdmin();
    }, []);

    const handleDeleteMountain = async (mountainId) => {
        if (!currentUser || !currentUser.token) {
            alert('You must be logged in to delete a mountain.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this mountain and all its associated pictures?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/mountains/${mountainId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`, // Add authorization token
                    },
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setMountains(prevMountains => prevMountains.filter(mountain => mountain.id !== mountainId));
                    alert('Mountain deleted successfully!');
                } else {
                    alert(`Failed to delete mountain: ${result.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting mountain:', error);
                alert('An error occurred while deleting the mountain.');
            }
        }
    };

    const handleDeletePicture = async (mountainId, imageUrl) => {
        console.log(`[handleDeletePicture] Attempting to delete picture. MountainId: ${mountainId}, ImageUrl: ${imageUrl}`);
        if (!currentUser || !currentUser.token) {
            alert('You must be logged in as an admin to delete a picture.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete this picture: ${imageUrl}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/mountains/${mountainId}/pictures`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`,
                    },
                    body: JSON.stringify({ imageUrl }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setMountains(prevMountains =>
                        prevMountains.map(mountain =>
                            mountain.id === mountainId
                                ? { ...mountain, images: result.data } // backend returns updated images array
                                : mountain
                        )
                    );
                    alert('Picture deleted successfully!');
                } else {
                    alert(`Failed to delete picture: ${result.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting picture:', error);
                alert('An error occurred while deleting the picture.');
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.adminPage}>
                <p>Loading admin data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.adminPage}>
                <p className={styles.error}>{error}</p>
                <button onClick={fetchMountainsForAdmin}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <h1>Admin Panel</h1>

            <section className={styles.section}>
                <h2>Manage Mountains and Pictures</h2>
                {mountains.length > 0 ? (
                    <ul className={styles.list}>
                        {mountains.map(mountain => (
                            <li key={mountain.id} className={styles.listItem}>
                                <div className={styles.mountainDetails}>
                                    <span>{mountain.name} (ID: {mountain.id})</span>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteMountain(parseInt(mountain.id, 10))}
                                    >
                                        Delete Mountain
                                    </button>
                                </div>
                                {mountain.images && mountain.images.length > 0 && (
                                    <div className={styles.imageGalleryAdmin}>
                                        <h3>Pictures:</h3>
                                        <div className={styles.imageGrid}>
                                            {mountain.images.map((imageUrl, imgIndex) => (
                                                <div key={imgIndex} className={styles.imageItem}>
                                                    <img
                                                        src={`${API_BASE_URL}/${imageUrl}`}
                                                        alt={`Mountain ${mountain.name} picture ${imgIndex + 1}`}
                                                        className={styles.adminImagePreview}
                                                    />
                                                    <button
                                                        className={styles.deletePictureButton}
                                                        onClick={() => handleDeletePicture(parseInt(mountain.id, 10), imageUrl)}
                                                    >
                                                        Delete Picture
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No mountains found.</p>
                )}
            </section>
        </div>
    );
};

export default AdminPage;
