import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './header.css'

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

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

