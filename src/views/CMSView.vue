<template>
  <div class="flex flex-col h-[calc(100vh-5rem)]">
    <!-- Header Bar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-white/6 flex-shrink-0">
      <div class="flex items-center gap-3">
        <router-link to="/" class="btn-ghost !px-2">
          <Icon name="solar:arrow-left-bold" size="sm" />
        </router-link>
        <h1 class="text-lg font-bold text-white tracking-tight">内容管理</h1>
      </div>
      <div class="flex items-center gap-2">
        <button @click="showPasswordModal = true" class="btn-ghost !px-2 text-xs" title="修改密码">
          <Icon name="solar:lock-password-linear" size="sm" />
        </button>
        <div class="flex gap-1 p-0.5 glass-card !p-0.5">
          <button v-for="tab in tabs" :key="tab.id" @click="switchTab(tab.id)" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === tab.id ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
            <Icon :name="tab.icon" size="xs" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden">
      <!-- Tree Editor Mode -->
      <div v-if="['blog', 'library', 'companions'].includes(activeTab)" class="flex h-full">
        <!-- Sidebar Tree -->
        <div class="w-64 border-r border-white/6 overflow-y-auto flex-shrink-0 bg-black/20">
          <!-- Collection List -->
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ activeTab === 'companions' ? 'OC 组' : activeTab === 'blog' ? '笔记集合' : '创作集合' }}</span>
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
                :class="['flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors group', selectedCollection?.id === col.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50']">
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
          <div v-if="selectedCollection" class="border-t border-white/6 p-3">
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
                :class="['flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors group', selectedItem?.id === item.id ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'text-gray-300 hover:bg-white/3']">
                <Icon name="solar:document-text-bold-duotone" size="sm" />
                <span class="flex-1 truncate">{{ item.title }}</span>
                <span v-if="item.status === 'draft'" class="text-[9px] text-amber-500/70 font-mono mr-1">DRAFT</span>
                <span class="text-[9px] text-gray-400 font-mono">{{ item.status === 'published' ? 'PUB' : '' }}</span>
                <div class="hidden group-hover:flex items-center gap-0.5">
                  <button @click.stop="editItem(item)" class="p-0.5 text-gray-400 hover:text-primary-500"><Icon name="solar:pen-linear" size="xs" /></button>
                  <button @click.stop="deleteItem(item.id)" class="p-0.5 text-gray-400 hover:text-red-500"><Icon name="solar:trash-bin-trash-linear" size="xs" /></button>
                </div>
              </div>
              <div v-if="items.length === 0" class="text-center py-4 text-xs text-gray-400">暂无内容</div>
            </div>
          </div>

          <!-- Articles under Item -->
          <div v-if="selectedItem && toc" class="border-t border-white/6 p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">文章列表</span>
              <button @click="createArticle" class="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="新建文章">
                <Icon name="solar:add-circle-linear" size="sm" />
              </button>
            </div>
            <div class="space-y-0.5 max-h-64 overflow-y-auto">
              <div v-for="art in toc.directArticles" :key="'da'+art.id"
                @click="selectNode('article', art)"
                :class="['flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors', selectedNode?.type === 'article' && selectedNode?.data.id === art.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-400 hover:bg-gray-100/50']">
                <Icon name="solar:document-bold" size="xs" />
                <span class="truncate">{{ art.title }}</span>
                <span v-if="art.content_type" class="text-[9px] text-gray-400 font-mono ml-auto">{{ art.content_type === 'markdown' ? 'MD' : 'TXT' }}</span>
              </div>
              <div v-if="!toc.directArticles?.length" class="text-center py-4 text-xs text-gray-400">暂无文章，点击 + 创建</div>
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
              <button @click="exportBook('txt')" class="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-200 text-sm rounded-xl transition-colors">
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
              <button @click="triggerEpubImport" class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-white/10 hover:border-primary-400 dark:hover:border-primary-500 text-gray-500 hover:text-primary-600 text-sm rounded-xl transition-colors">
                <Icon name="solar:upload-minimalistic-bold" size="sm" />
                导入 EPUB
              </button>
            </div>
            <input ref="epubImportInput" type="file" accept=".epub" class="hidden" @change="handleEpubImport" />

            <!-- OC Image management -->
            <div v-if="activeTab === 'companions'" class="mt-8 max-w-md w-full">
              <OCImagePanel :item-id="selectedItem.id" :item-title="selectedItem.title" />
            </div>
          </div>

          <!-- Item Editor -->
          <div v-else-if="editingItem" class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-bold text-white">编辑内容项</h2>
                <p v-if="itemForm.source_file" class="text-[10px] font-mono text-hud-dim mt-1">
                  📄 {{ itemForm.source_file }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', itemForm.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400']">
                  {{ itemForm.status === 'published' ? '已发布' : '草稿' }}
                </span>
                <button @click="toggleItemPublish" :class="['px-4 py-1.5 rounded-md text-xs font-medium transition-all', itemForm.status === 'published' ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25']">
                  {{ itemForm.status === 'published' ? '→ 下架为草稿' : '→ 发布' }}
                </button>
              </div>
            </div>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium text-gray-400 mb-1">标题</label><input v-model="itemForm.title" class="input-field" placeholder="标题" /></div>
                <div><label class="block text-sm font-medium text-gray-400 mb-1">Slug</label><input v-model="itemForm.slug" class="input-field" placeholder="url-slug" /></div>
              </div>
              <div><label class="block text-sm font-medium text-gray-400 mb-1">描述</label><textarea v-model="itemForm.description" class="input-field !h-20 resize-none" placeholder="简短描述" /></div>
              <CoverUpload v-model="itemForm.cover_image" label="封面图片" placeholder="https://..." />
              <div><label class="block text-sm font-medium text-gray-400 mb-1">标签（逗号分隔）</label><input v-model="itemForm.tags" class="input-field" placeholder="标签1, 标签2" /></div>
              <TextEditor v-model="itemForm.content" :default-format="(itemForm.content_type as any)" label="正文内容" @format-change="itemForm.content_type = $event" />
              <div class="flex gap-3">
                <button @click="saveItem" class="btn-primary" :disabled="saving">保存</button>
                <button @click="editingItem = false" class="btn-secondary">取消</button>
              </div>
            </div>
          </div>

          <!-- Article Editor -->
          <div v-else-if="editingArticle" class="max-w-4xl mx-auto">
            <h2 class="text-xl font-bold text-white mb-6">{{ editingArticle.isNew ? '新建文章' : '编辑文章' }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">标题</label>
                <input v-model="articleForm.title" class="input-field" placeholder="文章标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">摘要</label>
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
            <h2 class="text-xl font-bold text-white mb-6">{{ editingSimpleNode.isNew ? '新建' : '编辑' }}{{ editingSimpleNode.type === 'volume' ? '卷' : '章节' }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">标题</label>
                <input v-model="simpleNodeForm.title" class="input-field" placeholder="标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">描述</label>
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
                <h2 class="text-lg font-bold text-white">{{ selectedNode.data.title }}</h2>
                <div class="flex gap-2">
                  <button @click="editSelectedNode" class="btn-ghost text-xs">编辑</button>
                  <button @click="deleteSelectedNode" class="btn-ghost text-xs text-red-500">删除</button>
                </div>
              </div>
              <p v-if="selectedNode.data.description" class="text-sm text-gray-400 mb-4">{{ selectedNode.data.description }}</p>
              <!-- If chapter, show articles -->
              <div v-if="selectedNode.type === 'chapter' && selectedNode.data.articles?.length">
                <h3 class="text-sm font-medium text-gray-400 mb-2">文章</h3>
                <div v-for="art in selectedNode.data.articles" :key="art.id" @click="openArticle(art)" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors text-sm">
                  <Icon name="solar:document-bold" size="sm" />
                  <span class="flex-1 text-gray-300">{{ art.title }}</span>
                  <span class="badge text-xs">{{ art.content_type || 'markdown' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 人文区管理模式 -->
      <div v-else-if="activeTab === 'gallery'" class="overflow-y-auto h-full">
        <div class="container mx-auto px-6 py-6 max-w-4xl">
          <!-- Sub tabs matching CultureView -->
          <div class="flex gap-2 mb-8">
            <button v-for="st in cultureSubTabs" :key="st.id" @click="cultureSubTab = st.id"
              class="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              :class="cultureSubTab === st.id ? 'bg-[var(--color-primary)] text-white' : 'bg-white/[0.03] text-[var(--color-text-dim)]'">
              <Icon :name="st.icon" size="sm" class="mr-1" />{{ st.label }}
            </button>
          </div>

          <!-- 美图 -->
          <div v-if="cultureSubTab === 'gallery'">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-white">美图管理</h2>
              <div class="flex gap-2">
                <button @click="openGroupModal" class="btn-secondary text-sm"><Icon name="solar:widget-2-linear" size="xs" class="mr-1" />分组</button>
                <button @click="openImageModal(null)" class="btn-primary text-sm"><Icon name="solar:add-circle-linear" size="xs" class="mr-1" />上传图片</button>
              </div>
            </div>
            <div v-if="sortedGroups.length > 0" class="mb-6">
              <div class="flex flex-wrap gap-2 mb-4">
                <button @click="selectedGroupId = null" :class="['px-3 py-1.5 rounded-full text-xs transition-all', selectedGroupId === null ? 'bg-[var(--color-primary)] text-white' : 'bg-white/[0.03] text-[var(--color-text-dim)]']">全部 ({{ galleryImages.length }})</button>
                <button v-for="g in sortedGroups" :key="g.id" @click="selectedGroupId = g.id" :class="['px-3 py-1.5 rounded-full text-xs transition-all', selectedGroupId === g.id ? 'bg-[var(--color-primary)] text-white' : 'bg-white/[0.03] text-[var(--color-text-dim)]']">{{ g.emoji }} {{ g.name }} ({{ getGroupImageCount(g.id) }})</button>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div v-for="img in filteredGalleryImages" :key="img.id" class="glass-card !p-0 overflow-hidden group relative">
                <div class="aspect-square flex items-center justify-center bg-white/[0.02]">
                  <img v-if="img.imageUrl" :src="img.imageUrl" :alt="img.title" class="w-full h-full object-contain" />
                  <span v-else class="text-3xl">{{ img.emoji }}</span>
                </div>
                <div class="p-2"><p class="text-xs font-medium truncate" style="color: var(--color-text);">{{ img.title }}</p></div>
                <div class="absolute top-1 right-1 hidden group-hover:flex items-center gap-1">
                  <button @click.stop="openImageModal(img)" class="p-1 rounded bg-black/50 text-white text-xs">✎</button>
                  <button @click.stop="deleteGalleryImage(img.id)" class="p-1 rounded bg-red-500/80 text-white text-xs">✕</button>
                </div>
              </div>
              <div v-if="filteredGalleryImages.length === 0" class="col-span-full text-caption text-center py-12">暂无图片</div>
            </div>
          </div>

          <!-- 日记 -->
          <div v-if="cultureSubTab === 'diary'">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-white">日记管理</h2>
              <button @click="openDiaryEditor(null)" class="btn-primary text-sm"><Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" />写日记</button>
            </div>
            <div v-if="diaries.length === 0" class="text-caption text-center py-12">还没有日记</div>
            <div v-else class="space-y-3">
              <div v-for="entry in diaries" :key="entry.id" class="glass-card !p-4 flex items-center justify-between group">
                <div>
                  <p class="text-sm font-medium" style="color: var(--color-text);">{{ entry.title }}</p>
                  <p class="text-caption">{{ entry.date }} · {{ entry.weather }}</p>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openDiaryEditor(entry)" class="btn-ghost text-xs">编辑</button>
                  <button @click="deleteDiaryEntry(entry.id)" class="btn-ghost text-xs text-red-400">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 书单 -->
          <div v-if="cultureSubTab === 'books'">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-white">书单管理</h2>
              <button @click="openBookEditor(null)" class="btn-primary text-sm"><Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" />添加书籍</button>
            </div>
            <div v-if="books.length === 0" class="text-caption text-center py-12">还没有书单</div>
            <div v-else class="space-y-3">
              <div v-for="book in books" :key="book.id" class="glass-card !p-4 flex items-center justify-between group">
                <div>
                  <p class="text-sm font-medium" style="color: var(--color-text);">{{ book.title }}</p>
                  <p class="text-caption">{{ book.author }}</p>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openBookEditor(book)" class="btn-ghost text-xs">编辑</button>
                  <button @click="deleteBook(book.id)" class="btn-ghost text-xs text-red-400">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 视听 -->
          <div v-if="cultureSubTab === 'audiovisual'">
            <div class="mb-10">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">电影</h2>
                <button @click="openMovieEditor(null)" class="btn-primary text-sm"><Icon name="solar:add-circle-linear" size="xs" class="mr-1" />添加电影</button>
              </div>
              <div v-if="movies.length === 0" class="text-caption text-center py-8">还没有电影</div>
              <div v-else class="space-y-3">
                <div v-for="m in movies" :key="m.id" class="glass-card !p-4 flex items-center justify-between group">
                  <div>
                    <p class="text-sm font-medium" style="color: var(--color-text);">{{ m.title }} <span class="text-caption">({{ m.year }})</span></p>
                    <p class="text-caption">★ {{ m.rating }} · {{ m.genre }}</p>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openMovieEditor(m)" class="btn-ghost text-xs">编辑</button>
                    <button @click="deleteMovie(m.id)" class="btn-ghost text-xs text-red-400">删除</button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">音乐</h2>
                <button @click="openMusicEditor(null)" class="btn-primary text-sm"><Icon name="solar:add-circle-linear" size="xs" class="mr-1" />添加音乐</button>
              </div>
              <div v-if="musicList.length === 0" class="text-caption text-center py-8">还没有音乐</div>
              <div v-else class="space-y-3">
                <div v-for="m in musicList" :key="m.id" class="glass-card !p-4 flex items-center justify-between group">
                  <div>
                    <p class="text-sm font-medium" style="color: var(--color-text);">{{ m.title }}</p>
                    <p class="text-caption">{{ m.artist }} · {{ m.genre }}</p>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openMusicEditor(m)" class="btn-ghost text-xs">编辑</button>
                    <button @click="deleteMusic(m.id)" class="btn-ghost text-xs text-red-400">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Tabs: keep old panels -->
      <div v-else class="overflow-y-auto h-full">
        <div class="container mx-auto px-6 py-6 max-w-5xl">
          <NavigationPanel v-if="activeTab === 'navigation'" />
          <!-- Background Tab -->
          <div v-if="activeTab === 'background'" class="container mx-auto px-6 py-6 max-w-3xl">
            <BackgroundPanel />
          </div>
          <div v-if="activeTab === 'sidebar-images'" class="container mx-auto px-6 py-6 max-w-3xl">
            <SidebarImagesPanel />
          </div>
          <div v-if="activeTab === 'sidebar-links'" class="container mx-auto px-6 py-6 max-w-3xl">
            <SidebarLinksPanel />
          </div>
          <div v-if="activeTab === 'announcement'" class="container mx-auto px-6 py-6 max-w-3xl">
            <AnnouncementPanel />
          </div>
          <div v-if="activeTab === 'feature-cards'" class="container mx-auto px-6 py-6 max-w-3xl">
            <FeatureCardPanel />
          </div>
          <div v-if="activeTab === 'banner'" class="container mx-auto px-6 py-6 max-w-3xl">
            <BannerImagesPanel />
          </div>
          <div v-if="activeTab === 'about'" class="container mx-auto px-6 py-6 max-w-3xl">
            <AboutPanel />
          </div>
          <div v-if="activeTab === 'resources'" class="space-y-8">
            <MediaLibrary />
            <ResourcePanel />
          </div>
          <LegacyPanel v-if="activeTab === 'legacy'" />
        </div>
      </div>
    </div>

    <!-- Culture Editor Modal -->
    <Teleport to="body">
      <div v-if="showCultureModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showCultureModal = false">
        <div class="glass-panel p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-5">{{ cultureModalTitle }}</h2>
          <div class="space-y-4">
            <div v-for="field in cultureModalFields" :key="field.key">
              <label class="block text-xs font-medium text-gray-400 mb-1">{{ field.label }}</label>
              <input v-if="field.type !== 'textarea' && field.type !== 'tags'" v-model="cultureModalForm[field.key]" :type="field.type || 'text'" class="input-field w-full" :placeholder="field.placeholder || ''" />
              <textarea v-else-if="field.type === 'textarea'" v-model="cultureModalForm[field.key]" class="input-field w-full !h-24 resize-none" :placeholder="field.placeholder || ''" />
              <div v-else-if="field.type === 'tags'" class="flex flex-wrap items-center gap-1.5 input-field min-h-[38px] cursor-text">
                <span v-for="(tag, i) in parsedTags" :key="i" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs" style="background: var(--color-primary); color: #fff;">{{ tag }}<button @click="removeTag(i)" class="hover:text-red-300">&times;</button></span>
                <input v-model="tagInput" class="flex-1 min-w-[80px] bg-transparent outline-none text-sm" style="color: var(--color-text-dim);" placeholder="输入后按回车" @keydown.enter.prevent="addTag" />
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="cultureModalSave!(cultureModalForm)" class="btn-primary flex-1">保存</button>
            <button @click="showCultureModal = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Modal -->
    <Teleport to="body">
      <div v-if="showImageModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showImageModal = false">
        <div class="glass-panel p-6 max-w-lg w-full animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-5">{{ editingImage ? '编辑图片' : '上传图片' }}</h2>
          <div class="space-y-4">
            <div><label class="block text-xs font-medium text-gray-400 mb-1">标题</label><input v-model="imageForm.title" class="input-field w-full" /></div>
            <div><label class="block text-xs font-medium text-gray-400 mb-1">图片 URL</label><input v-model="imageForm.imageUrl" class="input-field w-full" placeholder="https://..." /></div>
            <div><label class="block text-xs font-medium text-gray-400 mb-1">分组</label><select v-model="imageForm.groupId" class="input-field w-full"><option value="">无分组</option><option v-for="g in sortedGroups" :key="g.id" :value="g.id">{{ g.emoji }} {{ g.name }}</option></select></div>
          </div>
          <div class="flex gap-3 mt-6"><button @click="saveGalleryImage" class="btn-primary flex-1">保存</button><button @click="showImageModal = false" class="btn-secondary">取消</button></div>
        </div>
      </div>
    </Teleport>

    <!-- Collection Modal -->
    <Teleport to="body">
      <div v-if="showCreateCollection || showEditCollectionModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeCollectionModal">
        <div class="glass-panel p-6 max-w-md w-full animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-4">{{ showEditCollectionModal ? '编辑' : '新建' }}{{ activeTab === 'library' ? '图书组' : 'OC 组' }}</h2>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-400 mb-1">名称</label><input v-model="colForm.name" class="input-field" placeholder="名称" /></div>
            <div><label class="block text-xs font-medium text-gray-400 mb-1">Slug</label><input v-model="colForm.slug" class="input-field" placeholder="url-slug" /></div>
            <div><label class="block text-xs font-medium text-gray-400 mb-1">描述</label><textarea v-model="colForm.description" class="input-field !h-16 resize-none" /></div>
            <CoverUpload v-model="colForm.cover_image" label="封面" placeholder="https://..." />
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
          <h2 class="text-lg font-bold text-white mb-4">{{ showEditItemModal ? '编辑' : '新建' }}内容项</h2>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-gray-400 mb-1">标题</label><input v-model="itemForm.title" class="input-field" placeholder="标题" /></div>
              <div><label class="block text-xs font-medium text-gray-400 mb-1">Slug</label><input v-model="itemForm.slug" class="input-field" placeholder="url-slug" /></div>
            </div>
            <div><label class="block text-xs font-medium text-gray-400 mb-1">描述</label><textarea v-model="itemForm.description" class="input-field !h-16 resize-none" /></div>
            <CoverUpload v-model="itemForm.cover_image" label="封面" placeholder="https://..." />
            <TextEditor v-model="itemForm.content" :default-format="(itemForm.content_type as any)" label="正文内容" @format-change="itemForm.content_type = $event" />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="closeItemModal" class="btn-secondary text-sm">取消</button>
            <button @click="saveItemFromModal" class="btn-primary text-sm" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 修改账户弹窗 -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showPasswordModal = false" />
        <div class="relative glass-panel p-6 rounded-2xl w-full max-w-sm mx-4 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="solar:lock-password-linear" size="sm" class="text-amber-500" />
              修改账户
            </h3>
            <button @click="showPasswordModal = false" class="p-1 text-gray-500 hover:text-white">
              <Icon name="solar:close-circle-linear" size="sm" />
            </button>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">新用户名</label>
            <input v-model="passwordForm.username" class="input-field w-full" placeholder="留空则不修改" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">新密码</label>
            <input v-model="passwordForm.newPass" type="password" class="input-field w-full" placeholder="留空则不修改，至少8位含字母数字" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 text-amber-400">当前密码 *</label>
            <input v-model="passwordForm.current" type="password" class="input-field w-full" placeholder="必须输入当前密码以验证身份" />
          </div>
          <div v-if="passwordMsg" :class="passwordOk ? 'text-emerald-400 text-xs' : 'text-red-400 text-xs'">
            {{ passwordMsg }}
          </div>
          <div class="flex gap-3">
            <button @click="showPasswordModal = false" class="btn-ghost flex-1">取消</button>
            <button @click="handleChangePassword" :disabled="passwordLoading" class="btn-primary flex-1" :class="passwordLoading ? 'opacity-60' : ''">
              {{ passwordLoading ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collectionAPI, itemAPI, contentAPI } from '@/utils/apiClient'
import { authAPI } from '@/utils/apiClient'
import { useAuthStore } from '@/stores/auth'

const showPasswordModal = ref(false)
const passwordForm = ref({ username: '', current: '', newPass: '' })
const passwordLoading = ref(false)
const passwordMsg = ref('')
const passwordOk = ref(false)

// ─── 人文区数据 ───
const diaries = ref<any[]>([])
const books = ref<any[]>([])
const movies = ref<any[]>([])
const musicList = ref<any[]>([])
const galleryImages = ref<any[]>([])
const galleryGroups = ref<any[]>([])
const selectedGroupId = ref<string | null>(null)
const cultureSubTab = ref('gallery')
const cultureSubTabs = [
  { id: 'gallery', label: '美图', icon: 'solar:gallery-wide-bold-duotone' },
  { id: 'diary', label: '日记', icon: 'solar:bookmark-bold-duotone' },
  { id: 'books', label: '书单', icon: 'solar:library-bold-duotone' },
  { id: 'audiovisual', label: '视听', icon: 'solar:videocamera-record-bold-duotone' },
]
import Icon from '@/components/ui/Icon.vue'
import TextEditor from '@/components/TextEditor.vue'
import NavigationPanel from '@/components/cms/NavigationPanel.vue'
import ResourcePanel from '@/components/cms/ResourcePanel.vue'
import MediaLibrary from '@/components/cms/MediaLibrary.vue'
import BackgroundPanel from '@/components/cms/BackgroundPanel.vue'
import CoverUpload from '@/components/cms/CoverUpload.vue'
import LegacyPanel from '@/components/cms/LegacyPanel.vue'
import SidebarImagesPanel from '@/components/cms/SidebarImagesPanel.vue'
import OCImagePanel from '@/components/cms/OCImagePanel.vue'
import SidebarLinksPanel from '@/components/cms/SidebarLinksPanel.vue'
import AnnouncementPanel from '@/components/cms/AnnouncementPanel.vue'
import FeatureCardPanel from '@/components/cms/FeatureCardPanel.vue'
import BannerImagesPanel from '@/components/cms/BannerImagesPanel.vue'
import AboutPanel from '@/components/cms/AboutPanel.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.section === 'companions' ? 'companions' : 'library')

async function handleChangePassword() {
  passwordMsg.value = ''
  passwordOk.value = false
  const { username, current, newPass } = passwordForm.value
  if (!current) { passwordMsg.value = '请输入当前密码'; return }
  if (!username && !newPass) { passwordMsg.value = '请填写新用户名或新密码'; return }
  if (newPass && newPass.length < 8) { passwordMsg.value = '新密码至少 8 位'; return }
  passwordLoading.value = true
  try {
    const res = await authAPI.updateAccount({ currentPassword: current, newUsername: username || undefined, newPassword: newPass || undefined })
    if (res.user?.username) {
      const authStore = useAuthStore()
      authStore.user = { ...authStore.user, username: res.user.username }
    }
    passwordMsg.value = '修改成功' + (res.user?.username ? '，新用户名：' + res.user.username : '')
    passwordOk.value = true
    passwordForm.value = { username: '', current: '', newPass: '' }
  } catch (e: any) {
    passwordMsg.value = e?.message || '修改失败'
  }
  finally { passwordLoading.value = false }
}

const tabs = [
  { id: 'blog', label: '技术笔记', icon: 'solar:document-text-bold-duotone' },
  { id: 'library', label: '创作', icon: 'solar:notebook-bold-duotone' },
  { id: 'companions', label: 'OC', icon: 'solar:star-shine-bold-duotone' },
  { id: 'gallery', label: '人文', icon: 'solar:gallery-wide-bold-duotone' },
  { id: 'navigation', label: '导航', icon: 'solar:menu-bold-duotone' },
  { id: 'resources', label: '资源中心', icon: 'solar:folder-with-files-bold-duotone' },
  { id: 'background', label: '背景', icon: 'solar:gallery-wide-bold-duotone' },
  { id: 'sidebar-images', label: '侧栏图', icon: 'solar:images-bold-duotone' },
  { id: 'sidebar-links', label: '链接', icon: 'solar:link-round-bold-duotone' },
  { id: 'announcement', label: '公告', icon: 'solar:chat-square-bold-duotone' },
  { id: 'feature-cards', label: '首页卡', icon: 'solar:widget-2-bold-duotone' },
  { id: 'banner', label: 'Banner', icon: 'solar:gallery-wide-bold-duotone' },
  { id: 'about', label: '关于', icon: 'solar:info-circle-bold-duotone' },
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
    let type: string | undefined
    if (activeTab.value === 'companions') type = 'companion_group'
    else if (activeTab.value === 'blog') type = 'blog'
    else if (activeTab.value === 'library') type = 'book_group'
    const res = await collectionAPI.getAll(type ? { type } as any : undefined)
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
    const type = activeTab.value === 'companions' ? 'companion_group' : activeTab.value === 'blog' ? 'blog' : 'book_group'
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
const itemForm = ref({ title: '', slug: '', description: '', cover_image: '', tags: '', content: '', content_type: 'markdown' as string, status: 'draft' as string, source_file: '' as string })

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
  itemForm.value = { title: item.title, slug: item.slug, description: item.description || '', cover_image: item.cover_image || '', tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''), content: item.content || '', content_type: item.content_type || 'markdown', status: item.status || 'draft', source_file: item.source_file || '' }
  showEditItemModal.value = true
}

const closeItemModal = () => { showCreateItem.value = false; showEditItemModal.value = false; itemForm.value = { title: '', slug: '', description: '', cover_image: '', tags: '', content: '', content_type: 'markdown' } }

const saveItemFromModal = async () => {
  if (!itemForm.value.title || !selectedCollection.value) return
  saving.value = true
  try {
    const type = activeTab.value === 'companions' ? 'companion' : activeTab.value === 'blog' ? 'post' : 'book'
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
    const type = activeTab.value === 'companions' ? 'companion' : activeTab.value === 'blog' ? 'post' : 'book'
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

// ─── Publish / Draft Toggle ───
const toggleItemPublish = async () => {
  if (!selectedItem.value) return
  const newStatus = itemForm.value.status === 'published' ? 'draft' : 'published'
  try {
    await itemAPI.publish(selectedItem.value.id, newStatus)
    itemForm.value.status = newStatus
    if (selectedItem.value) selectedItem.value.status = newStatus
  } catch (e: any) {
    alert(e.error || '操作失败')
  }
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
  { page: 'culture', label: '人文内容', icon: 'solar:gallery-wide-bold-duotone' },
  { page: 'about', label: '关于页面', icon: 'solar:user-circle-bold-duotone' },
  { page: 'about-miya', label: '关于 Miya', icon: 'solar:star-shine-bold-duotone' },
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
  if (tab === 'gallery') loadCultureData()
})

// ─── 人文区数据加载 ───
const loadCultureData = async () => {
  try {
    const res = await contentAPI.getPageContents('culture')
    const sections = res.sections || {}
    const parse = (key: string): any[] => {
      const items = sections[key]
      if (!items || items.length === 0) return []
      const raw = items[0].content
      if (Array.isArray(raw)) return raw
      if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
      return []
    }
    diaries.value = parse('diary')
    books.value = parse('books')
    galleryImages.value = parse('gallery')
    galleryGroups.value = parse('gallery-groups')
    movies.value = parse('movies')
    musicList.value = parse('music')
  } catch (e) { console.error('加载人文区失败:', e) }
}

const sortedGroups = computed(() => [...galleryGroups.value].sort((a, b) => a.order - b.order))
const filteredGalleryImages = computed(() => selectedGroupId.value ? galleryImages.value.filter((img: any) => img.groupId === selectedGroupId.value) : galleryImages.value)
const getGroupImageCount = (groupId: string) => galleryImages.value.filter((img: any) => img.groupId === groupId).length

// ─── 人文区 CRUD ───
const saveSectionContent = async (contentId: string, data: any[]) => {
  const payload = { id: contentId, type: 'array', title: cultureModalTitle.value || contentId, content: JSON.stringify(data), page: 'culture', section: contentId.replace('culture-', '') }
  try { await contentAPI.updateContent(contentId, payload) } catch { await contentAPI.createContent(payload) }
}

let cultureModalForm = ref<Record<string, any>>({})
let cultureModalFields = ref<any[]>([])
let cultureModalSave = ref<((f: any) => Promise<void>) | null>(null)
let cultureModalTitle = ref('')

const openGenericModal = (title: string, fields: any[], form: any, saveFn: (f: any) => Promise<void>) => {
  cultureModalTitle.value = title; cultureModalFields.value = fields; cultureModalForm.value = { ...form }; cultureModalSave.value = saveFn
  showCultureModal.value = true
}

const showCultureModal = ref(false)
const tagInput = ref('')
const parsedTags = computed(() => {
  const v = cultureModalForm.value.tags; if (Array.isArray(v)) return v; if (typeof v === 'string') return v.split(',').map((s: string) => s.trim()).filter(Boolean); return []
})
const addTag = () => { const t = tagInput.value.trim(); if (!t) return; const tags = [...parsedTags.value]; if (!tags.includes(t)) tags.push(t); cultureModalForm.value.tags = tags; tagInput.value = '' }
const removeTag = (i: number) => { const tags = [...parsedTags.value]; tags.splice(i, 1); cultureModalForm.value.tags = tags }

// Diary
const openDiaryEditor = (entry: any) => {
  openGenericModal(entry ? '编辑日记' : '写日记',
    [{ key: 'date', label: '日期', type: 'date' }, { key: 'weather', label: '天气', placeholder: '☀️ 晴' }, { key: 'title', label: '标题' }, { key: 'content', label: '内容', type: 'textarea' }, { key: 'link', label: '链接', placeholder: 'https://...' }],
    entry || { id: Date.now(), date: new Date().toISOString().split('T')[0], weather: '', title: '', content: '', link: '' },
    async (f) => { if (f.id && diaries.value.find((d: any) => d.id === f.id)) { diaries.value[diaries.value.findIndex((d: any) => d.id === f.id)] = f } else { diaries.value.unshift(f) }; await saveSectionContent('culture-diary', diaries.value) }
  )
}
const deleteDiaryEntry = async (id: number) => { if (!confirm('删除？')) return; diaries.value = diaries.value.filter((d: any) => d.id !== id); await saveSectionContent('culture-diary', diaries.value) }

// Books
const openBookEditor = (book: any) => {
  openGenericModal(book ? '编辑书籍' : '添加书籍',
    [{ key: 'title', label: '书名' }, { key: 'author', label: '作者' }, { key: 'review', label: '书评', type: 'textarea' }, { key: 'link', label: '链接', placeholder: 'https://...' }, { key: 'tags', label: '标签', type: 'tags' }],
    book || { id: Date.now(), title: '', author: '', review: '', link: '', tags: [] },
    async (f) => { if (books.value.find((b: any) => b.id === f.id)) { books.value[books.value.findIndex((b: any) => b.id === f.id)] = f } else { books.value.unshift(f) }; await saveSectionContent('culture-books', books.value) }
  )
}
const deleteBook = async (id: number) => { if (!confirm('删除？')) return; books.value = books.value.filter((b: any) => b.id !== id); await saveSectionContent('culture-books', books.value) }

// Movies
const openMovieEditor = (movie: any) => {
  openGenericModal(movie ? '编辑电影' : '添加电影',
    [{ key: 'title', label: '电影名' }, { key: 'year', label: '年份', type: 'number' }, { key: 'director', label: '导演' }, { key: 'rating', label: '评分', type: 'number' }, { key: 'genre', label: '类型' }, { key: 'review', label: '影评', type: 'textarea' }, { key: 'link', label: '链接', placeholder: 'https://...' }, { key: 'tags', label: '标签', type: 'tags' }],
    movie || { id: Date.now(), title: '', year: new Date().getFullYear(), director: '', rating: 0, genre: '', review: '', link: '', tags: [] },
    async (f) => { f.year = Number(f.year) || new Date().getFullYear(); f.rating = Number(f.rating) || 0; if (movies.value.find((m: any) => m.id === f.id)) { movies.value[movies.value.findIndex((m: any) => m.id === f.id)] = f } else { movies.value.unshift(f) }; await saveSectionContent('culture-movies', movies.value) }
  )
}
const deleteMovie = async (id: number) => { if (!confirm('删除？')) return; movies.value = movies.value.filter((m: any) => m.id !== id); await saveSectionContent('culture-movies', movies.value) }

// Music
const openMusicEditor = (track: any) => {
  openGenericModal(track ? '编辑音乐' : '添加音乐',
    [{ key: 'title', label: '歌曲名' }, { key: 'artist', label: '艺术家' }, { key: 'genre', label: '类型' }, { key: 'duration', label: '时长' }, { key: 'review', label: '评价', type: 'textarea' }, { key: 'link', label: '链接', placeholder: 'https://...' }, { key: 'tags', label: '标签', type: 'tags' }],
    track || { id: Date.now(), title: '', artist: '', genre: '', duration: '', review: '', link: '', tags: [] },
    async (f) => { if (musicList.value.find((m: any) => m.id === f.id)) { musicList.value[musicList.value.findIndex((m: any) => m.id === f.id)] = f } else { musicList.value.unshift(f) }; await saveSectionContent('culture-music', musicList.value) }
  )
}
const deleteMusic = async (id: number) => { if (!confirm('删除？')) return; musicList.value = musicList.value.filter((m: any) => m.id !== id); await saveSectionContent('culture-music', musicList.value) }

// Gallery
const imageForm = ref({ title: '', groupId: '', imageUrl: '', date: '' })
const showImageModal = ref(false)
const editingImage = ref<any>(null)

const openImageModal = (image: any) => {
  editingImage.value = image
  imageForm.value = image ? { title: image.title, groupId: image.groupId || '', imageUrl: image.imageUrl || '', date: image.date } : { title: '', groupId: '', imageUrl: '', date: new Date().toISOString().split('T')[0] }
  showImageModal.value = true
}

const saveGalleryImage = async () => {
  if (!imageForm.value.title) return alert('请输入标题')
  const newImg = { id: editingImage.value?.id || Date.now(), title: imageForm.value.title, date: imageForm.value.date || new Date().toISOString().split('T')[0], imageUrl: imageForm.value.imageUrl, groupId: imageForm.value.groupId }
  if (editingImage.value) { const idx = galleryImages.value.findIndex((i: any) => i.id === editingImage.value.id); if (idx >= 0) galleryImages.value[idx] = newImg }
  else { galleryImages.value.unshift(newImg) }
  await saveSectionContent('culture-gallery', galleryImages.value)
  showImageModal.value = false
}

const deleteGalleryImage = async (id: number) => { if (!confirm('删除？')) return; galleryImages.value = galleryImages.value.filter((i: any) => i.id !== id); await saveSectionContent('culture-gallery', galleryImages.value) }

// Init
loadCollections()
loadCultureData()
</script>
