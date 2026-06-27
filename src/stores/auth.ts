import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/utils/apiClient';
import { storage } from '@/utils/apiClient';

// 后端角色: admin(3) > editor(2) > user(1)
export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id?: number;
  username: string;
  role: UserRole;
  displayName?: string;
  avatar?: string;
  email?: string;
  loginTime: string;
}

// 角色等级（与后端 hasPermission 一致）
const ROLE_LEVEL: Record<string, number> = { admin: 3, editor: 2, user: 1 };

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  // 权限判断（与后端 roleHierarchy 一致）
  const hasRole = (minRole: UserRole) => {
    const userLevel = ROLE_LEVEL[user.value?.role || ''] || 0;
    const requiredLevel = ROLE_LEVEL[minRole] || 0;
    return userLevel >= requiredLevel;
  };

  const isSuperAdmin = computed(() => hasRole('admin'));
  const isAdmin = computed(() => hasRole('admin'));
  const isUser = computed(() => !!user.value);
  const canEdit = computed(() => hasRole('editor'));
  const canComment = computed(() => isAuthenticated.value);
  const canUseCompanions = computed(() => isAuthenticated.value);

  const roleName = computed(() => {
    if (!user.value) return '访客';
    switch (user.value.role) {
      case 'admin': return '管理员';
      case 'editor': return '编辑者';
      case 'user': return '用户';
      default: return '访客';
    }
  });

  const loadUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      const token = storage.getToken();
      if (stored && token) {
        user.value = JSON.parse(stored);
      }
    } catch {
      // 忽略
    }
  };

  const saveUserToStorage = () => {
    try {
      if (user.value) {
        localStorage.setItem('auth_user', JSON.stringify(user.value));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch {
      // 忽略
    }
  };

  const buildUser = (data: any): User => ({
    id: data.id,
    username: data.username,
    role: data.role || 'user',
    displayName: data.displayName,
    avatar: data.avatar,
    email: data.email,
    loginTime: new Date().toISOString()
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authAPI.login({ username, password });
      storage.setToken(response.token);
      user.value = buildUser(response.user);
      saveUserToStorage();

      const message = hasRole('editor')
        ? '欢迎回来！您拥有编辑权限。'
        : '欢迎回来！您可以浏览内容和发表评论。';

      return { success: true, message };
    } catch (error: any) {
      const msg = error?.error || error?.message || '登录失败，请检查用户名和密码';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    user.value = null;
    storage.clearAuth();
    saveUserToStorage();
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = storage.getToken();
    if (!token) return false;

    try {
      const response = await authAPI.getMe();
      user.value = buildUser(response.user);
      saveUserToStorage();
      return true;
    } catch {
      logout();
      return false;
    }
  };

  loadUserFromStorage();

  return {
    user,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isUser,
    canEdit,
    canComment,
    canUseCompanions,
    roleName,
    hasRole,
    login,
    logout,
    checkAuth
  };
});
