<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <!-- Page Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          <span class="text-gradient">文化区</span>
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          生活日记、原创小说、书单推荐、美图收藏、视听分享
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center justify-center gap-1 mb-10 animate-slide-up">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            activeTab === tab.id
              ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <span>{{ tab.icon }}</span>
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
          <div v-if="diaries.length === 0" class="text-center py-20 text-gray-400">
            <Icon name="solar:notebook-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
            <p>还没有日记，开始记录生活吧</p>
          </div>
          <div v-else class="max-w-3xl mx-auto space-y-6">
            <div v-for="entry in diaries" :key="entry.id" class="glass-card !p-6 group relative animate-fade-in">
              <div class="flex items-center gap-3 text-sm text-gray-400 mb-3">
                <Icon name="solar:calendar-bold-duotone" size="xs" />
                <span>{{ entry.date }}</span>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <span>{{ entry.weather }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ entry.title }}</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{{ entry.content }}</p>
              <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                <button @click="openDiaryEditor(entry)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click="deleteDiaryEntry(entry.id)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                  <Icon name="solar:trash-bin-trash-linear" size="xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 小说 Tab ==================== -->
        <div v-if="activeTab === 'novel'">
          <div v-if="canEdit" class="flex justify-end mb-6">
            <button @click="openNovelEditor(null)" class="btn-primary text-sm">
              <Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" /> 添加小说
            </button>
          </div>
          <div v-if="novels.length === 0" class="text-center py-20 text-gray-400">
            <Icon name="solar:book-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
            <p>还没有小说，开始创作吧</p>
          </div>
          <div v-else class="max-w-4xl mx-auto space-y-6">
            <div v-for="novel in novels" :key="novel.id" class="glass-card !p-6 group relative animate-fade-in">
              <div class="flex items-start gap-5">
                <div class="w-20 h-28 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                  📖
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">{{ novel.title }}</h3>
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', novel.status === '连载中' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400']">
                      {{ novel.status }}
                    </span>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ novel.description }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-400">
                    <span class="flex items-center gap-1"><Icon name="solar:document-text-linear" size="xs" /> {{ novel.chapters }} 章节</span>
                  </div>
                </div>
              </div>
              <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                <button @click="openNovelEditor(novel)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click="deleteNovel(novel.id)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                  <Icon name="solar:trash-bin-trash-linear" size="xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 书单 Tab ==================== -->
        <div v-if="activeTab === 'books'">
          <div v-if="canEdit" class="flex justify-end mb-6">
            <button @click="openBookEditor(null)" class="btn-primary text-sm">
              <Icon name="solar:pen-new-round-linear" size="xs" class="mr-1" /> 添加书籍
            </button>
          </div>
          <div v-if="books.length === 0" class="text-center py-20 text-gray-400">
            <Icon name="solar:library-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
            <p>还没有书单，分享你的阅读吧</p>
          </div>
          <div v-else class="max-w-4xl mx-auto space-y-6">
            <div v-for="book in books" :key="book.id" class="glass-card !p-6 group relative animate-fade-in">
              <div class="flex items-start gap-5">
                <div class="w-16 h-24 bg-gradient-to-br from-secondary-400/20 to-primary-400/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                  📚
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ book.title }}</h3>
                  <p class="text-sm text-gray-400 mb-2">{{ book.author }}</p>
                  <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">{{ book.review }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="tag in book.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                <button @click="openBookEditor(book)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                  <Icon name="solar:pen-linear" size="xs" />
                </button>
                <button @click="deleteBook(book.id)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 transition-colors" title="删除">
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
              :class="['px-4 py-2 rounded-full text-sm transition-all duration-200', selectedGroupId === null ? 'bg-primary-500 text-white shadow-sm' : 'bg-white/60 dark:bg-gray-800/60 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700']"
            >全部</button>
            <button
              v-for="group in sortedGroups"
              :key="group.id"
              @click="selectedGroupId = group.id"
              :class="['px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5', selectedGroupId === group.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white/60 dark:bg-gray-800/60 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700']"
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
              <div class="aspect-video bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/20 dark:to-secondary-900/20 overflow-hidden flex items-center justify-center relative">
                <img v-if="getGroupCoverImage(group.id)" :src="getGroupCoverImage(group.id)!.imageUrl" :alt="group.name" class="w-full h-full object-cover group-card-hover:scale-105 transition-transform duration-500" />
                <span v-else class="text-5xl">{{ group.emoji }}</span>
                <div class="absolute inset-0 bg-black/0 group-card-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div class="p-4 flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white">{{ group.name }}</h3>
                  <p class="text-xs text-gray-400 mt-0.5">{{ group.description }}</p>
                </div>
                <span class="text-xs text-gray-400 font-medium">{{ getGroupImageCount(group.id) }} 张</span>
              </div>
            </div>
          </div>

          <!-- Image grid (group selected or no groups) -->
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="image in filteredImages" :key="image.id" class="glass-card !p-0 overflow-hidden group relative animate-fade-in">
              <div class="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 overflow-hidden flex items-center justify-center">
                <img v-if="image.imageUrl" :src="image.imageUrl" :alt="image.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span v-else class="text-4xl">{{ image.emoji }}</span>
              </div>
              <div class="p-3">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ image.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ image.date }}</p>
              </div>
              <div v-if="canEdit" class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                <button @click.stop="openImageModal(image)" class="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-600 hover:text-primary-500 transition-colors shadow-sm" title="编辑">
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
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎬</span> 电影推荐
              </h2>
              <button v-if="canEdit" @click="openMovieEditor(null)" class="btn-primary text-sm">
                <Icon name="solar:add-circle-linear" size="xs" class="mr-1" /> 添加电影
              </button>
            </div>
            <div v-if="movies.length === 0" class="text-center py-12 text-gray-400">
              <p>还没有电影推荐</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div v-for="movie in movies" :key="movie.id" class="glass-card !p-5 group relative animate-fade-in">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">{{ movie.genre }}</span>
                    <span class="text-xs text-gray-400">{{ movie.year }}</span>
                  </div>
                  <div class="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
                    <span class="text-yellow-500 text-xs">★</span>
                    <span class="text-sm font-bold text-yellow-600 dark:text-yellow-400">{{ movie.rating }}</span>
                  </div>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ movie.title }}</h3>
                <p class="text-xs text-gray-400 mb-2">导演: {{ movie.director }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{{ movie.review }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in movie.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{{ tag }}</span>
                </div>
                <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                  <button @click="openMovieEditor(movie)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                    <Icon name="solar:pen-linear" size="xs" />
                  </button>
                  <button @click="deleteMovie(movie.id)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 transition-colors" title="删除">
                    <Icon name="solar:trash-bin-trash-linear" size="xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 音乐 Section -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎵</span> 音乐分享
              </h2>
              <button v-if="canEdit" @click="openMusicEditor(null)" class="btn-primary text-sm">
                <Icon name="solar:add-circle-linear" size="xs" class="mr-1" /> 添加音乐
              </button>
            </div>
            <div v-if="musicList.length === 0" class="text-center py-12 text-gray-400">
              <p>还没有音乐分享</p>
            </div>
            <div v-else class="max-w-3xl mx-auto space-y-3">
              <div v-for="track in musicList" :key="track.id" class="glass-card !p-4 group relative animate-fade-in">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-pink-400/20 to-purple-400/20 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🎶
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate">{{ track.title }}</h3>
                    <p class="text-sm text-gray-400">{{ track.artist }} · {{ track.genre }} · {{ track.duration }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ track.review }}</p>
                  </div>
                  <div class="flex flex-wrap gap-1 hidden sm:flex">
                    <span v-for="tag in track.tags" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{{ tag }}</span>
                  </div>
                </div>
                <div v-if="canEdit" class="absolute top-4 right-4 hidden group-hover:flex items-center gap-1">
                  <button @click="openMusicEditor(track)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-primary-500 transition-colors" title="编辑">
                    <Icon name="solar:pen-linear" size="xs" />
                  </button>
                  <button @click="deleteMusic(track.id)" class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 transition-colors" title="删除">
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
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-5">{{ modalTitle }}</h2>
          <div class="space-y-4">
            <!-- Dynamic fields rendered by modalFields -->
            <div v-for="field in modalFields" :key="field.key">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ field.label }}</label>
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
                  class="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300"
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
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-5">{{ editingImage ? '编辑图片' : '上传图片' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">图片标题</label>
              <input v-model="imageForm.title" class="input-field w-full" placeholder="请输入图片标题" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">所属分组</label>
              <select v-model="imageForm.groupId" class="input-field w-full">
                <option v-for="g in sortedGroups" :key="g.id" :value="g.id">{{ g.emoji }} {{ g.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">图片</label>
              <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer" @click="($refs.fileInput as HTMLInputElement)?.click()">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageFile" />
                <div v-if="!imageForm.imageUrl && !imagePreviewUrl" class="text-gray-400">
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
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-5">管理分组</h2>
          <div class="space-y-3 mb-6">
            <div v-for="(group, i) in editingGroupsData" :key="group.id" class="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
              <input v-model="group.emoji" class="w-10 text-center input-field !py-1" placeholder="图标" />
              <input v-model="group.name" class="flex-1 input-field !py-1" placeholder="分组名称" />
              <input v-model="group.description" class="flex-1 input-field !py-1" placeholder="描述" />
              <input v-model.number="group.order" type="number" class="w-14 text-center input-field !py-1" placeholder="排序" />
              <button @click="editingGroupsData.splice(i, 1)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Icon name="solar:trash-bin-trash-linear" size="xs" />
              </button>
            </div>
          </div>
          <button @click="addNewGroup" class="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors text-sm">
            + 添加分组
          </button>
          <div class="flex gap-3 mt-6">
            <button @click="saveGroups" class="btn-primary flex-1" :disabled="saving">{{ saving ? '保存中...' : '保存分组' }}</button>
            <button @click="closeGroupModal" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { contentAPI, uploadAPI } from '@/utils/apiClient'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

const authStore = useAuthStore()
const canEdit = computed(() => authStore.canEdit)
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('diary')

// Tab definitions
const tabs = [
  { id: 'diary', name: '日记', icon: '📓' },
  { id: 'novel', name: '小说', icon: '📖' },
  { id: 'books', name: '书单', icon: '📚' },
  { id: 'gallery', name: '美图', icon: '🖼️' },
  { id: 'audiovisual', name: '视听', icon: '🎬' },
]

// ─── Data ───
const diaries = ref<any[]>([])
const novels = ref<any[]>([])
const books = ref<any[]>([])
const galleryImages = ref<any[]>([])
const galleryGroups = ref<any[]>([])
const movies = ref<any[]>([])
const musicList = ref<any[]>([])
const selectedGroupId = ref<string | null>(null)

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
  await contentAPI.updateContent(contentId, {
    id: contentId,
    type: 'array',
    title: modalTitle.value,
    content: JSON.stringify(data),
    page: 'culture',
    section: contentId.replace('culture-', '').replace('gallery-', 'gallery-'),
  })
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
    ],
    entry ? { ...entry } : { id: Date.now(), date: new Date().toISOString().split('T')[0], weather: '', title: '', content: '' },
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
      { key: 'tags', label: '标签', type: 'tags', placeholder: '输入后按回车' },
    ],
    book ? { ...book } : { id: Date.now(), title: '', author: '', review: '', tags: [] },
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
      { key: 'tags', label: '标签', type: 'tags' },
    ],
    movie ? { ...movie } : { id: Date.now(), title: '', year: new Date().getFullYear(), director: '', rating: 0, genre: '', review: '', tags: [] },
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
      { key: 'tags', label: '标签', type: 'tags' },
    ],
    track ? { ...track } : { id: Date.now(), title: '', artist: '', genre: '', duration: '', review: '', tags: [] },
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

const openImageModal = (image: any | null) => {
  editingImage.value = image
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
}

const handleImageFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
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
    if (imagePreviewUrl.value && !imageForm.value.imageUrl) {
      const res = await fetch(imagePreviewUrl.value)
      const blob = await res.blob()
      const file = new File([blob], `${imageForm.value.title}.jpg`, { type: blob.type })
      const uploadRes = await uploadAPI.uploadFile(file, { isPublic: true })
      finalImageUrl = uploadRes.file?.url || uploadRes.file?.path || ''
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
      if (idx >= 0) galleryImages.value[idx] = newImg
    } else {
      galleryImages.value.unshift(newImg)
    }

    await saveSectionContent('culture-gallery', galleryImages.value)
    closeImageModal()
  } catch (e: any) {
    alert(e.error || '保存失败')
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

onMounted(loadCultureData)
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
