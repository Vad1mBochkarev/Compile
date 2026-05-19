import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!email.trim()) {
      setFormError('Введите email');
      return;
    }
    if (!password) {
      setFormError('Введите пароль');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Ошибка уже установлена в store
    }
  }, [email, password, login, navigate, clearError]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">compile</Link>
        <h1 className="auth-title">Вход</h1>

        {(error || formError) && (
          <div className="auth-error">{error || formError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Пароль</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="auth-footer">
          Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
