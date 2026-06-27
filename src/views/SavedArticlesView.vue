<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">已保存的文章</h1>
          <div class="flex gap-2">
            <button
              @click="exportArticles"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg text-sm"
            >
              📥 导出
            </button>
            <button
              @click="showImport = true"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg text-sm"
            >
              📤 导入
            </button>
          </div>
        </div>

        <!-- 文章列表 -->
        <div v-if="savedArticles.length > 0" class="space-y-4">
          <div
            v-for="article in savedArticles"
            :key="article.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {{ article.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {{ article.summary || '暂无摘要' }}
                </p>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>📅 {{ formatDate(article.updatedAt) }}</span>
                  <span>⏱️ {{ article.readTime }} 分钟</span>
                  <span v-if="article.published" class="text-green-600">已发布</span>
                  <span v-else class="text-gray-500">草稿</span>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <router-link
                  :to="`/editor/${article.id}`"
                  class="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm"
                >
                  编辑
                </router-link>
                <button
                  @click="confirmDelete(article.id)"
                  class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 dark:text-gray-400 mb-4">还没有保存任何文章</p>
          <router-link
            to="/editor"
            class="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
          >
            创建新文章
          </router-link>
        </div>
      </div>
    </div>

    <!-- 导入弹窗 -->
    <div v-if="showImport" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">导入文章</h3>
        <textarea
          v-model="importJson"
          rows="10"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
          placeholder="粘贴导出的 JSON 数据..."
        />
        <div class="flex gap-2 mt-4">
          <button
            @click="handleImport"
            class="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
          >
            确认导入
          </button>
          <button
            @click="showImport = false; importJson = ''"
            class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-lg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ArticleStorage } from '@/utils/articleStorage';

const savedArticles = ref<any[]>([]);
const showImport = ref(false);
const importJson = ref('');

// 加载已保存的文章
onMounted(() => {
  savedArticles.value = ArticleStorage.getAllArticles();
});

// 格式化日期
const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 导出文章
const exportArticles = () => {
  const json = ArticleStorage.exportArticles();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `articles-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 导入文章
const handleImport = () => {
  try {
    const success = ArticleStorage.importArticles(importJson.value);
    if (success) {
      alert('导入成功！');
      savedArticles.value = ArticleStorage.getAllArticles();
      showImport.value = false;
      importJson.value = '';
    } else {
      alert('导入失败，请检查 JSON 格式');
    }
  } catch (error) {
    alert('导入失败：JSON 格式错误');
  }
};

// 确认删除
const confirmDelete = (id: string) => {
  if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
    ArticleStorage.deleteArticle(id);
    savedArticles.value = ArticleStorage.getAllArticles();
  }
};
</script>
