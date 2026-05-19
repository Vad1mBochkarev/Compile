import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import './header.css'

const Header: React.FC = () => {
  const { getInitials } = useProfileStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const displayName = user?.profile?.display_name || user?.email || '';
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : getInitials();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon"></span>
        compile
      </Link>

      <div className="actions">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="btn btn-ghost">
              Профиль
            </Link>
            <Link to="/editor" className="btn btn-primary">
              Создать статью
            </Link>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Войти
            </Link>
            <Link to="/register" className="btn btn-primary">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

