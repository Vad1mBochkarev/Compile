import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/header/header';
import { ClientArticleRenderer } from '../components/ArticleRenderer/ArticleRenderer';
import { useArticleStore } from '../store/articleStore';
import { formatDate } from '../lib/date';
import './ArticleViewPage.css';

const ArticleViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const selectedArticle = useArticleStore((state) => state.selectedArticle);
  const isLoading = useArticleStore((state) => state.isLoading);
  const loadArticle = useArticleStore((state) => state.loadArticle);

  useEffect(() => {
    if (id) {
      // Пробуем найти в уже загруженных статьях
      const articles = useArticleStore.getState().articles;
      const existing = articles.find(a => a.id === id);
      if (existing) {
        useArticleStore.getState().setSelectedArticle(existing);
      } else {
        // Загружаем с API по slug (id на фронте = id на бэкенде)
        // Для простоты используем id как slug
        loadArticle(id);
      }
    }
  }, [id, loadArticle]);

  if (isLoading) {
    return (
      <div className="article-view-page">
        <Header />
        <div className="article-view-not-found">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!selectedArticle) {
    return (
      <div className="article-view-page">
        <Header />
        <div className="article-view-not-found">
          <h1>Статья не найдена</h1>
          <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-view-page">
      <Header />
      <div className="article-view-content">
        <article className="article-view-article">
          <header className="article-view-header">
            <h1 className="article-view-title">{selectedArticle.title}</h1>
            <div className="article-view-meta">
              <time className="article-view-date">
                {formatDate(selectedArticle.updatedAt)}
              </time>
              <span className={`article-view-status status-${selectedArticle.status}`}>
                {selectedArticle.status === 'published' ? 'Опубликовано' : 'Черновик'}
              </span>
            </div>
          </header>
          <ClientArticleRenderer
            rawMarkdown={selectedArticle.content}
            className="article-body"
          />
        </article>
      </div>
    </div>
  );
};

export default ArticleViewPage;
