import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import { useArticleStore } from '../store/articleStore';
import { ArticleCardPreview } from '../components/ArticleCardPreview/ArticleCardPreview';
import { formatDateShort } from '../lib/date';
import './HomePage.css';

const HomePage = () => {
  const articles = useArticleStore((state) => state.articles);
  const isLoading = useArticleStore((state) => state.isLoading);
  const loadArticles = useArticleStore((state) => state.loadArticles);

  useEffect(() => {
    loadArticles(0, 50, 'published');
  }, [loadArticles]);

  return (
    <div className="home-page">
      <Header />
      <div className="home-content">
        <h1 className="home-title">Последние публикации</h1>
        {isLoading ? (
          <p className="home-empty">Загрузка...</p>
        ) : articles.length === 0 ? (
          <p className="home-empty">Пока нет опубликованных статей</p>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <Link to={`/article/${article.id}`} key={article.id} className="article-card">
                <h3 className="article-card-title">{article.title || 'Без названия'}</h3>
                <ArticleCardPreview content={article.content} />
                <p className="article-card-date">
                  {formatDateShort(article.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
