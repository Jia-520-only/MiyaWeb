<template>
  <Icon
    :icon="name"
    :width="sizeMap[size]"
    :height="sizeMap[size]"
    :class="['inline-flex items-center flex-shrink-0', !color && 'text-current']"
    :style="color ? { color } : {}"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}>(), {
  size: 'sm',
  color: undefined
})

const sizeMap: Record<string, number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36
}
</script>
