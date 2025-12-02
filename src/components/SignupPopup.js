import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import styles from './LoginPopup.module.css';

function SignupPopup({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [pfp, setPfp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useUser();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0] && e.target.files[0].size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      e.target.value = null;
      setPfp(null);
    } else {
      setPfp(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signupData = new FormData();
      signupData.append('username', formData.username);
      signupData.append('password', formData.password);
      signupData.append('nickname', formData.name);
      if (pfp) {
        signupData.append('pfp', pfp);
      }

      const result = await signup(signupData);

      if (result.success) {
        onClose();
        setFormData({ name: '', username: '', password: '' });
        setPfp(null);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Signup failed, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.modalBody}>
          <h2>Create Your Account</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">Nickname:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Do not use any passwords you use elsewhere"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pfp">Profile Picture (Optional):</label>
              <input
                type="file"
                id="pfp"
                name="pfp"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>

          <div className={styles.switchAuth}>
            <p>Already have an account?</p>
            <button onClick={onSwitchToLogin} className={styles.switchBtn}>
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPopup;
