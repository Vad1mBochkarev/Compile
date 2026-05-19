import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../../types/article';
import { ClientArticleRenderer } from '../ArticleRenderer/ArticleRenderer';
import './ArticleEditor.css';

interface ArticleEditorProps {
  article: Article | null;
  onSave: (updates: Partial<Article>) => void;
  onDelete: () => void;
  onPublish: () => void;
}

const AUTOSAVE_DELAY = 2000; // 2 секунды после последнего изменения

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  onSave,
  onDelete,
  onPublish,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // useRef для хранения таймера автосохранения
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setLastSaved(null);
      setValidationError(null);
    } else {
      // Сброс состояния при отсутствии статьи
      setTitle('');
      setContent('');
      setLastSaved(null);
      setValidationError(null);
    }
  }, [article?.id, article]);

  // Debounced автосохранение черновиков с useRef
  useEffect(() => {
    if (!article || article.status !== 'draft') return;
    if (!title && !content) return; // Не сохранять пустые черновики

    // Очищаем предыдущий таймер
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      onSave({ title, content });
      setLastSaved(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setIsSaving(false), 500);
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, content, article?.id, article?.status, onSave]);

  if (!article) {
    return (
      <div className="article-editor">
        <div className="article-editor__empty">Выберите статью или создайте новую</div>
      </div>
    );
  }

  const handleSave = () => {
    setValidationError(null);
    try {
      setIsSaving(true);
      onSave({ title, content });
      setLastSaved(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      }
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="article-editor">
      <div className="article-editor__header">
        <input
          className="article-editor__title-input"
          type="text"
          placeholder="Название статьи..."
          value={title}
          onChange={handleTitleChange}
        />
        <div className="article-editor__actions">
          {lastSaved && !isSaving && (
            <span className="article-editor__save-status">Сохранено в {lastSaved}</span>
          )}
          {isSaving && (
            <span className="article-editor__save-status article-editor__save-status--saving">
              Сохранение...
            </span>
          )}
          <button
            className="article-editor__btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Скрыть превью' : 'Показать превью'}
          </button>
          <button
            className="article-editor__btn article-editor__btn--danger"
            onClick={onDelete}
          >
            Удалить
          </button>
          {article.status === 'draft' && (
            <button
              className="article-editor__btn article-editor__btn--primary"
              onClick={onPublish}
            >
              Опубликовать
            </button>
          )}
          <button
            className="article-editor__btn article-editor__btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
      {validationError && (
        <div className="article-editor__error">{validationError}</div>
      )}
      <div className="article-editor__body">
        <textarea
          className="article-editor__textarea"
          placeholder="Напишите статью в Markdown..."
          value={content}
          onChange={handleContentChange}
        />
        {showPreview && (
          <div className="article-editor__preview">
            <ClientArticleRenderer rawMarkdown={content} />
          </div>
        )}
      </div>
    </div>
  );
};
