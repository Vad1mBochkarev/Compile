import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AuthPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password.length < 6) {
      setFormError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }

    try {
      await register(email, password);
      navigate('/');
    } catch {
      // Ошибка уже установлена в store
    }
  }, [email, password, confirmPassword, register, navigate, clearError]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">compile</Link>
        <h1 className="auth-title">Регистрация</h1>

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
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">Подтверждение пароля</label>
            <input
              id="confirmPassword"
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
