import React, { useState, useEffect, useMemo } from 'react';
import { parseMarkdownToHtml } from '../../lib/markdown';

interface ClientArticleRendererProps {
  rawMarkdown: string;
  className?: string;
}

export const ClientArticleRenderer: React.FC<ClientArticleRendererProps> = ({
  rawMarkdown,
  className = 'article-body'
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(true);
  const [parseError, setParseError] = useState<string | null>(null);

  // Мемоизация для предотвращения повторного парсинга одинакового контента
  const memoizedMarkdown = useMemo(() => rawMarkdown, [rawMarkdown]);

  useEffect(() => {
    const parseMarkdown = async () => {
      setIsParsing(true);
      setParseError(null);
      try {
        const result = await parseMarkdownToHtml(memoizedMarkdown);
        setHtmlContent(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        setParseError(errorMessage);
        setHtmlContent('');
      } finally {
        setIsParsing(false);
      }
    };

    if (memoizedMarkdown) {
      parseMarkdown();
    } else {
      setIsParsing(false);
    }
  }, [memoizedMarkdown]);

  if (isParsing) {
    return <div className={className}>Загрузка контента...</div>;
  }

  if (parseError) {
    return (
      <div className={className}>
        <div className="article-renderer-error">
          <h3>Ошибка загрузки контента</h3>
          <p>Не удалось обработать Markdown. Попробуйте позже.</p>
          <details>
            <summary>Технические детали</summary>
            <pre>{parseError}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};