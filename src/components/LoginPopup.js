import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import styles from './LoginPopup.module.css';

function LoginPopup({ isOpen, onClose, onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        onClose();
        setUsername('');
        setPassword('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed, please try again later.');
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
          <h2>Login to Your Account</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter your username"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.switchAuth}>
            <p>Don't have an account?</p>
            <button onClick={onSwitchToSignup} className={styles.switchBtn}>
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
