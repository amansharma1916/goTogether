import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Assets/Navbar';
import '../../Styles/User/Profile.css';
import { useNotifications } from '../../context/NotificationContext';
import apiClient from '../../services/api';

interface UserData {
  id?: string;
  fullname: string;
  email: string;
  college?: string;
  createdAt?: string;
}


const Profile = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData>({
    fullname: '',
    email: '',
    college: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('LoggedInUser');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        console.log('Fetched user data:', parsedUser);
        
        setEditedData({
          fullname: parsedUser.fullname || '',
          email: parsedUser.email || '',
          college: parsedUser.college || '',
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      setEditedData({
        fullname: userData.fullname || '',
        email: userData.email || '',
        college: userData.college || '',
      });
    }
  };

  const handleSave = async () => {
    console.log('Saving edited data:', editedData);
    console.log('Current user data:', userData);
    if (!userData?.id) {
      setError('User ID not found. Please log in again.');
      return;
    }

    if (!editedData.fullname.trim()) {
      setError('Full name is required');
      return;
    }

    if (!editedData.email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.put(`/auth/update-profile/${userData.id}`, {
        fullname: editedData.fullname,
        email: editedData.email,
        college: editedData.college,
      });

      const data = response.data;

      if (data.success) {
        const updatedUser = { ...userData, ...data.user };
        localStorage.setItem('LoggedInUser', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        addNotification({
          title: 'Profile updated',
          message: 'Your account details were saved successfully.',
          type: 'success',
        });
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('LoggedInUser');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {userData.fullname.charAt(0).toUpperCase()}
            </div>
          </div>
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                <button className="btn-save" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          <div className="profile-info">
            <div className="info-group">
              <label className="info-label">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editedData.fullname}
                  onChange={(e) => setEditedData({ ...editedData, fullname: e.target.value })}
                />
              ) : (
                <p className="info-value">{userData.fullname}</p>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  className="info-input"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                />
              ) : (
                <p className="info-value">{userData.email}</p>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">College/University</label>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editedData.college}
                  onChange={(e) => setEditedData({ ...editedData, college: e.target.value })}
                  placeholder="Enter your college name"
                />
              ) : (
                <p className="info-value">{userData.college || 'Not specified'}</p>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">Member Since</label>
              <p className="info-value">{formatDate(userData.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Account Settings</h2>
          </div>
          
          <div className="profile-actions">
            <button className="action-item" onClick={() => navigate('/bookings')}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="action-content">
                <h3>My Bookings</h3>
                <p>View your ride bookings</p>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <button className="action-item" onClick={() => navigate('/rides')}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7" cy="13" r="2" strokeWidth="2"/>
                  <path d="M12 13a2 2 0 1 0 4 0" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="action-content">
                <h3>My Rides</h3>
                <p>View rides you've posted</p>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <button className="action-item action-danger" onClick={handleLogout}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="action-content">
                <h3>Logout</h3>
                <p>Sign out of your account</p>
              </div>
              <div className="action-arrow">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
