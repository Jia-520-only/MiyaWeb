<template>
  <div class="flex flex-col h-[calc(100vh-5rem)]">
    <!-- Header Bar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-glass-border dark:border-glass-borderDark flex-shrink-0">
      <div class="flex items-center gap-3">
        <router-link to="/" class="btn-ghost !px-2">
          <Icon name="solar:arrow-left-bold" size="sm" />
        </router-link>
        <h1 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">内容管理</h1>
      </div>
      <div class="flex gap-1 p-0.5 glass-card !p-0.5">
        <button v-for="tab in tabs" :key="tab.id" @click="switchTab(tab.id)" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === tab.id ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
          <Icon :name="tab.icon" size="xs" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden">
      <!-- Tree Editor Mode -->
      <div v-if="['library', 'companions'].includes(activeTab)" class="flex h-full">
        <!-- Sidebar Tree -->
        <div class="w-64 border-r border-glass-border dark:border-glass-borderDark overflow-y-auto flex-shrink-0 bg-white/30 dark:bg-gray-900/30">
          <!-- Collection List -->
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ activeTab === 'library' ? '图书组' : '伴侣组' }}</span>
              <button @click="showCreateCollection = true" class="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="新建">
                <Icon name="solar:add-circle-linear" size="sm" />
              </button>
            </div>
            <div v-if="collectionsLoading" class="flex justify-center py-8">
              <div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else class="space-y-0.5">
              <div v-for="col in collections" :key="col.id"
                @click="selectCollection(col)"
                :class="['flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors group', selectedCollection?.id === col.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
                <Icon :name="activeTab === 'library' ? 'solar:notebook-bold-duotone' : 'solar:star-shine-bold-duotone'" size="sm" />
                <span class="flex-1 truncate">{{ col.name }}</span>
                <span class="text-xs text-gray-400">{{ col.item_count || 0 }}</span>
                <div class="hidden group-hover:flex items-center gap-0.5">
                  <button @click.stop="editCollection(col)" class="p-0.5 text-gray-400 hover:text-primary-500"><Icon name="solar:pen-linear" size="xs" /></button>
                  <button @click.stop="deleteCollection(col.id)" class="p-0.5 text-gray-400 hover:text-red-500"><Icon name="solar:trash-bin-trash-linear" size="xs" /></button>
                </div>
              </div>
              <div v-if="collections.length === 0" class="text-center py-6 text-xs text-gray-400">暂无数据</div>
            </div>
          </div>

          <!-- Items under Collection -->
          <div v-if="selectedCollection" class="border-t border-glass-border dark:border-glass-borderDark p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">内容项</span>
              <button @click="showCreateItem = true" class="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="新建">
                <Icon name="solar:add-circle-linear" size="sm" />
              </button>
            </div>
            <div v-if="itemsLoading" class="flex justify-center py-4">
              <div class="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else class="space-y-0.5">
              <div v-for="item in items" :key="item.id"
                @click="selectItem(item)"
                :class="['flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors group', selectedItem?.id === item.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
                <Icon name="solar:document-text-bold-duotone" size="sm" />
                <span class="flex-1 truncate">{{ item.title }}</span>
                <div class="hidden group-hover:flex items-center gap-0.5">
                  <button @click.stop="editItem(item)" class="p-0.5 text-gray-400 hover:text-primary-500"><Icon name="solar:pen-linear" size="xs" /></button>
                  <button @click.stop="deleteItem(item.id)" class="p-0.5 text-gray-400 hover:text-red-500"><Icon name="solar:trash-bin-trash-linear" size="xs" /></button>
                </div>
              </div>
              <div v-if="items.length === 0" class="text-center py-4 text-xs text-gray-400">暂无内容</div>
            </div>
          </div>

          <!-- TOC under Item -->
          <div v-if="selectedItem && toc" class="border-t border-glass-border dark:border-glass-borderDark p-3">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">目录结构</span>
            <!-- Volumes -->
            <div v-for="vol in toc.volumes" :key="'v'+vol.id" class="mb-1">
              <div @click="selectNode('volume', vol)"
                :class="['flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors', selectedNode?.type === 'volume' && selectedNode?.data.id === vol.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
                <Icon name="solar:folder-bold-duotone" size="xs" />
                <span class="flex-1 truncate">{{ vol.title }}</span>
                <button @click.stop="addChapter(vol.id)" class="p-0.5 opacity-0 group-hover:opacity-100 hover:text-primary-500"><Icon name="solar:add-circle-linear" size="xs" /></button>
              </div>
              <div v-for="ch in vol.chapters" :key="'vc'+ch.id" class="ml-4">
                <div @click="selectNode('chapter', ch)"
                  :class="['flex items-center gap-1.5 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors', selectedNode?.type === 'chapter' && selectedNode?.data.id === ch.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50']">
                  <Icon name="solar:file-text-bold-duotone" size="xs" />
                  <span class="truncate">{{ ch.title }}</span>
                </div>
              </div>
            </div>
            <!-- Orphan Chapters -->
            <div v-for="ch in toc.orphanChapters" :key="'oc'+ch.id"
              @click="selectNode('chapter', ch)"
              :class="['flex items-center gap-1.5 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors', selectedNode?.type === 'chapter' && selectedNode?.data.id === ch.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50']">
              <Icon name="solar:file-text-bold-duotone" size="xs" />
              <span class="truncate">{{ ch.title }}</span>
            </div>
            <!-- Direct Articles -->
            <div v-for="art in toc.directArticles" :key="'da'+art.id"
              @click="selectNode('article', art)"
              :class="['flex items-center gap-1.5 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors', selectedNode?.type === 'article' && selectedNode?.data.id === art.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50']">
              <Icon name="solar:document-bold" size="xs" />
              <span class="truncate">{{ art.title }}</span>
            </div>
            <!-- Add buttons -->
            <div class="flex gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button @click="createVolume" class="flex-1 text-xs text-gray-400 hover:text-primary-500 py-1 rounded hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                + 卷
              </button>
              <button @click="addChapter()" class="flex-1 text-xs text-gray-400 hover:text-primary-500 py-1 rounded hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                + 章节
              </button>
              <button @click="createArticle" class="flex-1 text-xs text-gray-400 hover:text-primary-500 py-1 rounded hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                + 文章
              </button>
            </div>
          </div>
        </div>

        <!-- Right Editor Panel -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- No Selection -->
          <div v-if="!selectedItem && !selectedNode" class="flex flex-col items-center justify-center h-full text-gray-400">
            <Icon name="solar:pen-new-round-bold-duotone" size="xl" color="#c0c8d8" class="mb-4" />
            <p class="text-sm">选择左侧树形节点开始编辑</p>
          </div>

          <!-- Export Book Button (when item selected but nothing being edited) -->
          <div v-else-if="selectedItem && !editingItem && !editingArticle && !editingSimpleNode && !selectedNode" class="flex flex-col items-center justify-center h-full">
            <Icon name="solar:notebook-bold-duotone" size="xl" color="#c0c8d8" class="mb-4" />
            <p class="text-sm text-gray-400 mb-4">{{ selectedItem.title }}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <button @click="exportBook('markdown')" class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-xl transition-colors">
                <Icon name="solar:download-minimalistic-bold" size="sm" />
                Markdown
              </button>
              <button @click="exportBook('txt')" class="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-xl transition-colors">
                <Icon name="solar:download-minimalistic-bold" size="sm" />
                TXT
              </button>
              <button @click="exportEpub" class="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-xl transition-colors">
                <Icon name="solar:book-bold" size="sm" />
                EPUB
              </button>
              <button @click="exportPdf" class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-xl transition-colors">
                <Icon name="solar:printer-bold" size="sm" />
                PDF
              </button>
              <button @click="triggerEpubImport" class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 text-gray-500 hover:text-primary-600 text-sm rounded-xl transition-colors">
                <Icon name="solar:upload-minimalistic-bold" size="sm" />
                导入 EPUB
              </button>
            </div>
            <input ref="epubImportInput" type="file" accept=".epub" class="hidden" @change="handleEpubImport" />
          </div>

          <!-- Item Editor -->
          <div v-else-if="editingItem" class="max-w-4xl mx-auto">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">编辑内容项</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">标题</label>
                  <input v-model="itemForm.title" class="input-field" placeholder="标题" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
                  <input v-model="itemForm.slug" class="input-field" placeholder="url-slug" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">描述</label>
                <textarea v-model="itemForm.description" class="input-field !h-20 resize-none" placeholder="简短描述" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">封面图片 URL</label>
                <input v-model="itemForm.cover_image" class="input-field" placeholder="https://..." />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">标签（逗号分隔）</label>
                <input v-model="itemForm.tags" class="input-field" placeholder="标签1, 标签2" />
              </div>
              <TextEditor v-model="itemForm.content" :default-format="(itemForm.content_type as any)" label="正文内容" @format-change="itemForm.content_type = $event" />
              <div class="flex gap-3">
                <button @click="saveItem" class="btn-primary" :disabled="saving">保存</button>
                <button @click="editingItem = false" class="btn-secondary">取消</button>
              </div>
            </div>
          </div>

          <!-- Article Editor -->
          <div v-else-if="editingArticle" class="max-w-4xl mx-auto">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ editingArticle.isNew ? '新建文章' : '编辑文章' }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">标题</label>
                <input v-model="articleForm.title" class="input-field" placeholder="文章标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">摘要</label>
                <input v-model="articleForm.summary" class="input-field" placeholder="简短摘要（可选）" />
              </div>
              <TextEditor v-model="articleForm.content" :default-format="articleForm.content_type || 'markdown'" label="正文内容" @format-change="articleForm.content_type = $event" />
              <div class="flex gap-3">
                <button @click="saveArticle" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
                <button @click="editingArticle = null" class="btn-secondary">取消</button>
              </div>
            </div>
          </div>

          <!-- Volume/Chapter Name Editor -->
          <div v-else-if="editingSimpleNode" class="max-w-lg mx-auto">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ editingSimpleNode.isNew ? '新建' : '编辑' }}{{ editingSimpleNode.type === 'volume' ? '卷' : '章节' }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">标题</label>
                <input v-model="simpleNodeForm.title" class="input-field" placeholder="标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">描述</label>
                <textarea v-model="simpleNodeForm.description" class="input-field !h-16 resize-none" placeholder="描述（可选）" />
              </div>
              <div class="flex gap-3">
                <button @click="saveSimpleNode" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
                <button @click="editingSimpleNode = null" class="btn-secondary">取消</button>
              </div>
            </div>
          </div>

          <!-- Node Selected but not editing -->
          <div v-else-if="selectedNode" class="max-w-2xl mx-auto">
            <div class="glass-card p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedNode.data.title }}</h2>
                <div class="flex gap-2">
                  <button @click="editSelectedNode" class="btn-ghost text-xs">编辑</button>
                  <button @click="deleteSelectedNode" class="btn-ghost text-xs text-red-500">删除</button>
                </div>
              </div>
              <p v-if="selectedNode.data.description" class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ selectedNode.data.description }}</p>
              <!-- If chapter, show articles -->
              <div v-if="selectedNode.type === 'chapter' && selectedNode.data.articles?.length">
                <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">文章</h3>
                <div v-for="art in selectedNode.data.articles" :key="art.id" @click="openArticle(art)" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors text-sm">
                  <Icon name="solar:document-bold" size="sm" />
                  <span class="flex-1 text-gray-700 dark:text-gray-300">{{ art.title }}</span>
                  <span class="badge text-xs">{{ art.content_type || 'markdown' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pages Editor Mode -->
      <div v-else-if="activeTab === 'pages'" class="flex h-full">
        <!-- Sidebar: Page/Section Tree -->
        <div class="w-64 border-r border-glass-border dark:border-glass-borderDark overflow-y-auto flex-shrink-0 bg-white/30 dark:bg-gray-900/30">
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">页面内容</span>
              <button @click="createContentItem" class="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="新建">
                <Icon name="solar:add-circle-linear" size="sm" />
              </button>
            </div>
            <div v-if="contentPagesLoading" class="flex justify-center py-8">
              <div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else class="space-y-1">
              <div v-for="page in contentPages" :key="page.page" class="mb-2">
                <div @click="toggleContentPage(page.page)"
                  :class="['flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors font-medium', expandedContentPage === page.page ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
                  <Icon :name="page.icon || 'solar:page-bold-duotone'" size="sm" />
                  <span class="flex-1 truncate">{{ page.label }}</span>
                  <Icon name="solar:alt-arrow-down-linear" size="xs" :class="['transition-transform', expandedContentPage === page.page ? 'rotate-180' : '']" />
                </div>
                <div v-if="expandedContentPage === page.page" class="ml-3 mt-0.5 space-y-0.5">
                  <div v-for="ci in getContentItemsForPage(page.page)" :key="ci.id"
                    @click="selectContentItem(ci)"
                    :class="['flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors group', selectedContentItem?.id === ci.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
                    <Icon name="solar:document-bold" size="xs" />
                    <span class="flex-1 truncate">{{ ci.title }}</span>
                    <span class="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400">{{ ci.section }}</span>
                    <div class="hidden group-hover:flex items-center gap-0.5">
                      <button @click.stop="deleteContentItem(ci.id)" class="p-0.5 text-gray-400 hover:text-red-500"><Icon name="solar:trash-bin-trash-linear" size="xs" /></button>
                    </div>
                  </div>
                  <div v-if="getContentItemsForPage(page.page).length === 0" class="text-[11px] text-gray-400 px-2 py-1">暂无内容</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Editor Panel -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- No Selection -->
          <div v-if="!selectedContentItem && !editingContentItem" class="flex flex-col items-center justify-center h-full text-gray-400">
            <Icon name="solar:pen-new-round-bold-duotone" size="xl" color="#c0c8d8" class="mb-4" />
            <p class="text-sm">选择左侧页面区块开始编辑</p>
          </div>

          <!-- Content Item Editor -->
          <div v-else class="max-w-4xl mx-auto">
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">标题</label>
                  <input v-model="contentItemForm.title" class="input-field" placeholder="内容标题" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">页面</label>
                  <select v-model="contentItemForm.page" class="input-field">
                    <option v-for="p in contentPages" :key="p.page" :value="p.page">{{ p.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">区块</label>
                  <input v-model="contentItemForm.section" class="input-field" placeholder="如 profile, miya, website" />
                </div>
              </div>
              <TextEditor v-model="contentItemForm.content" :default-format="(contentItemForm.type as any)" label="正文内容" @format-change="contentItemForm.type = $event" />
              <div class="flex gap-3">
                <button @click="saveContentItem" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
                <button @click="cancelContentEdit" class="btn-secondary">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Tabs: keep old panels -->
      <div v-else class="overflow-y-auto h-full">
        <div class="container mx-auto px-6 py-6 max-w-5xl">
          <NavigationPanel v-if="activeTab === 'navigation'" />
          <ResourcePanel v-if="activeTab === 'resources'" />
          <LegacyPanel v-if="activeTab === 'legacy'" />
        </div>
      </div>
    </div>

    <!-- Collection Modal -->
    <Teleport to="body">
      <div v-if="showCreateCollection || showEditCollectionModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeCollectionModal">
        <div class="glass-panel p-6 max-w-md w-full animate-slide-up">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ showEditCollectionModal ? '编辑' : '新建' }}{{ activeTab === 'library' ? '图书组' : '伴侣组' }}</h2>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">名称</label><input v-model="colForm.name" class="input-field" placeholder="名称" /></div>
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label><input v-model="colForm.slug" class="input-field" placeholder="url-slug" /></div>
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">描述</label><textarea v-model="colForm.description" class="input-field !h-16 resize-none" /></div>
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">封面 URL</label><input v-model="colForm.cover_image" class="input-field" placeholder="https://..." /></div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="closeCollectionModal" class="btn-secondary text-sm">取消</button>
            <button @click="saveCollection" class="btn-primary text-sm" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Item Modal -->
    <Teleport to="body">
      <div v-if="showCreateItem || showEditItemModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeItemModal">
        <div class="glass-panel p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ showEditItemModal ? '编辑' : '新建' }}内容项</h2>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">标题</label><input v-model="itemForm.title" class="input-field" placeholder="标题" /></div>
              <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label><input v-model="itemForm.slug" class="input-field" placeholder="url-slug" /></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">描述</label><textarea v-model="itemForm.description" class="input-field !h-16 resize-none" /></div>
            <div><label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">封面 URL</label><input v-model="itemForm.cover_image" class="input-field" placeholder="https://..." /></div>
            <TextEditor v-model="itemForm.content" :default-format="(itemForm.content_type as any)" label="正文内容" @format-change="itemForm.content_type = $event" />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="closeItemModal" class="btn-secondary text-sm">取消</button>
            <button @click="saveItemFromModal" class="btn-primary text-sm" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collectionAPI, itemAPI, contentAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'
import TextEditor from '@/components/TextEditor.vue'
import NavigationPanel from '@/components/cms/NavigationPanel.vue'
import ResourcePanel from '@/components/cms/ResourcePanel.vue'
import LegacyPanel from '@/components/cms/LegacyPanel.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.section === 'companions' ? 'companions' : 'library')
const tabs = [
  { id: 'library', label: '图书', icon: 'solar:notebook-bold-duotone' },
  { id: 'companions', label: '伴侣', icon: 'solar:star-shine-bold-duotone' },
  { id: 'pages', label: '页面', icon: 'solar:document-text-bold-duotone' },
  { id: 'navigation', label: '导航', icon: 'solar:menu-bold-duotone' },
  { id: 'resources', label: '资源', icon: 'solar:gift-bold-duotone' },
  { id: 'legacy', label: '旧版', icon: 'solar:archive-bold-duotone' },
]

const switchTab = (id: string) => { activeTab.value = id; router.replace({ query: { section: id === 'library' ? undefined : id } }) }

// ─── Collections ───
const collections = ref<any[]>([])
const collectionsLoading = ref(true)
const selectedCollection = ref<any>(null)
const showCreateCollection = ref(false)
const showEditCollectionModal = ref(false)
const editingColId = ref<number | null>(null)
const colForm = ref({ name: '', slug: '', description: '', cover_image: '', sort_order: 0 })

const loadCollections = async () => {
  collectionsLoading.value = true
  try {
    const type = activeTab.value === 'companions' ? 'companion_group' : 'book_group'
    const res = await collectionAPI.getAll(type ? { type } : undefined)
    collections.value = res.collections || []
  } catch { console.error('加载失败') }
  finally { collectionsLoading.value = false }
}

const selectCollection = async (col: any) => {
  selectedCollection.value = col
  selectedItem.value = null
  selectedNode.value = null
  editingItem.value = false
  editingArticle.value = null
  editingSimpleNode.value = null
  await loadItems(col.id)
  if (items.value.length > 0) selectItem(items.value[0])
}

const editCollection = (col: any) => {
  editingColId.value = col.id
  colForm.value = { name: col.name, slug: col.slug, description: col.description || '', cover_image: col.cover_image || '', sort_order: col.sort_order || 0 }
  showEditCollectionModal.value = true
}

const closeCollectionModal = () => { showCreateCollection.value = false; showEditCollectionModal.value = false; editingColId.value = null; colForm.value = { name: '', slug: '', description: '', cover_image: '', sort_order: 0 } }

const genSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')

const saveCollection = async () => {
  if (!colForm.value.name) return
  saving.value = true
  try {
    const type = activeTab.value === 'companions' ? 'companion_group' : 'book_group'
    const data = { ...colForm.value, type, slug: colForm.value.slug || genSlug(colForm.value.name) }
    if (showEditCollectionModal.value && editingColId.value) await collectionAPI.update(editingColId.value, data)
    else await collectionAPI.create(data)
    closeCollectionModal(); await loadCollections()
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const deleteCollection = async (id: number) => {
  if (!confirm('确定删除？关联内容也会被删除。')) return
  try { await collectionAPI.delete(id); if (selectedCollection.value?.id === id) { selectedCollection.value = null; selectedItem.value = null; selectedNode.value = null } await loadCollections() } catch { alert('删除失败') }
}

watch(activeTab, () => { selectedCollection.value = null; selectedItem.value = null; selectedNode.value = null; editingItem.value = false; editingArticle.value = null; editingSimpleNode.value = null; loadCollections() })

// ─── Items ───
const items = ref<any[]>([])
const itemsLoading = ref(false)
const selectedItem = ref<any>(null)
const showCreateItem = ref(false)
const showEditItemModal = ref(false)
const editingItem = ref(false)
const itemForm = ref({ title: '', slug: '', description: '', cover_image: '', tags: '', content: '', content_type: 'markdown' as string })

const loadItems = async (colId: number) => {
  itemsLoading.value = true
  try { const res = await collectionAPI.getItems(colId); items.value = res.items || [] } catch { items.value = [] }
  finally { itemsLoading.value = false }
}

const selectItem = async (item: any) => {
  selectedItem.value = item
  selectedNode.value = null
  editingItem.value = false
  editingArticle.value = null
  editingSimpleNode.value = null
  // Load full item details including content
  try {
    const res = await itemAPI.getById(item.id)
    selectedItem.value = res.item || res
  } catch { /* use list data */ }
  await loadTOC(item.id)
}

const editItem = (item: any) => {
  itemForm.value = { title: item.title, slug: item.slug, description: item.description || '', cover_image: item.cover_image || '', tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''), content: item.content || '', content_type: item.content_type || 'markdown' }
  showEditItemModal.value = true
}

const closeItemModal = () => { showCreateItem.value = false; showEditItemModal.value = false; itemForm.value = { title: '', slug: '', description: '', cover_image: '', tags: '', content: '', content_type: 'markdown' } }

const saveItemFromModal = async () => {
  if (!itemForm.value.title || !selectedCollection.value) return
  saving.value = true
  try {
    const type = activeTab.value === 'companions' ? 'companion' : 'book'
    const data = { ...itemForm.value, type, slug: itemForm.value.slug || genSlug(itemForm.value.title), tags: itemForm.value.tags ? itemForm.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] }
    if (showEditItemModal.value && selectedItem.value) await itemAPI.update(selectedItem.value.id, data)
    else await itemAPI.create({ ...data, collection_id: selectedCollection.value.id })
    closeItemModal(); await loadItems(selectedCollection.value.id)
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const saveItem = async () => {
  if (!selectedItem.value) return
  saving.value = true
  try {
    const type = activeTab.value === 'companions' ? 'companion' : 'book'
    const data = { ...itemForm.value, type, tags: itemForm.value.tags ? itemForm.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] }
    await itemAPI.update(selectedItem.value.id, data)
    editingItem.value = false
    await loadItems(selectedCollection.value!.id)
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const deleteItem = async (id: number) => {
  if (!confirm('确定删除此内容项？')) return
  try { await itemAPI.delete(id); if (selectedItem.value?.id === id) { selectedItem.value = null; selectedNode.value = null; toc.value = null } await loadItems(selectedCollection.value!.id) } catch { alert('删除失败') }
}

// ─── TOC ───
const toc = ref<any>(null)
const selectedNode = ref<{ type: string; data: any } | null>(null)
const saving = ref(false)

const loadTOC = async (itemId: number) => {
  try { toc.value = await itemAPI.getTOC(itemId) } catch { toc.value = null }
}

const selectNode = (type: string, data: any) => {
  selectedNode.value = { type, data }
  editingItem.value = false
  editingArticle.value = null
  editingSimpleNode.value = null
}

const editSelectedNode = () => {
  if (!selectedNode.value) return
  const nodeType = selectedNode.value.type
  const nodeData = selectedNode.value.data

  if (nodeType === 'article') {
    // 打开文章编辑器
    openArticle(nodeData)
  } else if (nodeType === 'volume' || nodeType === 'chapter') {
    selectedNode.value = null
    editingSimpleNode.value = { type: nodeType, isNew: false }
    simpleNodeForm.value = { title: nodeData.title, description: nodeData.description || '' }
  }
}

const deleteSelectedNode = async () => {
  if (!selectedNode.value || !selectedItem.value) return
  const { type, data } = selectedNode.value
  const label = type === 'volume' ? '卷' : type === 'chapter' ? '章节' : '文章'
  if (!confirm(`确定删除此${label}？`)) return
  try {
    if (type === 'volume') await itemAPI.deleteVolume(selectedItem.value.id, data.id)
    else if (type === 'chapter') await itemAPI.deleteChapter(selectedItem.value.id, data.id)
    else if (type === 'article') await itemAPI.deleteArticle(selectedItem.value.id, data.id)
    selectedNode.value = null; await loadTOC(selectedItem.value.id)
  } catch { alert('删除失败') }
}

// ─── Volume / Chapter Create ───
const editingSimpleNode = ref<{ type: string; isNew: boolean } | null>(null)
const simpleNodeForm = ref({ title: '', description: '' })

const addChapter = (volumeId?: number) => {
  selectedNode.value = null
  editingSimpleNode.value = { type: 'chapter', isNew: true }
  simpleNodeForm.value = { title: '', description: '' }
  if (volumeId) (editingSimpleNode.value as any).volumeId = volumeId
}

const createVolume = () => {
  selectedNode.value = null
  editingSimpleNode.value = { type: 'volume', isNew: true }
  simpleNodeForm.value = { title: '', description: '' }
}

const saveSimpleNode = async () => {
  if (!simpleNodeForm.value.title || !selectedItem.value || !editingSimpleNode.value) return
  saving.value = true
  try {
    if (editingSimpleNode.value.type === 'volume') {
      if (editingSimpleNode.value.isNew) await itemAPI.createVolume(selectedItem.value.id, simpleNodeForm.value)
      else await itemAPI.updateVolume(selectedItem.value.id, selectedNode.value!.data.id, simpleNodeForm.value)
    } else {
      const volId = (editingSimpleNode.value as any).volumeId || selectedNode.value?.data.volume_id || null
      if (editingSimpleNode.value.isNew) await itemAPI.createChapter(selectedItem.value.id, { ...simpleNodeForm.value, volume_id: volId })
      else await itemAPI.updateChapter(selectedItem.value.id, selectedNode.value!.data.id, simpleNodeForm.value)
    }
    editingSimpleNode.value = null; await loadTOC(selectedItem.value.id)
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

// ─── Articles ───
const editingArticle = ref<{ isNew: boolean; articleId?: number } | null>(null)
const articleForm = ref({ title: '', content: '', content_type: 'markdown' as 'markdown' | 'txt', summary: '', chapter_id: null as number | null })

const createArticle = () => {
  selectedNode.value = null
  editingArticle.value = { isNew: true }
  articleForm.value = { title: '', content: '', content_type: 'markdown', summary: '', chapter_id: null }
}

const openArticle = async (art: any) => {
  if (!selectedItem.value) return
  try {
    const res = await itemAPI.getArticle(selectedItem.value.id, art.id)
    editingArticle.value = { isNew: false, articleId: art.id }
    articleForm.value = { title: res.article.title, content: res.article.content || '', content_type: res.article.content_type || 'markdown', summary: res.article.summary || '', chapter_id: res.article.chapter_id }
  } catch { alert('加载文章失败') }
}

const saveArticle = async () => {
  if (!articleForm.value.title || !selectedItem.value || !editingArticle.value) return
  saving.value = true
  try {
    const data = { ...articleForm.value }
    if (editingArticle.value.isNew) {
      await itemAPI.createArticle(selectedItem.value.id, data)
    } else {
      await itemAPI.updateArticle(selectedItem.value.id, editingArticle.value.articleId!, data)
    }
    editingArticle.value = null; await loadTOC(selectedItem.value.id)
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const exportBook = (format: 'markdown' | 'txt' = 'markdown') => {
  if (!selectedItem.value) return
  const token = localStorage.getItem('auth_token')
  const url = itemAPI.exportBook(selectedItem.value.id, format)
  const a = document.createElement('a')
  a.href = token ? `${url}&token=${encodeURIComponent(token)}` : url
  a.download = ''
  // Use fetch to add auth header
  fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    .then(res => {
      if (!res.ok) throw new Error('导出失败')
      return res.blob()
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob)
      a.href = blobUrl
      a.download = `${selectedItem.value.title || 'export'}.zip`
      a.click()
      URL.revokeObjectURL(blobUrl)
    })
    .catch(() => alert('导出失败，请稍后重试'))
}

const downloadWithAuth = (url: string, filename: string) => {
  const token = localStorage.getItem('auth_token')
  fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    .then(res => {
      if (!res.ok) throw new Error('导出失败')
      return res.blob()
    })
    .then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    })
    .catch(() => alert('导出失败，请稍后重试'))
}

const exportEpub = () => {
  if (!selectedItem.value) return
  downloadWithAuth(
    itemAPI.exportBookEpub(selectedItem.value.id),
    `${selectedItem.value.title || 'export'}.epub`
  )
}

const exportPdf = () => {
  if (!selectedItem.value) return
  const token = localStorage.getItem('auth_token')
  const url = itemAPI.exportBookPdf(selectedItem.value.id)
  // Open in new window for print-to-PDF
  fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    .then(res => {
      if (!res.ok) throw new Error('导出失败')
      return res.text()
    })
    .then(html => {
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        win.onload = () => win.print()
      }
    })
    .catch(() => alert('导出失败，请稍后重试'))
}

const epubImportInput = ref<HTMLInputElement | null>(null)
const triggerEpubImport = () => epubImportInput.value?.click()

const handleEpubImport = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !selectedItem.value) return
  if (!confirm(`确认导入 EPUB 文件 "${file.name}" 到 "${selectedItem.value.title}"？\n这将创建新的章节和文章。`)) return

  try {
    const res = await itemAPI.importEpub(selectedItem.value.id, file)
    alert(`导入成功！创建了 ${res.imported.chapters} 个章节和 ${res.imported.articles} 篇文章。`)
    await loadTOC(selectedItem.value.id)
  } catch (err: any) {
    alert(err.error || '导入失败')
  }
  if (epubImportInput.value) epubImportInput.value.value = ''
}

// ─── Content Items (Pages) ───
const contentItems = ref<any[]>([])
const contentPagesLoading = ref(true)
const expandedContentPage = ref('about')
const selectedContentItem = ref<any>(null)
const editingContentItem = ref(false)
const contentItemForm = ref({ id: '', title: '', content: '', type: 'markdown' as string, page: 'about', section: 'main', metadata: '' as string })

const contentPages = [
  { page: 'about', label: '关于页面', icon: 'solar:user-circle-bold-duotone' },
  { page: 'about-miya', label: '关于 Miya', icon: 'solar:star-shine-bold-duotone' },
  { page: 'home', label: '首页', icon: 'solar:home-smile-bold-duotone' },
  { page: 'community', label: '社区', icon: 'solar:users-group-rounded-bold-duotone' },
  { page: 'culture', label: '文化区', icon: 'solar:palette-bold-duotone' },
]

const loadContentItems = async () => {
  contentPagesLoading.value = true
  try {
    const res = await contentAPI.getAllContents()
    contentItems.value = (res.items || res.contents || []).filter((c: any) => c.is_active !== 0)
  } catch { contentItems.value = [] }
  finally { contentPagesLoading.value = false }
}

const toggleContentPage = (page: string) => {
  expandedContentPage.value = expandedContentPage.value === page ? '' : page
}

const getContentItemsForPage = (page: string) => {
  return contentItems.value.filter(c => c.page === page).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
}

const selectContentItem = (ci: any) => {
  selectedContentItem.value = ci
  editingContentItem.value = true
  contentItemForm.value = {
    id: ci.id,
    title: ci.title || '',
    content: ci.content || '',
    type: ci.type || 'markdown',
    page: ci.page || 'about',
    section: ci.section || 'main',
    metadata: typeof ci.metadata === 'string' ? ci.metadata : JSON.stringify(ci.metadata || {}),
  }
}

const createContentItem = () => {
  selectedContentItem.value = null
  editingContentItem.value = true
  contentItemForm.value = { id: `content-${Date.now()}`, title: '', content: '', type: 'markdown', page: expandedContentPage.value || 'about', section: 'custom', metadata: '' }
}

const cancelContentEdit = () => {
  selectedContentItem.value = null
  editingContentItem.value = false
  contentItemForm.value = { id: '', title: '', content: '', type: 'markdown', page: 'about', section: 'main', metadata: '' }
}

const saveContentItem = async () => {
  if (!contentItemForm.value.title) return
  saving.value = true
  try {
    const data = {
      ...contentItemForm.value,
      type: contentItemForm.value.type || 'markdown',
      metadata: contentItemForm.value.metadata || null,
    }
    if (selectedContentItem.value) {
      await contentAPI.updateContent(selectedContentItem.value.id, data)
    } else {
      await contentAPI.createContent(data)
    }
    await loadContentItems()
    cancelContentEdit()
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const deleteContentItem = async (id: string) => {
  if (!confirm('确定删除此内容项？')) return
  try {
    await contentAPI.deleteContent(id)
    if (selectedContentItem.value?.id === id) cancelContentEdit()
    await loadContentItems()
  } catch { alert('删除失败') }
}

// Load content items when switching to pages tab
watch(activeTab, (tab) => {
  if (tab === 'pages') loadContentItems()
})

// Init
loadCollections()
if (activeTab.value === 'pages') loadContentItems()
</script>
