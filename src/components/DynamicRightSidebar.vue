<template>
  <div class="space-y-4">
    <!-- Reading page: show TOC + controls -->
    <ReaderTOC v-if="isReadingPage" />

    <!-- Default: categories + tags -->
    <RightSidebar v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RightSidebar from './layout/RightSidebar.vue'
import ReaderTOC from './ReaderTOC.vue'

const route = useRoute()

const isReadingPage = computed(() => {
  const p = route.path
  return p.match(/\/library\/\d+\/\d+/) || p.match(/\/blog\/\d+/) || p.match(/\/companions\/\d+/)
})
</script>
