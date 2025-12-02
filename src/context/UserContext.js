import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [currentUser]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.data);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setCurrentUser(null);
  };

  const signup = async (userData) => { // userData is now FormData
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        body: userData // Send FormData directly
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.data); // Expecting full user data from backend
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const addToWishlist = async (mountainId) => {
    if (!currentUser) {
      console.log('User not logged in');
      return false;
    }

    try {
      console.log(`Adding mountain ${mountainId} to wishlist for user ${currentUser.username}`);
      const response = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ username: currentUser.username, mountainId })
      });

      const data = await response.json();
      console.log('Wishlist update API result:', data);

      if (data.success) {
        // Update currentUser with the new wishlist
        setCurrentUser(prev => ({
          ...prev,
          wishlist: data.data || []
        }));
        return true;
      } else {
        console.error('Error updating wishlist:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const markAsSummited = async (mountainId) => {
    if (!currentUser) {
      console.log('User not logged in');
      return false;
    }

    try {
      console.log(`Marking mountain ${mountainId} as summited for user ${currentUser.username}`);
      const response = await fetch(`${API_BASE_URL}/api/users/summited`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ username: currentUser.username, mountainId })
      });

      const data = await response.json();
      console.log('Summited update API result:', data);

      if (data.success) {
        // Update currentUser with the new summited list
        setCurrentUser(prev => ({
          ...prev,
          summited: data.data || []
        }));
        return true;
      } else {
        console.error('Error marking as summited:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error marking as summited:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const removeFromWishlist = async (mountainId) => {
    if (!currentUser) {
      console.log('User not logged in');
      return false;
    }

    try {
      console.log(`Removing mountain ${mountainId} from wishlist for user ${currentUser.username}`);
      const response = await fetch(`${API_BASE_URL}/api/users/wishlist/${mountainId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      const data = await response.json();
      console.log('Wishlist removal API result:', data);

      if (data.success) {
        setCurrentUser(prev => ({
          ...prev,
          wishlist: data.data || []
        }));
        return true;
      } else {
        console.error('Error removing from wishlist:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const unmarkSummited = async (mountainId) => {
    if (!currentUser) {
      console.log('User not logged in');
      return false;
    }

    try {
      console.log(`Unmarking mountain ${mountainId} as summited for user ${currentUser.username}`);
      const response = await fetch(`${API_BASE_URL}/api/users/summited/${mountainId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      const data = await response.json();
      console.log('Summited unmark API result:', data);

      if (data.success) {
        setCurrentUser(prev => ({
          ...prev,
          summited: data.data || []
        }));
        return true;
      } else {
        console.error('Error unmarking summited:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error unmarking summited:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const updateUserPfp = async (formData) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.username}/pfp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(prev => ({
          ...prev,
          pfp: data.data.pfpUrl,
        }));
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return { success: false, message: 'Network error: ' + error.message };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    addToWishlist,
    markAsSummited,
    removeFromWishlist,
    unmarkSummited,
    updateUserPfp,
    // updateUserSocials, // Removed updateUserSocials
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
