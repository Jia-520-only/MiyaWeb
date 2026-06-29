// 文章存储工具（用于开发和演示）
import type { Article } from './articleLoader';

export interface ArticleData extends Article {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class ArticleStorage {
  private static readonly STORAGE_KEY = 'saved_articles';

  // 获取所有文章
  static getAllArticles(): ArticleData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取文章失败:', error);
      return [];
    }
  }

  // 保存文章
  static saveArticle(data: ArticleData): boolean {
    try {
      const articles = this.getAllArticles();
      const now = new Date().toISOString();

      if (data.id) {
        // 更新现有文章
        const index = articles.findIndex((a) => a.id === data.id);
        if (index >= 0) {
          articles[index] = {
            ...data,
            updatedAt: now
          };
        } else {
          articles.push(data);
        }
      } else {
        // 新文章
        const id = data.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '') + `-${Date.now()}`;
        articles.push({
          ...data,
          id,
          createdAt: now,
          updatedAt: now
        });
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
      return true;
    } catch (error) {
      console.error('保存文章失败:', error);
      return false;
    }
  }

  // 获取单篇文章
  static getArticle(id: string): ArticleData | null {
    const articles = this.getAllArticles();
    return articles.find((a) => a.id === id) || null;
  }

  // 删除文章
  static deleteArticle(id: string): boolean {
    try {
      const articles = this.getAllArticles().filter((a) => a.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
      return true;
    } catch (error) {
      console.error('删除文章失败:', error);
      return false;
    }
  }

  // 导出文章为 JSON
  static exportArticles(): string {
    const articles = this.getAllArticles();
    return JSON.stringify(articles, null, 2);
  }

  // 导入文章
  static importArticles(json: string): boolean {
    try {
      const articles = JSON.parse(json);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
      return true;
    } catch (error) {
      console.error('导入文章失败:', error);
      return false;
    }
  }
}
