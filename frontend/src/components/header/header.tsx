import React from 'react';
import './header.css'

interface HeaderProps {
  onWriteClick?: () => void;
  onPublishClick?: () => void;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onWriteClick,
  onPublishClick,
  onSearch,
}) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input && onSearch) {
      onSearch(input.value);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon"></span>
        compile
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <svg className="search-icon" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input type="text" placeholder="Поиск..." />
        <span className="search-kbd">⌘K</span>
      </form>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onWriteClick}>
          Написать
        </button>
        <button className="btn btn-primary" onClick={onPublishClick}>
          Публикация
        </button>
        <div className="avatar">АК</div>
      </div>
    </header>
  );
};

export default Header;
