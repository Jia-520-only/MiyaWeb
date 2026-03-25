// 文章加载工具
import { ArticleStorage, type ArticleData } from './articleStorage';

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  readTime: number;
  tags: string[];
  author: string;
  featured: boolean;
  published: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ArticleIndex {
  categories: Category[];
  articles: Article[];
}

// 加载文章索引（合并静态文件和存储的文章）
export async function loadArticleIndex(): Promise<ArticleIndex> {
  try {
    // 加载静态文章索引
    const response = await fetch('/src/content/articles/index.json');
    const staticData: ArticleIndex = await response.json();

    // 加载存储的文章
    const savedArticles = ArticleStorage.getAllArticles();

    // 合并文章（优先显示保存的文章）
    const mergedArticles: Article[] = [
      ...savedArticles.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        summary: a.summary,
        date: a.date,
        readTime: a.readTime,
        tags: a.tags,
        author: a.author,
        featured: a.featured,
        published: a.published
      })),
      ...staticData.articles
    ];

    return {
      categories: staticData.categories,
      articles: mergedArticles
    };
  } catch (error) {
    console.error('加载文章索引失败:', error);

    // 即使加载失败，也返回存储的文章
    const savedArticles = ArticleStorage.getAllArticles();
    return {
      categories: [],
      articles: savedArticles.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        summary: a.summary,
        date: a.date,
        readTime: a.readTime,
        tags: a.tags,
        author: a.author,
        featured: a.featured,
        published: a.published
      }))
    };
  }
}

// 加载单篇文章（先从存储中查找，再从文件加载）
export async function loadArticle(id: string): Promise<string> {
  // 先尝试从 localStorage 加载
  const savedArticle = ArticleStorage.getArticle(id);
  if (savedArticle) {
    return savedArticle.content;
  }

  // 再尝试从文件加载
  try {
    const response = await fetch(`/src/content/articles/${id}.md`);
    return await response.text();
  } catch (error) {
    console.error('加载文章失败:', error);
    return '# 文章未找到\n\n抱歉，该文章不存在或已被删除。';
  }
}

// 根据分类筛选文章
export function filterArticlesByCategory(
  articles: Article[],
  categoryId: string
): Article[] {
  if (categoryId === 'all') return articles;
  return articles.filter((article) => article.category === categoryId);
}

// 搜索文章
export function searchArticles(
  articles: Article[],
  query: string
): Article[] {
  if (!query) return articles;
  const lowerQuery = query.toLowerCase();
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.summary.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// 获取特色文章
export function getFeaturedArticles(articles: Article[]): Article[] {
  return articles.filter((article) => article.featured && article.published);
}

// 按日期排序文章
export function sortArticlesByDate(
  articles: Article[],
  order: 'desc' | 'asc' = 'desc'
): Article[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

// 生成文章 URL
export function getArticleUrl(article: Article): string {
  return `/articles/${article.id}`;
}
