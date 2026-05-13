import Header from './components/header/header'
import { ClientArticleRenderer } from './components/ArticleRenderer/ArticleRenderer'

const articles = [
  `# Тестовая статья

Это **жирный текст** и *курсив*.

## Список

- Пункт 1
- Пункт 2
- Пункт 3

## Таблица (GFM)

| Функция | Статус |
|---------|--------|
| Парсинг | ✅ |
| GFM | ✅ |

## Код

\`\`\`typescript
const x: number = 42;
\`\`\`
`,

  `# React Context в TypeScript

**React Context** — это механизм для передачи данных через дерево компонентов без необходимости пропсов на каждом уровне.

## Типизация контекста

\`\`\`typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
\`\`\`

## Использование хука

\`\`\`typescript
const themeContext = useContext(ThemeContext);
if (!themeContext) {
  throw new Error('useContext must be used within Provider');
}
\`\`\`

### Преимущества

- Избегает **prop drilling**
- Нативная поддержка в React
- Полная типизация в TypeScript

### Когда использовать

| Ситуация | Рекомендация |
|----------|-------------|
| Глобальная тема | ✅ Context |
| Кэш данных | ❌ Zustand/Redux |
| Локальный стейт | ❌ useState |
`,

  `# Заметки по Docker

Docker — платформа для **контейнеризации** приложений.

## Основные команды

\`\`\`bash
# Собрать образ
docker build -t myapp .

# Запустить контейнер
docker run -p 3000:3000 myapp

# Посмотреть логи
docker logs -f <container_id>
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
\`\`\`

## Чек-лист перед деплоем

- [x] Собрать образ
- [x] Проверить логи
- [ ] Настроить healthcheck
- [ ] Настроить volumes для данных
`,

  `# Паттерны проектирования

Паттерны — это **повторно используемые** решения типичных задач.

## Порождающие паттерны

1. **Singleton** — один экземпляр
2. **Factory Method** — создание через фабрику
3. **Builder** — пошаговое построение

## Структурные паттерны

| Паттерн | Описание |
|---------|----------|
| Adapter | Совмещение несовместимых интерфейсов |
| Decorator | Динамическое добавление поведения |
| Facade | Упрощённый интерфейс к подсистеме |

## Пример Singleton

\`\`\`typescript
class Database {
  private static instance: Database;
  
  private constructor() {}
  
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
\`\`\`

> Паттерны — это не готовые решения, а **шаблоны** для мышления.
`,
];

function App() {
  return (
    <div className="main">
      <Header />
      <div className="article-wrapper">
        {articles.map((md, i) => (
          <ClientArticleRenderer key={i} rawMarkdown={md} />
        ))}
      </div>
    </div>
  )
}

export default App
