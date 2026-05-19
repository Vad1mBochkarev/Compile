const API_BASE_URL = '/api';

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  requireAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(access: string | null, refresh: string | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (access) {
      localStorage.setItem('access_token', access);
    } else {
      localStorage.removeItem('access_token');
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, requireAuth = false } = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth && this.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && requireAuth) {
      // Попытка обновить токен
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Повторный запрос с новым токеном
        requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse<T>(retryResponse);
      } else {
        this.setTokens(null, null);
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as { detail?: string | { msg?: string } };
      const message = typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail?.msg || 'Произошла ошибка';
      throw new Error(message);
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/refresh/?refresh_token=${this.refreshToken}`, {
        method: 'POST',
      });

      if (!response.ok) return false;

      const data = await response.json() as { access_token: string; refresh_token: string };
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async register(email: string, password: string) {
    return this.request<{ id: string; email: string; is_active: boolean; created_at: string; updated_at: string }>(
      '/register/',
      { method: 'POST', body: { email, password } }
    );
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; refresh_token: string; token_type: string }>(
      '/login/',
      { method: 'POST', body: { email, password } }
    );
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async logout() {
    this.setTokens(null, null);
  }

  // User
  async getMe() {
    return this.request<{
      id: string;
      email: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      profile: {
        id: string;
        user_id: string;
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        website: string | null;
        github: string | null;
        created_at: string;
        updated_at: string;
      } | null;
    }>('/users/me', { requireAuth: true });
  }

  async updateProfile(data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    website?: string;
    github?: string;
  }) {
    return this.request<{
      id: string;
      user_id: string;
      display_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      website: string | null;
      github: string | null;
      created_at: string;
      updated_at: string;
    }>('/users/me', { method: 'PUT', body: data, requireAuth: true });
  }

  // Articles
  async getArticles(skip = 0, limit = 20, status?: string) {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (status) params.set('status', status);
    return this.request<Array<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>>(`/articles/?${params.toString()}`);
  }

  async getMyArticles(skip = 0, limit = 20) {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    return this.request<Array<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>>(`/articles/my?${params.toString()}`, { requireAuth: true });
  }

  async getArticle(slug: string) {
    return this.request<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
      author: {
        id: string;
        email: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      } | null;
    }>(`/articles/${slug}`);
  }

  async createArticle(data: { title: string; slug: string; content: string; status: string }) {
    return this.request<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>('/articles/', { method: 'POST', body: data, requireAuth: true });
  }

  async updateArticle(slug: string, data: { title?: string; slug?: string; content?: string; status?: string }) {
    return this.request<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>(`/articles/${slug}`, { method: 'PUT', body: data, requireAuth: true });
  }

  async deleteArticle(slug: string) {
    return this.request<void>(`/articles/${slug}`, { method: 'DELETE', requireAuth: true });
  }

  async searchArticles(q: string, skip = 0, limit = 20) {
    const params = new URLSearchParams({ q, skip: String(skip), limit: String(limit) });
    return this.request<Array<{
      id: string;
      title: string;
      slug: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      published_at: string | null;
    }>>(`/search/?${params.toString()}`);
  }
}

export const apiClient = new ApiClient();
