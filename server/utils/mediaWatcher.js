const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')

let INCOMING, GALLERY_IN, ARCHIVE, uploadDir, thumbDir, dbRun, dbGet

function ensureDirs() {
  ;[INCOMING, GALLERY_IN, ARCHIVE, uploadDir, thumbDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const imageExtSet = new Set(imageExtensions)

async function waitStable(filePath) {
  for (let i = 0; i < 15; i++) {
    await sleep(300)
    if (!fs.existsSync(filePath)) return false
    const s1 = fs.statSync(filePath).size
    await sleep(500)
    if (!fs.existsSync(filePath)) return false
    const s2 = fs.statSync(filePath).size
    if (s1 === s2 && s1 > 0) return true
  }
  return false
}

function getMimeType(ext) {
  const m = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }
  return m[ext] || 'application/octet-stream'
}

async function generateThumbnail(srcPath, destDir, thumbName) {
  try {
    const thumbPath = path.join(destDir, thumbName)
    await sharp(srcPath).resize(300, 300, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(thumbPath)
    return thumbPath
  } catch (e) {
    console.warn('  缩略图生成失败:', e.message)
    return null
  }
}

async function compressIfNeeded(srcPath, ext) {
  try {
    const stats = fs.statSync(srcPath)
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024
    if (stats.size > MAX_IMAGE_SIZE) {
      console.warn('  图片过大 (超过50MB), 跳过压缩:', path.basename(srcPath))
      return { compressed: false }
    }

    const meta = await sharp(srcPath).metadata()
    if (!meta.width || meta.width <= 1920) {
      if (ext === 'png') {
        const newPath = srcPath.replace(/\.png$/i, '.webp')
        await sharp(srcPath).webp({ quality: 80 }).toFile(newPath)
        fs.unlinkSync(srcPath)
        return { compressed: true, newExt: 'webp' }
      }
      return { compressed: false }
    }

    if (ext === 'png') {
      const newPath = srcPath + '.tmp.webp'
      await sharp(srcPath).resize(1920, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(newPath)
      fs.unlinkSync(srcPath)
      fs.renameSync(newPath, srcPath.replace(/\.png$/i, '.webp'))
      return { compressed: true, newExt: 'webp' }
    } else {
      const tmpPath = srcPath + '.tmp'
      await sharp(srcPath).resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(tmpPath)
      fs.unlinkSync(srcPath)
      fs.renameSync(tmpPath, srcPath)
      return { compressed: true, newExt: ext }
    }
  } catch (e) {
    console.warn('  压缩失败:', e.message)
    return { compressed: false }
  }
}

async function processImage(filePath) {
  const filename = path.basename(filePath)
  const ext = path.extname(filename).toLowerCase()
  if (!imageExtSet.has(ext)) return null

  const stable = await waitStable(filePath)
  if (!stable) { console.log(`  ⚠ ${filename}: 文件未稳定, 跳过`); return null }

  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const destDir = path.join(uploadDir, year, month)
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  let finalExt = ext.substring(1)
  const destName = `${timestamp}_${random}.${finalExt}`
  const destPath = path.join(destDir, destName)

  fs.copyFileSync(filePath, destPath)

  let finalPath = destPath
  const compressResult = await compressIfNeeded(destPath, ext.substring(1))
  if (compressResult.compressed) {
    if (compressResult.newExt) finalExt = compressResult.newExt
    finalPath = destPath.replace(new RegExp(`\\.${ext.substring(1)}$`, 'i'), `.${finalExt}`)
  }

  const stats = fs.statSync(finalPath)

  let width = null, height = null
  try {
    const meta = await sharp(finalPath).metadata()
    width = meta.width; height = meta.height
  } catch (e) { /* ignore */ }

  let thumbPathRel = null
  try {
    const absThumb = await generateThumbnail(finalPath, thumbDir, `thumb_${timestamp}_${random}.webp`)
    if (absThumb) thumbPathRel = '/' + path.relative(path.resolve(uploadDir, '..'), absThumb).replace(/\\/g, '/')
  } catch (e) { /* ignore */ }

  const relPath = '/' + path.relative(path.resolve(uploadDir, '..'), finalPath).replace(/\\/g, '/')
  const mimeType = getMimeType(finalExt)

  // Check-then-insert with retry for cluster race safety
  let inserted = false
  for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
    const existing = await dbGet(
      'SELECT id FROM uploads WHERE original_name = ? AND size = ?',
      [filename, stats.size]
    )
    if (existing) {
      console.log(`  ⟳ ${filename} (已存在于上传库)`)
      inserted = true
    } else {
      try {
        await dbRun(
          `INSERT INTO uploads (user_id, filename, original_name, path, mime_type, size, width, height, thumb_path, is_public)
           VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [path.basename(finalPath), filename, relPath, mimeType, stats.size, width, height, thumbPathRel]
        )
        console.log(`  ✓ 上传库: ${filename}`)
        inserted = true
      } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT') {
          console.log(`  ⟳ ${filename} (并发冲突，已是重复)`)
          inserted = true
        } else if (attempt === 2) throw e
        else await sleep(100)
      }
    }
  }

  return { filename, relPath, thumbPathRel, width, height, timestamp }
}

async function addToGallery(imageInfo) {
  const { filename, relPath, timestamp } = imageInfo
  const title = path.parse(filename).name
  const date = new Date().toISOString().split('T')[0]

  const newImage = {
    id: timestamp,
    title: title,
    date: date,
    emoji: '',
    imageUrl: relPath,
    groupId: null,
  }

  const existing = await dbGet("SELECT id, content FROM content_items WHERE id = 'culture-gallery'")

  if (existing) {
    let images = []
    try { images = JSON.parse(existing.content) } catch (e) { images = [] }
    images.unshift(newImage)
    await dbRun(
      "UPDATE content_items SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'culture-gallery'",
      [JSON.stringify(images)]
    )
    console.log(`  ✓ 人文画廊: ${title} (共 ${images.length} 张)`)
  } else {
    await dbRun(
      `INSERT INTO content_items (id, type, title, content, metadata, page, section, sort_order, is_active)
       VALUES ('culture-gallery', 'array', '人文画廊', ?, NULL, 'culture', 'gallery', 0, 1)`,
      [JSON.stringify([newImage])]
    )
    console.log(`  ✓ 人文画廊已创建: ${title}`)
  }
}

async function importImage(filePath, isGallery) {
  const imageInfo = await processImage(filePath)
  if (!imageInfo) return false

  if (isGallery) {
    try { await addToGallery(imageInfo) }
    catch (e) { console.error(`  ❌ 画廊添加失败: ${e.message}`) }
  }

  const archiveDir = path.join(ARCHIVE, 'media')
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true })
  const archivePath = path.join(archiveDir, path.basename(filePath))
  try {
    if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath)
    if (fs.existsSync(filePath)) fs.renameSync(filePath, archivePath)
  } catch (e) {
    console.error(`  ⚠ 归档失败: ${e.message}`)
  }

  return true
}

function listImageFiles(dir) {
  try {
    return fs.readdirSync(dir).filter(f => {
      const stat = fs.statSync(path.join(dir, f))
      return stat.isFile() && imageExtSet.has(path.extname(f).toLowerCase())
    })
  } catch (e) { return [] }
}

let running = false
async function scanLoop() {
  if (running) return
  running = true
  try {
    const generalFiles = listImageFiles(INCOMING)
    for (const f of generalFiles) {
      const fp = path.join(INCOMING, f)
      if (!fs.existsSync(fp)) continue
      console.log(`\n🖼  ${f}`)
      try { await importImage(fp, false) }
      catch (e) { console.error(`  ❌ ${e.message}`); await sleep(2000) }
    }

    const galleryFiles = listImageFiles(GALLERY_IN)
    for (const f of galleryFiles) {
      const fp = path.join(GALLERY_IN, f)
      if (!fs.existsSync(fp)) continue
      console.log(`\n🎨 ${f}`)
      try { await importImage(fp, true) }
      catch (e) { console.error(`  ❌ ${e.message}`); await sleep(2000) }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('📷 媒体扫描异常:', e.message)
  } finally {
    running = false
  }
}

let scanDebounce = null
function debouncedScan() {
  if (scanDebounce) clearTimeout(scanDebounce)
  scanDebounce = setTimeout(scanLoop, 2000)
}

let fsWatchers = []
let pollInterval = null
const POLL_INTERVAL = 60000
const WATCH_INTERVAL = 3000

function startMediaWatcher(dbModule) {
  // Only run on the first cluster instance to avoid duplicate imports
  if (process.env.NODE_APP_INSTANCE && process.env.NODE_APP_INSTANCE !== '0') {
    console.log('🖼  Media Import: 由实例 0 管理，当前实例跳过')
    return null
  }
  dbGet = dbModule.dbGet; dbRun = dbModule.dbRun
  INCOMING = path.join(__dirname, '..', '..', 'content', 'incoming-images')
  GALLERY_IN = path.join(__dirname, '..', '..', 'content', 'incoming-images', 'gallery')
  ARCHIVE = path.join(__dirname, '..', '..', 'content', 'incoming-images-archive')
  uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')
  thumbDir = path.join(uploadDir, 'thumbnails')
  ensureDirs()

  const usePolling = process.env.FILE_WATCH_MODE === 'polling'
    || process.env.NODE_ENV === 'development'

  if (usePolling) {
    console.log(`\n🖼  Media Import: ${INCOMING}`)
    console.log(`   每 ${WATCH_INTERVAL / 1000}s 轮询, 支持: jpg, jpeg, png, gif, webp`)
    console.log(`🎨  Gallery Import: ${GALLERY_IN}`)
    console.log(`   丢入 gallery/ 子文件夹的图片会自动出现在人文板块`)
    pollInterval = setInterval(scanLoop, WATCH_INTERVAL)
    scanLoop()
    return pollInterval
  }

  console.log(`\n🖼  Media Import (事件驱动): ${INCOMING}`)
  console.log(`🎨  Gallery Import (事件驱动): ${GALLERY_IN}`)
  try {
    const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    for (const watchDir of [INCOMING, GALLERY_IN]) {
      try {
        const w = fs.watch(watchDir, { persistent: true }, (eventType, filename) => {
          if (!filename) return
          if (imgExts.some(ext => filename.toLowerCase().endsWith(ext))) {
            debouncedScan()
          }
        })
        w.on('error', (err) => console.error(`📷 fs.watch 错误 (${watchDir}):`, err.message))
        fsWatchers.push(w)
      } catch (e) {
        console.warn(`   fs.watch 不可用于 ${watchDir}: ${e.message}`)
      }
    }
    console.log(`   fs.watch 已启动，降级轮询间隔: ${POLL_INTERVAL / 1000}s`)
  } catch (e) {
    console.warn(`   fs.watch 不可用，降级为轮询模式`)
    pollInterval = setInterval(scanLoop, WATCH_INTERVAL)
  }

  pollInterval = setInterval(scanLoop, POLL_INTERVAL)
  scanLoop()
  return pollInterval
}

function stopMediaWatcher() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
  if (scanDebounce) { clearTimeout(scanDebounce); scanDebounce = null }
  if (fsWatchers.length > 0) {
    fsWatchers.forEach(w => { try { w.close() } catch {} })
    fsWatchers = []
  }
}

module.exports = { startMediaWatcher, stopMediaWatcher }
