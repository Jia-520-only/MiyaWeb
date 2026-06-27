<template>
  <div class="game-hub">
    <!-- Left Panel -->
    <div class="left-panel">
      <!-- User Info -->
      <div class="user-info">
        <div class="level-block">
          <div class="flex items-baseline gap-1">
            <span class="level-label">Lv.</span>
            <span class="level-num">{{ userLevel }}</span>
          </div>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
        </div>
        <div class="name-block">
          <span class="name-text">{{ displayName }}</span>
          <span class="name-id">{{ authStore.user?.email || '访客模式' }}</span>
        </div>
      </div>

      <!-- Center: Controls + Nav -->
      <div class="center-section">
        <!-- Navigation Buttons -->
        <div class="nav-grid">
          <div v-for="nav in navigations" :key="nav.title" class="nav-btn" @click="$router.push(nav.link)">
            <span class="nav-title">{{ nav.title }}</span>
            <span class="nav-sub">{{ nav.sub }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom: Banner + Activity -->
      <div class="bottom-section">
        <!-- Banner Carousel -->
        <div class="banner-box">
          <div class="banner-track">
            <div class="banner-item" v-for="(b, i) in banners" :key="i">
              <div class="banner-inner" :style="{ background: b.bg }">
                <span class="banner-text">{{ b.text }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Activity Feed -->
        <div class="activity-box">
          <div class="activity-icon">💬</div>
          <div class="activity-text">
            <span class="activity-marquee">— Miya: {{ currentQuote }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon">{{ stat.icon }}</div>
          <span class="stat-value">{{ stat.value }}</span>
          <div class="stat-add">+</div>
        </div>
      </div>

      <!-- Center Content -->
      <div class="center-content">
        <!-- Top Status -->
        <div class="top-status">
          <span class="status-time">{{ currentTime }}</span>
        </div>

        <!-- Featured Card (Miya Character) -->
        <div class="featured-card" @click="$router.push('/about-miya')">
          <div class="featured-avatar">
            <div class="mask-sweep"></div>
            <div class="avatar-img">
              <span class="text-4xl">✨</span>
            </div>
          </div>
          <div class="featured-info">
            <div class="featured-left">
              <h3 class="featured-title">Miya 管家</h3>
              <span class="featured-tag">在线·陪伴</span>
              <span class="featured-status text-blue-400">状态: 活跃</span>
            </div>
            <div class="featured-right">
              <span class="featured-pct">24/7</span>
              <span class="text-xs text-gray-500">守护中</span>
            </div>
          </div>
          <div class="featured-mascot">
            <span class="text-lg">🐱</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="action-card" @click="$router.push('/library')">
            <h4>图书馆</h4>
            <span>技术笔记</span>
          </div>
          <div class="action-card" @click="goShare">
            <h4>资源站</h4>
            <span>文件分享</span>
            <div class="action-badge">NEW</div>
          </div>
        </div>

        <!-- Community Card -->
        <div class="community-card" @click="$router.push('/companions')">
          <span class="community-title">伴侣社区</span>
          <span class="community-sub">AI 伴侣·幻想创作</span>
        </div>
      </div>

      <!-- Bottom Tabs -->
      <div class="bottom-tabs">
        <div class="tab-item" v-for="tab in bottomTabs" :key="tab.label" @click="$router.push(tab.link)">
          <h3>{{ tab.label }}</h3>
          <span>{{ tab.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const displayName = ref('Nakiri Ayame')
const userLevel = ref(42)
const levelProgress = ref(68)
const currentTime = ref('')
const currentQuote = ref('')
const quoteIndex = ref(0)

const quotes = [
  '技术不是终点，而是通往更好生活的桥梁',
  '分享是最好的学习方式',
  '保持好奇心，永远在路上',
  '代码是逻辑的诗篇',
  '简单是复杂的极致'
]

const navigations = [
  { title: '图书馆', sub: '知识宝库', link: '/library' },
  { title: '伴侣', sub: 'AI 社区', link: '/companions' },
  { title: '文化区', sub: '生活记录', link: '/culture' },
  { title: '资源', sub: '免费分享', link: '/resources' }
]

const banners = [
  { text: '📚 探索技术图书馆', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { text: '🎮 欢迎来到 MiyaWeb', bg: 'linear-gradient(135deg, #0f3460, #533483)' },
  { text: '💡 记录·分享·成长', bg: 'linear-gradient(135deg, #16213e, #0f3460)' }
]

const stats = ref([
  { icon: '📖', label: 'articles', value: '128' },
  { icon: '💎', label: 'gems', value: '56' },
  { icon: '⭐', label: 'stars', value: '2024' }
])

const bottomTabs = [
  { label: '成员', desc: '个人主页', link: '/user' },
  { label: '仓库', desc: '资源管理', link: '/resources' },
  { label: '商店', desc: '文件分享', link: '/share' },
  { label: '采购', desc: '探索更多', link: '/culture' }
]

let quoteTimer: ReturnType<typeof setInterval>
let timeTimer: ReturnType<typeof setInterval>

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function goShare() {
  window.open('/share', '_blank')
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 60000)
  currentQuote.value = quotes[0]
  quoteTimer = setInterval(() => {
    quoteIndex.value = (quoteIndex.value + 1) % quotes.length
    currentQuote.value = quotes[quoteIndex.value]
  }, 5000)

  if (authStore.user?.username) {
    displayName.value = authStore.user.username
  }
})

onUnmounted(() => {
  clearInterval(quoteTimer)
  clearInterval(timeTimer)
})
</script>

<style scoped>
/* ========== Game Hub Container ========== */
.game-hub {
  position: fixed;
  inset: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  perspective: 800px;
  perspective-origin: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1b2838 70%, #0a0a1a 100%);
  overflow: hidden;
  z-index: 0;
}

/* Animated background particles */
.game-hub::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(39, 192, 254, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(102, 126, 234, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 0%, rgba(39, 192, 254, 0.05) 0%, transparent 30%);
  pointer-events: none;
}

/* ========== Left Panel ========== */
.left-panel {
  width: 30%;
  height: 90%;
  margin-left: 8%;
  padding: 2%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: rotateY(28deg);
  z-index: 1;
}

.user-info {
  padding: 4% 2% 2% 6%;
  margin-bottom: 8px;
}

.level-block {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.level-block:hover {
  letter-spacing: 0.15em;
  background: rgba(129, 191, 241, 0.12);
  border-radius: 6px;
}

.level-label {
  color: #aab;
  font-size: 0.8em;
}
.level-num {
  color: #fff;
  font-size: 2.5em;
  font-weight: bold;
}

.level-bar {
  width: 40%;
  height: 3px;
  background: #333;
  border-radius: 2px;
  margin-top: 2px;
}
.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #27c0fe, #667eea);
  border-radius: 2px;
  transition: width 1.5s ease;
}

.name-block {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.name-text {
  color: #fff;
  font-size: 1.3em;
  font-weight: bold;
  transition: all 0.3s;
}
.name-id {
  color: #889;
  font-size: 0.9em;
  transition: all 0.3s;
}
.name-block:hover .name-text,
.name-block:hover .name-id {
  color: #f87171;
  letter-spacing: 0.15em;
}

/* Center Nav */
.center-section {
  padding: 2%;
  margin-bottom: 8px;
  position: relative;
}

.nav-grid {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.nav-btn {
  width: 75px;
  height: 75px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.3s;
}
.nav-btn:hover {
  background: rgba(129, 191, 241, 0.2);
  transform: skewX(-8deg);
  border-color: rgba(129, 191, 241, 0.3);
}

.nav-title {
  color: #fff;
  font-size: 1.15em;
  font-weight: bold;
  margin-bottom: 10%;
}
.nav-sub {
  color: #889;
  font-size: 0.55em;
}

/* Bottom Section */
.bottom-section {
  padding: 4%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.banner-box {
  width: 100%;
  height: 60px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}
.banner-track {
  display: flex;
  animation: bannerSlide 12s ease-in-out infinite;
}
.banner-item {
  min-width: 100%;
}
.banner-inner {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.banner-text {
  color: #fff;
  font-size: 0.9em;
  font-weight: bold;
}
.banner-box:hover .banner-track {
  animation-play-state: paused;
}

.activity-box {
  display: flex;
  align-items: center;
  height: 32px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 0 8px;
  gap: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}
.activity-box:hover {
  background: rgba(0, 0, 0, 0.75);
  height: auto;
  min-height: 160px;
}
.activity-icon {
  flex-shrink: 0;
  font-size: 14px;
}
.activity-text {
  overflow: hidden;
  white-space: nowrap;
  color: #ccc;
  font-size: 0.85em;
  font-weight: bold;
}
.activity-marquee {
  display: inline-block;
  animation: marquee 8s linear infinite;
}

/* ========== Right Panel ========== */
.right-panel {
  width: 36%;
  height: 90%;
  margin-right: 8%;
  padding: 2%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: rotateY(-28deg);
  z-index: 1;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  min-width: 120px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.stat-item:hover {
  background: rgba(129, 191, 241, 0.18);
}
.stat-icon {
  font-size: 16px;
  width: 30px;
  text-align: center;
}
.stat-value {
  color: #fff;
  font-weight: bold;
  flex: 1;
}
.stat-add {
  width: 26px;
  height: 100%;
  color: #fff;
  font-size: 1.3em;
  font-weight: bold;
  background: rgba(39, 192, 254, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 4px 0;
}

/* Center Content */
.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-status {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}
.status-time {
  color: #fff;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s;
}
.status-time:hover {
  color: #f87171;
  font-size: 2em;
}

/* Featured Card */
.featured-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  height: 110px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.4s;
}
.featured-card:hover {
  background: rgba(129, 191, 241, 0.15);
  transform: rotateY(-8deg);
  border-color: rgba(129, 191, 241, 0.25);
}

.featured-avatar {
  width: 70px;
  height: 90px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
}
.mask-sweep {
  position: absolute;
  top: -20%;
  left: -15%;
  width: 6px;
  height: 160%;
  background: rgba(255, 255, 255, 0.25);
  transform: skewX(-30deg);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  z-index: 2;
  animation: maskSweep 2.5s ease-in-out infinite;
  filter: blur(3px);
}
.avatar-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a3e, #2d1b69);
  border-radius: 8px;
}

.featured-info {
  flex: 1;
  display: flex;
}
.featured-left {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.featured-title {
  color: #fff;
  font-size: 1.8em;
  font-weight: bold;
}
.featured-tag {
  color: #aaa;
  font-size: 0.8em;
}
.featured-status {
  font-size: 0.75em;
}

.featured-right {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  min-width: 65px;
}
.featured-pct {
  color: #fff;
  font-size: 1.2em;
  font-weight: bold;
}

.featured-mascot {
  position: relative;
  color: #fff;
  font-weight: bold;
  font-size: 0.6em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  top: 10px;
}
.featured-mascot:hover {
  transform: scale(1.3);
  color: #27c0fe;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
}

.action-card {
  position: relative;
  flex: 1;
  height: 70px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s;
}
.action-card:hover {
  background: rgba(129, 191, 241, 0.15);
  transform: rotateY(-6deg);
}
.action-card h4 {
  color: #fff;
  font-size: 1.1em;
}
.action-card span {
  color: #999;
  font-size: 0.7em;
}
.action-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #fec90d;
  color: #000;
  font-size: 0.55em;
  font-weight: bold;
  padding: 1px 5px;
  border-radius: 3px;
}

/* Community Card */
.community-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 6px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.4s;
}
.community-card:hover {
  background: rgba(129, 191, 241, 0.2);
  width: 100%;
}
.community-title {
  font-size: 1.3em;
  font-weight: bold;
  color: #111;
  transition: color 0.3s;
}
.community-sub {
  color: #666;
  font-size: 0.8em;
}
.community-card:hover .community-title {
  color: #fff;
}
.community-card:hover .community-sub {
  color: #ccc;
}

/* Bottom Tabs */
.bottom-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90px;
  margin-top: 8px;
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 6px;
}
.tab-item:hover {
  background: rgba(129, 191, 241, 0.15);
  text-shadow: 10px 5px 8px rgba(255, 255, 255, 0.3);
}
.tab-item h3 {
  color: #fff;
  font-size: 1.2em;
  transition: all 0.3s;
}
.tab-item span {
  color: #999;
  font-size: 0.7em;
  transition: all 0.3s;
}
.tab-item:hover h3,
.tab-item:hover span {
  color: #e0e0e0;
}

/* ========== Animations ========== */
@keyframes bannerSlide {
  0%, 25% { transform: translateX(0); }
  35%, 60% { transform: translateX(-100%); }
  70%, 95% { transform: translateX(-200%); }
  100% { transform: translateX(0); }
}

@keyframes marquee {
  0% { transform: translateX(60px); }
  100% { transform: translateX(-100%); }
}

@keyframes maskSweep {
  from {
    left: -15%;
    top: -25%;
  }
  to {
    left: 180%;
    top: 90%;
  }
}

/* Responsive: collapse to single column */
@media (max-width: 768px) {
  .game-hub {
    flex-direction: column;
    perspective: none;
    overflow-y: auto;
  }
  .left-panel, .right-panel {
    width: 100%;
    height: auto;
    margin: 0;
    padding: 16px;
    transform: none;
  }
}
</style>
