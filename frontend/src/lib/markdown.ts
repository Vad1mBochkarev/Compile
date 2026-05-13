import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Преобразует сырую Markdown строку в готовый HTML.
 * @param rawMarkdown - Строка с содержимым .md файла
 * @returns Строка с готовой HTML разметкой
 */
export async function parseMarkdownToHtml(rawMarkdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse) // 1. Читает Markdown
    .use(remarkGfm)   // 2. Добавляет поддержку таблиц и чекбоксов
    .use(remarkRehype) // 3. Переводит AST Markdown в AST HTML
    .use(rehypeStringify) // 4. Превращает AST в обычную HTML-строку
    .process(rawMarkdown);

  return String(result);
}