<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <div class="flex-1 pt-16">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <!-- Desktop Layout -->
        <template v-if="isDesktop">
          <div class="lg:grid lg:grid-cols-[240px_1fr_220px] xl:grid-cols-[260px_1fr_240px] gap-8 py-10">
            <aside>
              <div class="sticky top-28 space-y-4">
                <slot name="left" />
              </div>
            </aside>
            <main class="min-w-0">
              <slot />
            </main>
            <aside>
              <div class="sticky top-28 space-y-4">
                <slot name="right" />
              </div>
            </aside>
          </div>
        </template>

        <!-- Mobile Layout -->
        <template v-else>
          <div class="py-6">
            <slot />
          </div>
          <MobileBottomNav />
        </template>
      </div>
    </div>
    <Footer v-if="isDesktop" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const isDesktop = ref(false)

function check() {
  isDesktop.value = window.matchMedia('(min-width: 1024px)').matches
}

let mql: MediaQueryList

onMounted(() => {
  mql = window.matchMedia('(min-width: 1024px)')
  mql.addEventListener('change', check)
  check()
})

onUnmounted(() => {
  mql.removeEventListener('change', check)
})
</script>
