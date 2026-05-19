import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { formatDateShort } from '../lib/date';
import './ProfilePage.css';

// SVG иконки
const GlobeIcon = () => (
  <svg className="profile-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="profile-link-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const ProfilePage = () => {
  const { user, loadUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Локальное состояние для формы
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');

  // Загрузка данных пользователя
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Инициализация формы при загрузке данных
  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.display_name || '');
      setBio(user.profile.bio || '');
      setWebsite(user.profile.website || '');
      setGithub(user.profile.github || '');
    }
  }, [user?.profile]);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Сохраняем изменения
      apiClient.updateProfile({
        display_name: displayName,
        bio: bio || undefined,
        website: website || undefined,
        github: github || undefined,
      }).then(() => {
        loadUser();
        setIsEditing(false);
        setError(null);
      }).catch((err) => {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения');
      });
    } else {
      // Загружаем текущие значения в форму
      if (user?.profile) {
        setDisplayName(user.profile.display_name || '');
        setBio(user.profile.bio || '');
        setWebsite(user.profile.website || '');
        setGithub(user.profile.github || '');
      }
      setIsEditing(true);
      setError(null);
    }
  }, [isEditing, user, displayName, bio, website, github, loadUser]);

  const handleCancel = useCallback(() => {
    if (user?.profile) {
      setDisplayName(user.profile.display_name || '');
      setBio(user.profile.bio || '');
      setWebsite(user.profile.website || '');
      setGithub(user.profile.github || '');
    }
    setIsEditing(false);
    setError(null);
  }, [user]);


  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-content">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  const profile = user.profile;
  const avatarUrl = profile?.avatar_url;
  const display = profile?.display_name || user.email;
  const initials = display.slice(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        {error && <div className="profile-error">{error}</div>}

        {/* Карточка профиля */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={display} />
              ) : (
                initials
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{display}</h1>
              <p className="profile-member-since">
                Участник с {formatDateShort(user.created_at)}
              </p>
            </div>
            <div className="profile-actions">
              <button
                className={`btn ${isEditing ? 'btn-primary' : 'btn-ghost'}`}
                onClick={handleEditToggle}
              >
                {isEditing ? 'Сохранить' : 'Редактировать'}
              </button>
              {isEditing && (
                <button className="btn btn-ghost" onClick={handleCancel}>
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Режим редактирования */}
        {isEditing ? (
          <div className="profile-card">
            <h2 className="profile-section-title">Редактирование профиля</h2>
            <div className="profile-edit-form">
              <div className="profile-form-group">
                <label className="profile-form-label" htmlFor="displayName">
                  Отображаемое имя
                </label>
                <input
                  id="displayName"
                  className="profile-form-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label" htmlFor="bio">
                  Биография
                </label>
                <textarea
                  id="bio"
                  className="profile-form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе..."
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label" htmlFor="website">
                  Личный сайт
                </label>
                <input
                  id="website"
                  className="profile-form-input"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label" htmlFor="github">
                  GitHub профиль
                </label>
                <input
                  id="github"
                  className="profile-form-input"
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Биография */}
            <div className="profile-card">
              <h2 className="profile-section-title">Биография</h2>
              {profile?.bio ? (
                <p className="profile-bio">{profile.bio}</p>
              ) : (
                <p className="profile-bio-empty">Биография не указана</p>
              )}
            </div>

            {/* Ссылки */}
            <div className="profile-card">
              <h2 className="profile-section-title">Ссылки</h2>
              <div className="profile-links">
                {profile?.website ? (
                  <a
                    href={profile.website}
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlobeIcon />
                    {profile.website}
                  </a>
                ) : (
                  <p className="profile-link-empty">Личный сайт не указан</p>
                )}
                {profile?.github ? (
                  <a
                    href={profile.github}
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon />
                    {profile.github.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                ) : (
                  <p className="profile-link-empty">GitHub профиль не указан</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Статистика (заглушка) */}
        <div className="profile-card">
          <h2 className="profile-section-title">Статистика</h2>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">0</span>
              <span className="profile-stat-label">Статей</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">0</span>
              <span className="profile-stat-label">Комментариев</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">0</span>
              <span className="profile-stat-label">Избранного</span>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="profile-card">
          <Link to="/" className="btn btn-ghost">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
