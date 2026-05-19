import React from 'react';
import { Article } from '../../types/article';
import { formatDateShort } from '../../lib/date';
import './ArticleList.css';

interface ArticleListProps {
  articles: Article[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  filter?: Article['status'] | 'all';
  onFilterChange: (filter: Article['status'] | 'all') => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  selectedId,
  onSelect,
  onNew,
  filter = 'all',
  onFilterChange,
}) => {
  return (
    <div className="article-list">
      <div className="article-list__header">
        <h2 className="article-list__title">Статьи</h2>
        <button className="article-list__btn" onClick={onNew}>+ Новая</button>
      </div>
      
      <div className="article-list__filters">
        {(['all', 'draft', 'published'] as const).map(f => (
          <button
            key={f}
            className={`article-list__filter ${filter === f ? 'article-list__filter--active' : ''}`}
            onClick={() => onFilterChange(f)}
          >
            {f === 'all' ? 'Все' : f === 'draft' ? 'Черновики' : 'Опубликованные'}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="article-list__empty">Нет статей</div>
      ) : (
        articles.map(article => (
          <div
            key={article.id}
            className={`article-list__item ${selectedId === article.id ? 'article-list__item--selected' : ''}`}
            onClick={() => onSelect(article.id)}
          >
            <div className="article-list__item-title">{article.title || 'Без названия'}</div>
            <div className="article-list__item-meta">
              <span>{formatDateShort(article.updatedAt)}</span>
              <span className={`article-list__item-status article-list__item-status--${article.status}`}>
                {article.status === 'draft' ? 'Черновик' : 'Опубликовано'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
