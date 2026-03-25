/**
 * 背景图片存储系统
 * 支持每个页面自定义背景图片
 */

export interface PageBackground {
  page: string
  imageUrl: string | null
  blur: number
  opacity: number
  contentOverlayColor: 'white' | 'black' | 'none'
  contentOverlayOpacity: number
  updatedAt: string
}

const BACKGROUND_STORAGE_KEY = 'jiaandmiya_backgrounds'

/**
 * 获取所有页面背景
 */
export function getAllBackgrounds(): Record<string, PageBackground> {
  const data = localStorage.getItem(BACKGROUND_STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

/**
 * 获取当前页面背景
 */
export function getPageBackground(page: string): PageBackground {
  const backgrounds = getAllBackgrounds()
  const bg = backgrounds[page]
  return bg || {
    page,
    imageUrl: null,
    blur: 0,
    opacity: 0,
    contentOverlayColor: 'none',
    contentOverlayOpacity: 90,
    updatedAt: ''
  }
}

/**
 * 保存页面背景
 */
export function savePageBackground(background: PageBackground): void {
  try {
    const backgrounds = getAllBackgrounds()
    backgrounds[background.page] = {
      ...background,
      updatedAt: new Date().toISOString()
    }

    const data = JSON.stringify(backgrounds)
    localStorage.setItem(BACKGROUND_STORAGE_KEY, data)
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // 存储空间不足，尝试清理其他页面的图片
      const backgrounds = getAllBackgrounds()

      for (const page in backgrounds) {
        if (page !== background.page && backgrounds[page].imageUrl) {
          backgrounds[page].imageUrl = null
          backgrounds[page].blur = 0
          backgrounds[page].opacity = 0
        }
      }

      try {
        localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(backgrounds))
        savePageBackground(background)
        return
      } catch {
        throw new Error('存储空间已满，请删除一些背景图片后重试')
      }
    } else {
      throw error
    }
  }
}

/**
 * 删除页面背景
 */
export function deletePageBackground(page: string): void {
  const backgrounds = getAllBackgrounds()
  if (backgrounds[page]) {
    backgrounds[page] = {
      page,
      imageUrl: null,
      blur: 0,
      opacity: 0,
      contentOverlayColor: 'none',
      contentOverlayOpacity: 90,
      updatedAt: ''
    }
    localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(backgrounds))
  }
}

/**
 * 清理所有背景图片（保留文字区域背景设置）
 */
export function clearAllBackgroundImages(): number {
  const backgrounds = getAllBackgrounds()
  let clearedCount = 0

  for (const page in backgrounds) {
    if (backgrounds[page].imageUrl) {
      backgrounds[page].imageUrl = null
      backgrounds[page].blur = 0
      backgrounds[page].opacity = 0
      clearedCount++
    }
  }

  localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(backgrounds))
  return clearedCount
}

/**
 * 强制清空所有背景数据（包括文字区域背景设置）
 */
export function clearAllBackgrounds(): void {
  localStorage.removeItem(BACKGROUND_STORAGE_KEY)

  // 同时清理所有默认背景设置
  const pages = ['/', '/notes', '/articles', '/culture', '/community', '/free-resources', '/about']
  pages.forEach(page => {
    localStorage.removeItem(`default_bg_${page}`)
  })
}

/**
 * 获取当前存储使用情况（包括所有 localStorage）
 */
export function getStorageUsage(): { used: number; total: number; percentage: number; details: Record<string, number> } {
  let totalUsed = 0
  const details: Record<string, number> = {}
  const allKeys = Object.keys(localStorage)

  allKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      const size = data.length
      totalUsed += size
      details[key] = size
    }
  })

  const total = 5 * 1024 * 1024 // 5MB
  return {
    used: totalUsed,
    total,
    percentage: Math.round((totalUsed / total) * 100),
    details
  }
}

/**
 * 打印所有页面的背景设置（用于用户主动调试）
 */
export function printAllBackgrounds(): void {
  const backgrounds = getAllBackgrounds()
  console.log('=== 所有页面的背景设置 ===')
  for (const page in backgrounds) {
    const bg = backgrounds[page]
    console.log(`${page}:`, {
      hasImage: !!bg.imageUrl,
      blur: bg.blur,
      opacity: bg.opacity,
      overlayColor: bg.contentOverlayColor,
      overlayOpacity: bg.contentOverlayOpacity,
      updatedAt: bg.updatedAt
    })
  }
  console.log('========================')
}
