import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Header from './components/header/header'
import { ArticleList } from './components/ArticleList/ArticleList'
import { ArticleEditor } from './components/ArticleEditor/ArticleEditor'
import HomePage from './pages/HomePage'
import ArticleViewPage from './pages/ArticleViewPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useArticleStore } from './store/articleStore'
import { useAuthStore } from './store/authStore'
import { apiClient } from './api/client'
import { Article } from './types/article'

function EditorPage() {
  const articles = useArticleStore((state) => state.articles)
  const selectedArticle = useArticleStore((state) => state.selectedArticle)
  const setSelectedArticle = useArticleStore((state) => state.setSelectedArticle)
  const addArticle = useArticleStore((state) => state.addArticle)
  const updateArticle = useArticleStore((state) => state.updateArticle)
  const deleteArticle = useArticleStore((state) => state.deleteArticle)
  const { id } = useParams<{ id: string }>()

  const [filter, setFilter] = useState<Article['status'] | 'all'>('all')

  // Загрузка статьи по ID из URL
  useEffect(() => {
    if (id) {
      const article = articles.find(a => a.id === id)
      if (article) {
        setSelectedArticle(article)
      }
    }
  }, [id, articles, setSelectedArticle])

  const filteredArticles = filter === 'all'
    ? articles
    : articles.filter(a => a.status === filter)

  const handleSelect = useCallback((id: string) => {
    const article = articles.find(a => a.id === id)
    setSelectedArticle(article || null)
  }, [articles, setSelectedArticle])

  const handleNew = useCallback(async () => {
    const slug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const newArticle = await addArticle({
      title: 'Новая статья',
      slug,
      content: '',
      status: 'draft',
    })
    setSelectedArticle(newArticle)
  }, [addArticle, setSelectedArticle])


  const handleSave = useCallback(async (updates: Partial<Article>) => {
    if (selectedArticle) {
      await updateArticle(selectedArticle.slug, updates)
    }
  }, [selectedArticle, updateArticle])

  const handleDelete = useCallback(async () => {
    if (selectedArticle) {
      await deleteArticle(selectedArticle.slug)
      setSelectedArticle(null) // Сброс выбранной статьи после удаления
    }
  }, [selectedArticle, deleteArticle, setSelectedArticle])

  const handlePublish = useCallback(async () => {
    if (selectedArticle) {
      // Нельзя публиковать статью с пустым контентом
      if (!selectedArticle.content || !selectedArticle.content.trim()) {
        alert('Нельзя опубликовать статью с пустым содержимым')
        return
      }
      await updateArticle(selectedArticle.slug, { status: 'published' })
    }
  }, [selectedArticle, updateArticle])

  return (
    <div className="main">
      <Header />
      <div style={{ display: 'flex', height: 'calc(100vh - var(--header-height))' }}>
        <ArticleList
          articles={filteredArticles}
          selectedId={selectedArticle?.id || null}
          onSelect={handleSelect}
          onNew={handleNew}
          filter={filter}
          onFilterChange={setFilter}
        />
        <ArticleEditor
          article={selectedArticle}
          onSave={handleSave}
          onDelete={handleDelete}
          onPublish={handlePublish}
        />
      </div>
    </div>
  )
}

function App() {
  const { loadUser, isAuthenticated } = useAuthStore()

  // Загрузка токенов и пользователя при старте
  useEffect(() => {
    apiClient.loadTokensFromStorage()
    if (apiClient.isAuthenticated) {
      loadUser()
    }
  }, [loadUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticleViewPage />} />
        <Route path="/editor" element={isAuthenticated ? <EditorPage /> : <Navigate to="/login" replace />} />
        <Route path="/editor/:id" element={isAuthenticated ? <EditorPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
