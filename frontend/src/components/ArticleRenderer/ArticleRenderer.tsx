import React, { useState, useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

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

  useEffect(() => {
    // Создаем асинхронную функцию внутри useEffect
    const parseMarkdown = async () => {
      setIsParsing(true);
      try {
        const result = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(rawMarkdown);
        
        setHtmlContent(String(result));
      } catch (error) {
        console.error('Ошибка парсинга Markdown:', error);
        setHtmlContent('<p>Ошибка при загрузке содержимого.</p>');
      } finally {
        setIsParsing(false);
      }
    };

    parseMarkdown();
  }, [rawMarkdown]); // Перепарсиваем, если markdown изменился (удобно для live-preview)

  if (isParsing) {
    // Здесь можно показать скелетон или лоадер
    return <div className={className}>Загрузка контента...</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};