/**
 * 后端API客户端
 * 用于与jiaandmiya.com后端服务器通信
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 请求拦截器
const requestInterceptor = async (url: string, options: RequestInit) => {
  // 添加认证令牌
  const token = localStorage.getItem('auth_token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // 添加内容类型
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
  }
  
  return { url, options };
};

// 响应拦截器
const responseInterceptor = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: '服务器错误',
      message: response.statusText
    }));
    
    throw {
      status: response.status,
      ...error
    };
  }
  
  return response.json();
};

// 基础请求函数
const request = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 应用请求拦截器
  const { url: finalUrl, options: finalOptions } = await requestInterceptor(url, options);
  
  try {
    const response = await fetch(finalUrl, finalOptions);
    return await responseInterceptor(response);
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 用户认证API
export const authAPI = {
  // 用户注册
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
  }) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 用户登录
  login: (data: { username: string; password: string }) => 
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // 获取当前用户信息
  getMe: () => request<{ user: any }>('/auth/me'),
  
  // 修改密码
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 更新用户资料
  updateProfile: (data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
  }) => request<{ user: any; message: string }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 退出登录
  logout: () => request('/auth/logout', { method: 'POST' })
};

// 内容管理API
export const contentAPI = {
  // 获取所有内容项
  getAllContents: (params?: {
    page?: string;
    section?: string;
    type?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ items: any[]; total: number }>(`/content${query ? `?${query}` : ''}`);
  },
  
  // 获取指定页面的内容
  getPageContents: (page: string, section?: string) => 
    request<{ page: string; sections: Record<string, any[]> }>(`/content/page/${page}${section ? `?section=${section}` : ''}`),
  
  // 获取单个内容项
  getContent: (id: string) => request(`/content/${id}`),
  
  // 创建内容项
  createContent: (data: any) => request('/content', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 更新内容项
  updateContent: (id: string, data: any) => request(`/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 删除内容项
  deleteContent: (id: string) => request(`/content/${id}`, {
    method: 'DELETE'
  }),
  
  // 批量更新排序
  reorderContents: (items: Array<{ id: string; sort_order: number }>) => 
    request('/content/reorder', {
      method: 'POST',
      body: JSON.stringify({ items })
    }),
  
  // 获取页面列表
  getPagesList: () => request<{ pages: string[] }>('/content/pages/list')
};

// 文章管理API
export const articleAPI = {
  // 获取文章列表
  getArticles: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    author?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{
      articles: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/articles${query ? `?${query}` : ''}`);
  },
  
  // 获取单个文章
  getArticle: (slug: string) => request(`/articles/${slug}`),
  
  // 创建文章
  createArticle: (data: {
    title: string;
    content: string;
    slug?: string;
    category_id?: number;
    summary?: string;
    cover_image?: string;
    tags?: string[];
    is_published?: boolean;
    is_featured?: boolean;
  }) => request<{ article: any; message: string }>('/articles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 更新文章
  updateArticle: (id: number, data: any) => request(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 删除文章
  deleteArticle: (id: number) => request(`/articles/${id}`, {
    method: 'DELETE'
  }),
  
  // 获取所有分类
  getCategories: () => request<{ categories: any[] }>('/articles/categories/all'),
  
  // 获取热门文章
  getPopularArticles: (limit?: number) => 
    request<{ articles: any[] }>(`/articles/popular/trending${limit ? `?limit=${limit}` : ''}`),
  
  // 搜索建议
  getSearchSuggestions: (query: string) => 
    request<{ suggestions: any[] }>(`/articles/search/suggestions?q=${encodeURIComponent(query)}`)
};

// 文件上传API
export const uploadAPI = {
  // 上传单个文件
  uploadFile: (file: File, metadata?: {
    altText?: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata?.altText) {
      formData.append('altText', metadata.altText);
    }
    if (metadata?.description) {
      formData.append('description', metadata.description);
    }
    if (metadata?.isPublic !== undefined) {
      formData.append('isPublic', metadata.isPublic.toString());
    }
    
    return request<{ file: any; message: string }>('/upload/single', {
      method: 'POST',
      body: formData
    });
  },
  
  // 上传多个文件
  uploadMultipleFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return request<{ files: any[]; message: string }>('/upload/multiple', {
      method: 'POST',
      body: formData
    });
  },
  
  // 获取文件列表
  getFiles: (params?: {
    page?: number;
    limit?: number;
    mimeType?: string;
    search?: string;
    userOnly?: boolean;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{
      files: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/upload${query ? `?${query}` : ''}`);
  },
  
  // 获取单个文件信息
  getFile: (id: number) => request(`/upload/${id}`),
  
  // 更新文件信息
  updateFile: (id: number, data: {
    altText?: string;
    description?: string;
    isPublic?: boolean;
  }) => request(`/upload/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 删除文件
  deleteFile: (id: number) => request(`/upload/${id}`, {
    method: 'DELETE'
  }),
  
  // 获取图片库
  getImageGallery: (params?: { limit?: number; category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ images: any[] }>(`/upload/gallery/images${query ? `?${query}` : ''}`);
  }
};

// 用户管理API（管理员权限）
export const userAPI = {
  // 获取用户列表
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{
      users: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/users${query ? `?${query}` : ''}`);
  },
  
  // 获取单个用户
  getUser: (id: number) => request(`/users/${id}`),
  
  // 创建用户（管理员）
  createUser: (data: any) => request('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 更新用户（管理员）
  updateUser: (id: number, data: any) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 删除用户（管理员）
  deleteUser: (id: number) => request(`/users/${id}`, {
    method: 'DELETE'
  })
};

// CMS 集合管理 API（图书组 / 伴侣组）
export const collectionAPI = {
  getAll: (params?: { type?: string; visible?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ collections: any[] }>(`/collections${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => request<{ collection: any; items: any[] }>(`/collections/${id}`),
  getItems: (id: number, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ items: any[]; pagination: any }>(`/collections/${id}/items${query ? `?${query}` : ''}`);
  },
  create: (data: { name: string; slug: string; type: 'book_group' | 'companion_group'; description?: string; cover_image?: string; icon?: string; sort_order?: number }) =>
    request<{ collection: any; message: string }>('/collections', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<{ collection: any; message: string }>(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/collections/${id}`, { method: 'DELETE' })
};

// CMS 内容项 API（图书 / 伴侣卡片 / 卷 / 章节 / 文章）
export const itemAPI = {
  getById: (id: number) => request<{ item: any; volumes: any[]; orphanChapters: any[] }>(`/items/${id}`),
  getTOC: (id: number) => request<any>(`/items/${id}/toc`),
  // 项
  create: (data: { collection_id: number; title: string; slug: string; type: 'book' | 'companion'; description?: string; cover_image?: string; tags?: string[]; sort_order?: number; content?: string; content_type?: string }) =>
    request<{ item: any; message: string }>('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<{ item: any; message: string }>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/items/${id}`, { method: 'DELETE' }),
  // 卷
  createVolume: (itemId: number, data: { title: string; description?: string; sort_order?: number }) =>
    request<{ volume: any; message: string }>(`/items/${itemId}/volumes`, { method: 'POST', body: JSON.stringify(data) }),
  updateVolume: (itemId: number, volumeId: number, data: any) =>
    request<{ volume: any; message: string }>(`/items/${itemId}/volumes/${volumeId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolume: (itemId: number, volumeId: number) =>
    request(`/items/${itemId}/volumes/${volumeId}`, { method: 'DELETE' }),
  // 章节
  createChapter: (itemId: number, data: { title: string; description?: string; volume_id?: number; sort_order?: number }) =>
    request<{ chapter: any; message: string }>(`/items/${itemId}/chapters`, { method: 'POST', body: JSON.stringify(data) }),
  updateChapter: (itemId: number, chapterId: number, data: any) =>
    request<{ chapter: any; message: string }>(`/items/${itemId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChapter: (itemId: number, chapterId: number) =>
    request(`/items/${itemId}/chapters/${chapterId}`, { method: 'DELETE' }),
  // 文章
  getArticle: (itemId: number, articleId: number) => request<{ article: any }>(`/items/${itemId}/articles/${articleId}`),
  createArticle: (itemId: number, data: { title: string; content: string; content_type?: 'markdown' | 'txt'; chapter_id?: number; summary?: string; cover_image?: string; is_downloadable?: boolean; sort_order?: number }) =>
    request<{ article: any; message: string }>(`/items/${itemId}/articles`, { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (itemId: number, articleId: number, data: any) =>
    request<{ article: any; message: string }>(`/items/${itemId}/articles/${articleId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (itemId: number, articleId: number) =>
    request(`/items/${itemId}/articles/${articleId}`, { method: 'DELETE' }),
  // 下载单篇文章
  downloadArticle: (itemId: number, articleId: number) =>
    `${API_BASE_URL}/items/${itemId}/articles/${articleId}/download`,
  // 导出整本书为 ZIP
  exportBook: (itemId: number, format: 'markdown' | 'txt' = 'markdown') =>
    `${API_BASE_URL}/items/${itemId}/export?format=${format}`,
  // 导出整本书为 EPUB
  exportBookEpub: (itemId: number) =>
    `${API_BASE_URL}/items/${itemId}/export/epub`,
  // 导出整本书为 PDF（HTML 打印版）
  exportBookPdf: (itemId: number) =>
    `${API_BASE_URL}/items/${itemId}/export/pdf`,
  // 导入 EPUB
  importEpub: (itemId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ message: string; imported: { chapters: number; articles: number } }>(`/items/${itemId}/import/epub`, {
      method: 'POST',
      body: formData
    })
  },
};

// 导航配置 API
export const navigationAPI = {
  getPublic: () => request<{ navigation: any[] }>('/navigation'),
  getAll: () => request<{ navigation: any[]; flat: any[] }>('/navigation/all'),
  create: (data: { title: string; icon?: string; link?: string; link_type?: 'internal' | 'external'; parent_id?: number; is_visible?: boolean; open_in_new_tab?: boolean; sort_order?: number }) =>
    request<{ navItem: any; message: string }>('/navigation', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<{ navItem: any; message: string }>(`/navigation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/navigation/${id}`, { method: 'DELETE' }),
  batchSort: (items: Array<{ id: number; sort_order: number; parent_id?: number }>) =>
    request('/navigation/batch/sort', { method: 'PUT', body: JSON.stringify({ items }) })
};

// 免费资源链接 API
export const resourceAPI = {
  getAll: (params?: { category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ resources: any[] }>(`/resources${query ? `?${query}` : ''}`);
  },
  getCategories: () => request<{ categories: string[] }>('/resources/categories'),
  create: (data: { title: string; url: string; description?: string; icon?: string; category?: string; cover_image?: string; sort_order?: number }) =>
    request<{ resource: any; message: string }>('/resources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<{ resource: any; message: string }>(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/resources/${id}`, { method: 'DELETE' })
};

// 用户资料 API
export const profileAPI = {
  getMyProfile: () => request<{ profile: any }>('/profiles/me/profile'),
  updateMyProfile: (data: { display_name?: string; bio?: string; bio_type?: 'markdown' | 'txt'; avatar?: string; cover_image?: string; background_image?: string; social_links?: any; custom_data?: any }) =>
    request<{ profile: any; message: string }>('/profiles/me/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getByUserId: (userId: number) => request<{ profile: any }>(`/profiles/${userId}`),
  updateByAdmin: (userId: number, data: any) =>
    request<{ profile: any; message: string }>(`/profiles/${userId}/profile`, { method: 'PUT', body: JSON.stringify(data) })
};

// 系统健康检查
export const systemAPI = {
  // 检查服务器健康状态
  healthCheck: () => request<{
    status: string;
    timestamp: string;
    version: string;
  }>('/health'),
  
  // 获取系统统计
  getStatistics: () => request<{
    users: number;
    articles: number;
    categories: number;
    uploads: number;
    comments: number;
  }>('/stats')
};

// 统一的错误处理
export class APIError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// 本地存储辅助函数
export const storage = {
  // 保存认证令牌
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  // 获取认证令牌
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
  
  // 清除认证令牌
  clearToken: () => {
    localStorage.removeItem('auth_token');
  },
  
  // 保存用户信息
  setUser: (user: any) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
  
  // 获取用户信息
  getUser: () => {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // 清除用户信息
  clearUser: () => {
    localStorage.removeItem('auth_user');
  },
  
  // 清除所有认证信息
  clearAuth: () => {
    storage.clearToken();
    storage.clearUser();
  }
};

// 初始化请求拦截器（设置默认认证令牌）
const initAuth = () => {
  const token = storage.getToken();
  if (token) {
    // 自动设置请求头
    // 已经在requestInterceptor中处理
  }
};

// 初始化
initAuth();

export default {
  auth: authAPI,
  content: contentAPI,
  article: articleAPI,
  upload: uploadAPI,
  user: userAPI,
  system: systemAPI,
  collection: collectionAPI,
  item: itemAPI,
  navigation: navigationAPI,
  resource: resourceAPI,
  profile: profileAPI,
  storage,
  APIError
};