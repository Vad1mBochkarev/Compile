import React from 'react';
import { ClientArticleRenderer } from '../ArticleRenderer/ArticleRenderer';
import './ArticleCardPreview.css';

interface ArticleCardPreviewProps {
  content: string;
}

export const ArticleCardPreview: React.FC<ArticleCardPreviewProps> = ({ content }) => {
  return (
    <div className="article-card-preview">
      <ClientArticleRenderer rawMarkdown={content} className="article-card-preview__content" />
    </div>
  );
};
