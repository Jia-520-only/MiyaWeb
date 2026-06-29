<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <SectionHeader
        gradient-title="人文"
        description="美图收藏、生活日记、书单推荐、视听分享"
        :cover-image="coverImage"
      />

      <!-- Tab Navigation -->
      <div class="flex items-center justify-center gap-1 mb-10 animate-slide-up flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            activeTab === tab.id
              ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-sub hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <Icon :name="tab.icon" size="sm" />
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <!-- ==================== 日记 Tab ==================== -->
        <div v-if="activeTab === 'diary'">
          <div v-if="canEdit" class="flex justify-end mb-6">
            <button @click="openDiaryEditor(null)" class="btn-primary text-sm">
              <Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" /> 写日记
            </button>
          </div>
          <div v-if="diaries.length === 0" class="text-center py-20 text-sub">
            <Icon name="solar:notebook-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
            <p class="text-sub text-sm">还没有日记，开始记录生活吧</p>
            <p v-if="canEdit" class="text-caption mt-3">点击右上角"写日记"按钮写下第一篇</p>
          </div>
          <div v-else class="max-w-3xl mx-auto space-y-6">
            <div v-for="entry in diaries" :key="entry.id" class="glass-card !p-6 group relative animate-fade-in">
              <div class="flex items-center gap-3 text-sm mb-3" style="color: var(--color-text-caption);">
                <Icon name="solar:calendar-bold-duotone" size="xs" />
                <span>{{ entry.date }}</span>
                <span style="color: var(--color-text-muted);">|</span>
                <span>{{ entry.weather }}</span>
              </div>
              <h3 class="text-xl font-bold mb-3" style="color: var(--color-text);">{{ entry.title }}</h3>
              <p class="leading-relaxed whitespace-pre-wrap" style="color: var(--color-text-dim);">{{ entry.content }}</p>
              <a v-if="entry.link" :href="entry.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs mt-2 hover:underline" style="color: var(--color-primary);">
                <Icon name="solar:link-round-bold" size="xs" /> 相关链接
              </a>
              <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                <button @click="openDiaryEditor(entry)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click="deleteDiaryEntry(entry.id)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                  <Icon name="solar:trash-bin-trash-linear" size="xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 创作 Tab （联动创作板块） ==================== -->
        <div v-if="activeTab === 'novel'">
          <div v-if="libLoading" class="flex justify-center py-20">
            <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else-if="libCollections.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link
              v-for="col in libCollections"
              :key="col.id"
              :to="`/library/${col.id}`"
              class="group glass-card p-6 hover:border-[var(--color-border-glow)] transition-all duration-300"
            >
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style="background: var(--color-surface);">
                  <img v-if="col.cover_image" :src="col.cover_image" :alt="col.name" class="w-full h-full object-cover" loading="lazy" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="solar:notebook-bold-duotone" size="xl" style="color: var(--color-primary);" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="badge" style="background: var(--color-primary); color: #fff;">图书组</span>
                    <span class="text-caption font-mono">{{ (col.itemCount ?? col.item_count) || 0 }} 项</span>
                  </div>
                  <h2 class="text-lg font-semibold group-hover:text-[var(--color-primary)] transition-colors line-clamp-1" style="color: var(--color-text);">{{ col.name }}</h2>
                  <p class="text-sub text-sm line-clamp-2 mt-1">{{ col.description || '暂无描述' }}</p>
                </div>
              </div>
            </router-link>
          </div>
          <div v-else class="text-center py-20 text-sub">
            <Icon name="solar:notebook-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
            <p class="text-sub text-sm">还没有创作内容</p>
            <p class="text-caption mt-3">前往 <router-link to="/cms" class="hover:underline" style="color: var(--color-primary);">管理后台</router-link> 创建你的第一个图书组</p>
          </div>
        </div>

        <!-- ==================== 书单 Tab ==================== -->
        <div v-if="activeTab === 'books'">
          <div v-if="canEdit" class="flex justify-end mb-6">
            <button @click="openBookEditor(null)" class="btn-primary text-sm">
              <Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" /> 添加书籍
            </button>
          </div>
          <div v-if="books.length === 0" class="text-center py-20 text-sub">
            <Icon name="solar:library-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
            <p class="text-sub text-sm">还没有书单，分享你的阅读吧</p>
            <p v-if="canEdit" class="text-caption mt-3">点击右上角"添加书籍"按钮分享好书</p>
          </div>
          <div v-else class="max-w-4xl mx-auto space-y-6">
            <div v-for="book in books" :key="book.id" class="glass-card !p-6 group relative animate-fade-in">
              <div class="flex items-start gap-5">
                <div class="w-16 h-24 bg-gradient-to-br from-secondary-400/20 to-primary-400/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                  📚
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold mb-1" style="color: var(--color-text);">{{ book.title }}</h3>
                  <p class="text-sm text-sub mb-2">{{ book.author }}</p>
                  <p class="text-sub text-sm mb-3">{{ book.review }}</p>
                  <a v-if="book.link" :href="book.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs hover:underline mb-2" style="color: var(--color-primary);">
                    <Icon name="solar:link-round-bold" size="xs" /> 查看详情
                  </a>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="tag in book.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-white/5 text-sub">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                <button @click="openBookEditor(book)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click="deleteBook(book.id)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                  <Icon name="solar:trash-bin-trash-linear" size="xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 美图 Tab ==================== -->
        <div v-if="activeTab === 'gallery'">
          <!-- Admin buttons -->
          <div v-if="canEdit" class="flex justify-end gap-3 mb-6">
            <button @click="openGroupModal" class="btn-secondary text-sm">
              <Icon name="solar:widget-2-linear" size="xs" class="mr-1" /> 管理分组
            </button>
            <button @click="openImageModal(null)" class="btn-primary text-sm">
              <Icon name="solar:add-circle-linear" size="xs" class="mr-1" /> 上传图片
            </button>
          </div>

          <!-- Group filter pills -->
          <div v-if="sortedGroups.length > 0" class="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              @click="selectedGroupId = null"
              :class="['px-4 py-2 rounded-full text-sm transition-all duration-200', selectedGroupId === null ? 'bg-primary-500 text-white shadow-sm' : 'bg-black/35 text-gray-500 hover:bg-white/5']"
            >全部</button>
            <button
              v-for="group in sortedGroups"
              :key="group.id"
              @click="selectedGroupId = group.id"
              :class="['px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5', selectedGroupId === group.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-black/35 text-gray-500 hover:bg-white/5']"
            >
              <span>{{ group.emoji }}</span>
              <span>{{ group.name }}</span>
              <span class="text-xs opacity-60">({{ getGroupImageCount(group.id) }})</span>
            </button>
          </div>

          <!-- Group overview cards (no group selected) -->
          <div v-if="selectedGroupId === null && sortedGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              v-for="group in sortedGroups"
              :key="group.id"
              @click="selectedGroupId = group.id"
              class="glass-card !p-0 cursor-pointer group-card overflow-hidden animate-fade-in"
            >
              <div class="gallery-group-cover overflow-hidden relative">
                <img v-if="getGroupCoverImage(group.id)" :src="getGroupCoverImage(group.id)!.imageUrl" :alt="group.name" class="w-full h-auto object-contain max-h-48 group-card-hover:scale-105 transition-transform duration-500" />
                <span v-else class="text-5xl p-8 block text-center">{{ group.emoji }}</span>
                <div class="absolute inset-0 bg-black/0 group-card-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div class="p-4 flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-white">{{ group.name }}</h3>
                  <p class="text-xs text-sub mt-0.5">{{ group.description }}</p>
                </div>
                <span class="text-xs text-sub font-medium">{{ getGroupImageCount(group.id) }} 张</span>
              </div>
            </div>
          </div>

          <!-- Image grid (group selected or no groups) -->
          <div v-else class="gallery-masonry">
            <div v-for="image in filteredImages" :key="image.id"
              class="gallery-card glass-card !p-0 overflow-hidden group relative animate-fade-in cursor-pointer"
              @click="lightbox = image">
              <div class="gallery-img-wrap">
                <img v-if="image.imageUrl" :src="image.imageUrl" :alt="image.title" class="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <span v-else class="text-4xl">{{ image.emoji }}</span>
              </div>
              <div class="p-2">
                <p class="text-xs font-medium truncate" style="color: var(--color-text);">{{ image.title }}</p>
                <p class="text-caption mt-0.5">{{ image.date }}</p>
              </div>
              <div v-if="canEdit" class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                <button @click.stop="openImageModal(image)" class="p-1.5 rounded-lg bg-black/50 text-gray-600 hover:text-primary-500 transition-colors shadow-sm" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click.stop="deleteGalleryImage(image.id)" class="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-sm" title="删除">
                  <Icon name="solar:trash-bin-trash-linear" size="xs" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedGroupId !== null" class="mt-8 text-center">
            <button @click="selectedGroupId = null" class="text-primary-500 hover:text-primary-600 font-medium text-sm inline-flex items-center gap-1.5 transition-colors">
              <Icon name="solar:alt-arrow-left-linear" size="xs" /> 返回全部分组
            </button>
          </div>
        </div>

        <!-- ==================== 视听分享 Tab ==================== -->
        <div v-if="activeTab === 'audiovisual'">
          <!-- 电影 Section -->
          <div class="mb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="solar:videocamera-record-bold-duotone" size="md" class="text-cyber-teal" /> 电影推荐
              </h2>
              <button v-if="canEdit" @click="openMovieEditor(null)" class="btn-primary text-sm">
                <Icon name="solar:add-circle-linear" size="xs" class="mr-1" /> 添加电影
              </button>
            </div>
            <div v-if="movies.length === 0" class="text-center py-12 text-sub">
              <Icon name="solar:videocamera-record-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
              <p class="text-sub text-sm">还没有电影推荐</p>
              <p v-if="canEdit" class="text-caption mt-3">点击右上角"添加电影"按钮推荐好片</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div v-for="movie in movies" :key="movie.id" class="glass-card !p-5 group relative animate-fade-in">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">{{ movie.genre }}</span>
                    <span class="text-xs text-sub">{{ movie.year }}</span>
                  </div>
                  <div class="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
                    <span class="text-yellow-500 text-xs">★</span>
                    <span class="text-sm font-bold text-yellow-600 dark:text-yellow-400">{{ movie.rating }}</span>
                  </div>
                </div>
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-text);">{{ movie.title }}</h3>
                <p class="text-xs text-sub mb-2">导演: {{ movie.director }}</p>
                <p class="text-sm text-sub line-clamp-2 mb-3">{{ movie.review }}</p>
                <a v-if="movie.link" :href="movie.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs hover:underline mb-2" style="color: var(--color-primary);">
                  <Icon name="solar:link-round-bold" size="xs" /> 豆瓣/详情
                </a>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in movie.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-white/5 text-sub">{{ tag }}</span>
                </div>
                <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                  <button @click="openMovieEditor(movie)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                    <Icon name="solar:pen-linear" size="xs" />
                  </button>
                  <button @click="deleteMovie(movie.id)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                    <Icon name="solar:trash-bin-trash-linear" size="xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 音乐 Section -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="solar:music-notes-bold-duotone" size="md" class="text-purple-400" /> 音乐分享
              </h2>
              <button v-if="canEdit" @click="openMusicEditor(null)" class="btn-primary text-sm">
                <Icon name="solar:add-circle-linear" size="xs" class="mr-1" /> 添加音乐
              </button>
            </div>
            <div v-if="musicList.length === 0" class="text-center py-12 text-sub">
              <Icon name="solar:music-notes-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
              <p class="text-sub text-sm">还没有音乐分享</p>
              <p v-if="canEdit" class="text-caption mt-3">点击右上角"添加音乐"按钮分享好歌</p>
            </div>
            <div v-else class="max-w-3xl mx-auto space-y-3">
              <div v-for="track in musicList" :key="track.id" class="glass-card !p-4 group relative animate-fade-in">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-pink-400/20 to-purple-400/20 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🎶
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold truncate" style="color: var(--color-text);">{{ track.title }}</h3>
                    <p class="text-sm text-sub">{{ track.artist }} · {{ track.genre }} · {{ track.duration }}</p>
                    <p class="text-sm text-sub mt-1 line-clamp-1">{{ track.review }}</p>
                    <a v-if="track.link" :href="track.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs hover:underline mt-1" style="color: var(--color-primary);">
                      <Icon name="solar:link-round-bold" size="xs" /> 试听链接
                    </a>
                  </div>
                  <div class="flex flex-wrap gap-1 hidden sm:flex">
                    <span v-for="tag in track.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-white/5 text-sub">{{ tag }}</span>
                  </div>
                </div>
                <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                  <button @click="openMusicEditor(track)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                    <Icon name="solar:pen-linear" size="xs" />
                  </button>
                  <button @click="deleteMusic(track.id)" class="p-1.5 rounded-lg bg-black/45 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                    <Icon name="solar:trash-bin-trash-linear" size="xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ==================== 通用编辑弹窗 ==================== -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeModal">
        <div class="glass-panel p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-5">{{ modalTitle }}</h2>
          <div class="space-y-4">
            <!-- Dynamic fields rendered by modalFields -->
            <div v-for="field in modalFields" :key="field.key">
              <label class="block text-xs font-medium text-sub mb-1">{{ field.label }}</label>
              <input
                v-if="field.type !== 'textarea' && field.type !== 'tags'"
                v-model="modalForm[field.key]"
                :type="field.type || 'text'"
                class="input-field w-full"
                :placeholder="field.placeholder || ''"
              />
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="modalForm[field.key]"
                class="input-field w-full !h-24 resize-none"
                :placeholder="field.placeholder || ''"
              />
              <!-- Tags input -->
              <div v-else-if="field.type === 'tags'" class="flex flex-wrap items-center gap-1.5 input-field min-h-[38px] cursor-text" @click="($refs.tagsInput as HTMLInputElement)?.focus()">
                <span v-for="(tag, i) in parsedTags" :key="i" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs">
                  {{ tag }}
                  <button @click="removeTag(i)" class="hover:text-red-400">&times;</button>
                </span>
                <input
                  ref="tagsInput"
                  v-model="tagInput"
                  class="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-gray-300"
                  placeholder="输入后按回车"
                  @keydown.enter.prevent="addTag"
                />
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="saveModal" class="btn-primary flex-1" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
            <button @click="closeModal" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 图片上传弹窗 ==================== -->
    <Teleport to="body">
      <div v-if="showImageModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeImageModal">
        <div class="glass-panel p-6 max-w-lg w-full animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-5">{{ editingImage ? '编辑图片' : '上传图片' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-sub mb-1">图片标题</label>
              <input v-model="imageForm.title" class="input-field w-full" placeholder="请输入图片标题" />
            </div>
            <div>
              <label class="block text-xs font-medium text-sub mb-1">所属分组</label>
              <select v-model="imageForm.groupId" class="input-field w-full">
                <option v-for="g in sortedGroups" :key="g.id" :value="g.id">{{ g.emoji }} {{ g.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-sub mb-1">图片</label>
              <div class="border-2 border-dashed border-white/8 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer" @click="($refs.fileInput as HTMLInputElement)?.click()">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageFile" />
                <div v-if="!imageForm.imageUrl && !imagePreviewUrl" class="text-sub">
                  <Icon name="solar:gallery-add-bold-duotone" size="lg" color="#a5b4c8" class="mb-2" />
                  <p class="text-sm">点击上传图片</p>
                  <p class="text-xs mt-1">支持 JPG, PNG, GIF</p>
                </div>
                <img v-else :src="imagePreviewUrl || imageForm.imageUrl" alt="预览" class="max-h-48 mx-auto rounded-lg" />
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="saveGalleryImage" class="btn-primary flex-1" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
            <button @click="closeImageModal" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 分组管理弹窗 ==================== -->
    <Teleport to="body">
      <div v-if="showGroupModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeGroupModal">
        <div class="glass-panel p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-5">管理分组</h2>
          <div class="space-y-3 mb-6">
            <div v-for="(group, i) in editingGroupsData" :key="group.id" class="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
              <input v-model="group.emoji" class="w-10 text-center input-field !py-1" placeholder="图标" />
              <input v-model="group.name" class="flex-1 input-field !py-1" placeholder="分组名称" />
              <input v-model="group.description" class="flex-1 input-field !py-1" placeholder="描述" />
              <input v-model.number="group.order" type="number" class="w-14 text-center input-field !py-1" placeholder="排序" />
              <button @click="editingGroupsData.splice(i, 1)" class="p-1.5 text-sub hover:text-red-500 transition-colors">
                <Icon name="solar:trash-bin-trash-linear" size="xs" />
              </button>
            </div>
          </div>
          <button @click="addNewGroup" class="w-full py-3 border-2 border-dashed border-white/8 rounded-xl text-sub hover:border-primary-400 hover:text-primary-500 transition-colors text-sm">
            + 添加分组
          </button>
          <div class="flex gap-3 mt-6">
            <button @click="saveGroups" class="btn-primary flex-1" :disabled="saving">{{ saving ? '保存中...' : '保存分组' }}</button>
            <button @click="closeGroupModal" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Gallery Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightbox" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" @click="lightbox = null">
          <img :src="lightbox.imageUrl" class="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" @click.stop />
          <button @click="lightbox = null" class="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import { markRaw } from 'vue'
import { contentAPI, uploadAPI, collectionAPI } from '@/utils/apiClient'
import { useAuthStore } from '@/stores/auth'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'
import Icon from '@/components/ui/Icon.vue'

const authStore = useAuthStore()
const canEdit = computed(() => authStore.canEdit)
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('gallery')
const lightbox = ref<any>(null)
const coverImage = ref('')

// Tab definitions
const tabs = [
  { id: 'gallery', name: '美图', icon: 'solar:gallery-wide-bold-duotone' },
  { id: 'diary', name: '日记', icon: 'solar:bookmark-bold-duotone' },
  { id: 'novel', name: '创作', icon: 'solar:book-2-bold-duotone' },
  { id: 'books', name: '书单', icon: 'solar:library-bold-duotone' },
  { id: 'audiovisual', name: '视听', icon: 'solar:videocamera-record-bold-duotone' },
]

// ─── Data ───
const diaries = ref<any[]>([])
const novels = ref<any[]>([])
const books = ref<any[]>([])
const galleryImages = shallowRef<any[]>([])
const galleryGroups = shallowRef<any[]>([])
const movies = ref<any[]>([])
const musicList = ref<any[]>([])
const selectedGroupId = ref<string | null>(null)

// ─── Library data for 创作 tab ───
const libCollections = shallowRef<any[]>([])
const libLoading = ref(true)

// ─── Generic Modal ───
const showModal = ref(false)
const modalTitle = ref('')
const modalForm = ref<Record<string, any>>({})
const modalFields = ref<any[]>([])
const modalSaveFn = ref<((form: any) => Promise<void>) | null>(null)
const tagInput = ref('')

const parsedTags = computed(() => {
  const v = modalForm.value.tags
  if (Array.isArray(v)) return v
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
})

const addTag = () => {
  const t = tagInput.value.trim()
  if (!t) return
  const tags = Array.isArray(modalForm.value.tags) ? [...modalForm.value.tags] : (typeof modalForm.value.tags === 'string' ? modalForm.value.tags.split(',').map(s => s.trim()).filter(Boolean) : [])
  if (!tags.includes(t)) tags.push(t)
  modalForm.value.tags = tags
  tagInput.value = ''
}

const removeTag = (i: number) => {
  const tags = [...parsedTags.value]
  tags.splice(i, 1)
  modalForm.value.tags = tags
}

const openGenericModal = (title: string, fields: any[], formData: Record<string, any>, saveFn: (form: any) => Promise<void>) => {
  modalTitle.value = title
  modalFields.value = fields
  modalForm.value = { ...formData }
  modalSaveFn.value = saveFn
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalForm.value = {}
  modalFields.value = []
  modalSaveFn.value = null
  tagInput.value = ''
}

const saveModal = async () => {
  if (!modalSaveFn.value) return
  saving.value = true
  try {
    await modalSaveFn.value({ ...modalForm.value })
    closeModal()
  } catch (e: any) {
    alert(e.error || '保存失败')
  }
  finally { saving.value = false }
}

// ─── Helper: save array content to backend ───
const saveSectionContent = async (contentId: string, data: any[]) => {
  const payload = {
    id: contentId,
    type: 'array',
    title: modalTitle.value || '文化区内容',
    content: JSON.stringify(data),
    page: 'culture',
    section: contentId.replace('culture-', '').replace('gallery-', 'gallery-'),
  }
  try {
    await contentAPI.updateContent(contentId, payload)
  } catch {
    await contentAPI.createContent(payload)
  }
}

// ─── Diary CRUD ───
const openDiaryEditor = (entry: any | null) => {
  openGenericModal(
    entry ? '编辑日记' : '写日记',
    [
      { key: 'date', label: '日期', type: 'date' },
      { key: 'weather', label: '天气', placeholder: '如: ☀️ 晴' },
      { key: 'title', label: '标题' },
      { key: 'content', label: '内容', type: 'textarea' },
      { key: 'link', label: '相关链接', placeholder: 'https://...' },
    ],
    entry ? { ...entry } : { id: Date.now(), date: new Date().toISOString().split('T')[0], weather: '', title: '', content: '', link: '' },
    async (form) => {
      if (form.id && diaries.value.find((d: any) => d.id === form.id)) {
        const idx = diaries.value.findIndex((d: any) => d.id === form.id)
        diaries.value[idx] = form
      } else {
        form.id = form.id || Date.now()
        diaries.value.unshift(form)
      }
      await saveSectionContent('culture-diary', diaries.value)
    }
  )
}

const deleteDiaryEntry = async (id: number) => {
  if (!confirm('确定删除这篇日记？')) return
  diaries.value = diaries.value.filter((d: any) => d.id !== id)
  try { await saveSectionContent('culture-diary', diaries.value) } catch { alert('删除失败') }
}

// ─── Novel CRUD ───
const openNovelEditor = (novel: any | null) => {
  openGenericModal(
    novel ? '编辑小说' : '添加小说',
    [
      { key: 'title', label: '标题' },
      { key: 'description', label: '简介', type: 'textarea' },
      { key: 'status', label: '状态', placeholder: '连载中 / 已完成' },
      { key: 'chapters', label: '章节数', type: 'number' },
    ],
    novel ? { ...novel } : { id: Date.now(), title: '', description: '', status: '连载中', chapters: 0 },
    async (form) => {
      form.chapters = Number(form.chapters) || 0
      if (novels.value.find((n: any) => n.id === form.id)) {
        const idx = novels.value.findIndex((n: any) => n.id === form.id)
        novels.value[idx] = form
      } else {
        form.id = form.id || Date.now()
        novels.value.unshift(form)
      }
      await saveSectionContent('culture-novels', novels.value)
    }
  )
}

const deleteNovel = async (id: number) => {
  if (!confirm('确定删除？')) return
  novels.value = novels.value.filter((n: any) => n.id !== id)
  try { await saveSectionContent('culture-novels', novels.value) } catch { alert('删除失败') }
}

// ─── Book CRUD ───
const openBookEditor = (book: any | null) => {
  openGenericModal(
    book ? '编辑书籍' : '添加书籍',
    [
      { key: 'title', label: '书名' },
      { key: 'author', label: '作者' },
      { key: 'review', label: '书评', type: 'textarea' },
      { key: 'link', label: '链接', placeholder: '购买/豆瓣链接...' },
      { key: 'tags', label: '标签', type: 'tags', placeholder: '输入后按回车' },
    ],
    book ? { ...book } : { id: Date.now(), title: '', author: '', review: '', link: '', tags: [] },
    async (form) => {
      if (books.value.find((b: any) => b.id === form.id)) {
        const idx = books.value.findIndex((b: any) => b.id === form.id)
        books.value[idx] = form
      } else {
        form.id = form.id || Date.now()
        books.value.unshift(form)
      }
      await saveSectionContent('culture-books', books.value)
    }
  )
}

const deleteBook = async (id: number) => {
  if (!confirm('确定删除？')) return
  books.value = books.value.filter((b: any) => b.id !== id)
  try { await saveSectionContent('culture-books', books.value) } catch { alert('删除失败') }
}

// ─── Movie CRUD ───
const openMovieEditor = (movie: any | null) => {
  openGenericModal(
    movie ? '编辑电影' : '添加电影',
    [
      { key: 'title', label: '电影名' },
      { key: 'year', label: '年份', type: 'number' },
      { key: 'director', label: '导演' },
      { key: 'rating', label: '评分', type: 'number', placeholder: '9.0' },
      { key: 'genre', label: '类型', placeholder: '科幻/动画/剧情' },
      { key: 'review', label: '影评', type: 'textarea' },
      { key: 'link', label: '链接', placeholder: '豆瓣/IMDb...' },
      { key: 'tags', label: '标签', type: 'tags' },
    ],
    movie ? { ...movie } : { id: Date.now(), title: '', year: new Date().getFullYear(), director: '', rating: 0, genre: '', review: '', link: '', tags: [] },
    async (form) => {
      form.year = Number(form.year) || new Date().getFullYear()
      form.rating = Number(form.rating) || 0
      if (movies.value.find((m: any) => m.id === form.id)) {
        const idx = movies.value.findIndex((m: any) => m.id === form.id)
        movies.value[idx] = form
      } else {
        form.id = form.id || Date.now()
        movies.value.unshift(form)
      }
      await saveSectionContent('culture-movies', movies.value)
    }
  )
}

const deleteMovie = async (id: number) => {
  if (!confirm('确定删除？')) return
  movies.value = movies.value.filter((m: any) => m.id !== id)
  try { await saveSectionContent('culture-movies', movies.value) } catch { alert('删除失败') }
}

// ─── Music CRUD ───
const openMusicEditor = (track: any | null) => {
  openGenericModal(
    track ? '编辑音乐' : '添加音乐',
    [
      { key: 'title', label: '歌曲名' },
      { key: 'artist', label: '艺术家' },
      { key: 'genre', label: '类型' },
      { key: 'duration', label: '时长', placeholder: '3:12' },
      { key: 'review', label: '评价', type: 'textarea' },
      { key: 'link', label: '链接', placeholder: '网易云/QQ音乐...' },
      { key: 'tags', label: '标签', type: 'tags' },
    ],
    track ? { ...track } : { id: Date.now(), title: '', artist: '', genre: '', duration: '', review: '', link: '', tags: [] },
    async (form) => {
      if (musicList.value.find((m: any) => m.id === form.id)) {
        const idx = musicList.value.findIndex((m: any) => m.id === form.id)
        musicList.value[idx] = form
      } else {
        form.id = form.id || Date.now()
        musicList.value.unshift(form)
      }
      await saveSectionContent('culture-music', musicList.value)
    }
  )
}

const deleteMusic = async (id: number) => {
  if (!confirm('确定删除？')) return
  musicList.value = musicList.value.filter((m: any) => m.id !== id)
  try { await saveSectionContent('culture-music', musicList.value) } catch { alert('删除失败') }
}

// ─── Gallery ───
const sortedGroups = computed(() => [...galleryGroups.value].sort((a, b) => a.order - b.order))
const filteredImages = computed(() => {
  if (!selectedGroupId.value) return galleryImages.value
  return galleryImages.value.filter((img: any) => img.groupId === selectedGroupId.value)
})

const getGroupImageCount = (groupId: string) => galleryImages.value.filter((img: any) => img.groupId === groupId).length
const getGroupCoverImage = (groupId: string) => {
  const imgs = galleryImages.value.filter((img: any) => img.groupId === groupId && img.imageUrl)
  return imgs.length > 0 ? imgs[0] : null
}

// Image modal
const showImageModal = ref(false)
const editingImage = ref<any>(null)
const imageForm = ref({ title: '', groupId: '', imageUrl: '' })
const imagePreviewUrl = ref('')
const imageFile = ref<File | null>(null)

const openImageModal = (image: any | null) => {
  editingImage.value = image
  imageFile.value = null
  if (image) {
    imageForm.value = { title: image.title, groupId: image.groupId || (sortedGroups.value[0]?.id || ''), imageUrl: image.imageUrl || '' }
  } else {
    imageForm.value = { title: '', groupId: selectedGroupId.value || (sortedGroups.value[0]?.id || ''), imageUrl: '' }
  }
  imagePreviewUrl.value = ''
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  editingImage.value = null
  imagePreviewUrl.value = ''
  imageFile.value = null
}

const handleImageFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
  imageFile.value = markRaw(file)
  const reader = new FileReader()
  reader.onload = (ev) => { imagePreviewUrl.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

const saveGalleryImage = async () => {
  if (!imageForm.value.title.trim()) { alert('请输入图片标题'); return }
  saving.value = true
  try {
    let finalImageUrl = imageForm.value.imageUrl

    // If new image was selected, upload to server
    if (imageFile.value) {
      try {
        const uploadRes = await uploadAPI.uploadFile(imageFile.value, { isPublic: true })
        finalImageUrl = uploadRes.file?.url || uploadRes.file?.path || ''
      } catch (uploadErr: any) {
        alert('图片上传失败: ' + (uploadErr.error || uploadErr.message || '未知错误'))
        saving.value = false
        return
      }
    }

    const newImg = {
      id: editingImage.value ? editingImage.value.id : Date.now(),
      title: imageForm.value.title,
      date: editingImage.value ? editingImage.value.date : new Date().toISOString().split('T')[0],
      emoji: finalImageUrl ? '' : '🖼️',
      imageUrl: finalImageUrl || null,
      groupId: imageForm.value.groupId,
    }

    if (editingImage.value) {
      const idx = galleryImages.value.findIndex((img: any) => img.id === editingImage.value.id)
      if (idx >= 0) galleryImages.value.splice(idx, 1, newImg)
    } else {
      galleryImages.value.unshift(newImg)
    }

    try {
      await saveSectionContent('culture-gallery', galleryImages.value)
    } catch (saveErr: any) {
      alert('保存内容失败: ' + (saveErr.error || saveErr.message || '未知错误'))
      saving.value = false
      return
    }

    closeImageModal()
  } catch (e: any) {
    alert('保存失败: ' + (e.error || e.message || '未知错误'))
  }
  finally { saving.value = false }
}

const deleteGalleryImage = async (id: number) => {
  if (!confirm('确定删除这张图片？')) return
  galleryImages.value = galleryImages.value.filter((img: any) => img.id !== id)
  try { await saveSectionContent('culture-gallery', galleryImages.value) } catch { alert('删除失败') }
}

// Group modal
const showGroupModal = ref(false)
const editingGroupsData = ref<any[]>([])

const openGroupModal = () => {
  editingGroupsData.value = JSON.parse(JSON.stringify(galleryGroups.value))
  showGroupModal.value = true
}

const closeGroupModal = () => { showGroupModal.value = false; editingGroupsData.value = [] }

const addNewGroup = () => {
  editingGroupsData.value.push({
    id: 'group-' + Date.now(),
    name: '',
    emoji: '📁',
    description: '',
    order: editingGroupsData.value.length + 1,
  })
}

const saveGroups = async () => {
  const invalid = editingGroupsData.value.find((g: any) => !g.name.trim())
  if (invalid) { alert('请填写所有分组名称'); return }
  saving.value = true
  try {
    galleryGroups.value = [...editingGroupsData.value]
    await saveSectionContent('gallery-groups', galleryGroups.value)
    closeGroupModal()
  } catch (e: any) {
    alert(e.error || '保存失败')
  }
  finally { saving.value = false }
}

// ─── Load Data ───
const loadCultureData = async () => {
  loading.value = true
  try {
    const res = await contentAPI.getPageContents('culture')
    const sections = res.sections || {}

    const parse = (key: string): any[] => {
      const items = sections[key]
      if (!items || items.length === 0) return []
      const raw = items[0].content
      if (Array.isArray(raw)) return raw
      if (typeof raw === 'string') {
        try { return JSON.parse(raw) } catch { return [] }
      }
      return []
    }

    diaries.value = parse('diary')
    novels.value = parse('novels')
    books.value = parse('books')
    galleryImages.value = parse('gallery')
    galleryGroups.value = parse('gallery-groups')
    movies.value = parse('movies')
    musicList.value = parse('music')
  } catch (e) {
    console.error('加载文化区失败:', e)
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  coverImage.value = await fetchCoverImage('gallery')

  await loadCultureData()
  // Load library collections for 创作 tab
  try {
    const res = await collectionAPI.getAll({ type: 'book_group' })
    libCollections.value = res.collections || []
  } catch { libCollections.value = [] }
  finally { libLoading.value = false }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.gallery-masonry {
  column-count: 2;
  column-gap: 0.75rem;
}
@media (min-width: 768px) { .gallery-masonry { column-count: 3; } }
@media (min-width: 1024px) { .gallery-masonry { column-count: 4; } }

.gallery-card {
  break-inside: avoid;
  margin-bottom: 0.75rem;
}
.gallery-img-wrap {
  background: var(--color-surface);
  display: flex; align-items: center; justify-content: center;
  min-height: 80px;
}
.gallery-img-wrap img {
  display: block;
}
.gallery-group-cover {
  background: linear-gradient(135deg, var(--color-surface), var(--color-surface-dim));
}

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.3s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
