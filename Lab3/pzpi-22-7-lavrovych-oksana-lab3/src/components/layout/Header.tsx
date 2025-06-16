import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  toggleSidebar: () => void; 
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i> 
        </button>
        <div className="header-title">
          Система моніторингу безпеки
        </div>
      </div>

      <div className="header-right">
        {user ? (
          <>
            <span className="user-greeting">Вітаємо, {user.name}!</span>
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Вийти</span>
            </button>
          </>
        ) : (
          <span className="user-greeting">Гість</span>
        )}
      </div>
    </header>
  );
};

export default Header;