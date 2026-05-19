import { create } from 'zustand';
import { apiClient } from '../api/client';
import { Article } from '../types/article';

interface ArticleState {
  articles: Article[];
  selectedArticle: Article | null;
  isLoading: boolean;
  error: string | null;
  setSelectedArticle: (article: Article | null) => void;
  loadArticles: (skip?: number, limit?: number, status?: string) => Promise<void>;
  loadArticle: (slug: string) => Promise<void>;
  addArticle: (article: { title: string; slug: string; content: string; status: string }) => Promise<Article>;
  updateArticle: (slug: string, updates: Partial<{ title: string; slug: string; content: string; status: string }>) => Promise<Article | null>;
  deleteArticle: (slug: string) => Promise<boolean>;
  getArticle: (slug: string) => Article | undefined;
  getArticles: (status?: string) => Article[];
}

function mapApiArticle(api: {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}): Article {
  return {
    id: api.id,
    title: api.title,
    slug: api.slug,
    content: api.content,
    status: api.status as 'draft' | 'published',
    authorId: api.author_id,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    publishedAt: api.published_at,
  };
}

export const useArticleStore = create<ArticleState>()(
  (set, get) => ({
    articles: [],
    selectedArticle: null,
    isLoading: false,
    error: null,

    setSelectedArticle: (article) => {
      set({ selectedArticle: article });
    },

    loadArticles: async (skip = 0, limit = 20, status) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiClient.getArticles(skip, limit, status);
        set({ articles: data.map(mapApiArticle) });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Ошибка загрузки статей' });
      } finally {
        set({ isLoading: false });
      }
    },

    loadArticle: async (slug) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiClient.getArticle(slug);
        const article = mapApiArticle(data);
        set({ selectedArticle: article });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Ошибка загрузки статьи' });
      } finally {
        set({ isLoading: false });
      }
    },

    addArticle: async (article) => {
      if (!article.title || !article.title.trim()) {
        throw new Error('Заголовок статьи не может быть пустым');
      }
      const data = await apiClient.createArticle(article);
      const newArticle = mapApiArticle(data);
      set((state) => ({ articles: [...state.articles, newArticle] }));
      return newArticle;
    },

    updateArticle: async (slug, updates) => {
      if (updates.title !== undefined && !updates.title.trim()) {
        throw new Error('Заголовок статьи не может быть пустым');
      }
      const data = await apiClient.updateArticle(slug, updates);
      const updatedArticle = mapApiArticle(data);
      set((state) => {
        const index = state.articles.findIndex((a) => a.slug === slug);
        if (index === -1) return state;
        const newArticles = [...state.articles];
        newArticles[index] = updatedArticle;
        return { articles: newArticles, selectedArticle: updatedArticle };
      });
      return updatedArticle;
    },

    deleteArticle: async (slug) => {
      try {
        await apiClient.deleteArticle(slug);
        set((state) => ({
          articles: state.articles.filter((a) => a.slug !== slug),
          selectedArticle: state.selectedArticle?.slug === slug ? null : state.selectedArticle,
        }));
        return true;
      } catch {
        return false;
      }
    },

    getArticle: (slug) => {
      return get().articles.find((a) => a.slug === slug);
    },

    getArticles: (status) => {
      const { articles } = get();
      if (status) {
        return articles.filter((a) => a.status === status);
      }
      return articles;
    },
  })
);
