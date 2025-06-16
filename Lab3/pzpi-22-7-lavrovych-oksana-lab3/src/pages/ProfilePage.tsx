import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile, changePassword } from '../api/userService';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '', 
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: (user as any).phone || '', 
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    setError('');

    try {
      const updatedUserData: User = await updateUserProfile(user.id, profileData);
      
      updateUser(updatedUserData);
      
      setMessage('Профіль успішно оновлено!');
    } catch (err) {
      setError('Не вдалося оновити профіль.');
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Нові паролі не співпадають.');
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage('Пароль успішно змінено!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' }); // Очищуємо поля
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не вдалося змінити пароль.');
    }
  };

  if (!user) {
    return <div>Завантаження профілю...</div>;
  }

  return (
    <div className="profile-page">
      <h1>Мій профіль</h1>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="profile-section">
        <form onSubmit={handleProfileSubmit}>
          <h2>Особисті дані</h2>
          <div className="form-group">
            <label htmlFor="name">Ім'я</label>
            <input id="name" name="name" type="text" value={profileData.name} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input id="phone" name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} />
          </div>
          <button type="submit">Зберегти зміни</button>
        </form>
      </div>

      <div className="profile-section">
        <form onSubmit={handlePasswordSubmit}>
          <h2>Зміна пароля</h2>
          <div className="form-group">
            <label htmlFor="oldPassword">Старий пароль</label>
            <input id="oldPassword" name="oldPassword" type="password" value={passwordData.oldPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Новий пароль</label>
            <input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Підтвердіть новий пароль</label>
            <input id="confirmNewPassword" name="confirmNewPassword" type="password" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} required />
          </div>
          <button type="submit">Змінити пароль</button>
        </form>
      </div>
      
      <div className="profile-section">
        <h2>Налаштування пріоритетних загроз</h2>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" name="threat" value="Fire" />
            Пожежа
          </label>
          <label>
            <input type="checkbox" name="threat" value="Gas Leak" />
            Витік газу
          </label>
          <label>
            <input type="checkbox" name="threat" value="Smoke" />
            Задимлення
          </label>
        </div>
        <button>Зберегти налаштування</button>
      </div>
    </div>
  );
};

export default ProfilePage;