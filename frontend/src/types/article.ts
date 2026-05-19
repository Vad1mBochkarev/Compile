export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface ArticleStore {
  articles: Article[];
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Article;
  updateArticle: (id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>) => Article | null;
  deleteArticle: (id: string) => boolean;
  getArticle: (id: string) => Article | undefined;
  getArticles: (status?: Article['status']) => Article[];
}
