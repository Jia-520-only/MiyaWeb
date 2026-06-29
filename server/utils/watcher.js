const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

let INCOMING, PUBLISHED, IMAGES_IN, dbGet, dbRun

function ensureDirs() {
  [INCOMING, PUBLISHED].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function importOne(filePath) {
  const filename = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase()
  if (!['.md', '.txt'].includes(ext)) return false

  // 等待文件写入完成
  let stable = false
  for (let i = 0; i < 15; i++) {
    await sleep(300)
    if (!fs.existsSync(filePath)) return false
    const s1 = fs.statSync(filePath).size
    await sleep(500)
    if (!fs.existsSync(filePath)) return false
    const s2 = fs.statSync(filePath).size
    if (s1 === s2 && s1 > 0) { stable = true; break }
  }
  if (!stable) { console.log(`  ⚠ ${filename}: file not stable, skipped`); return false }

  // 解析
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = matter(raw)
  const meta = parsed.data || {}
  const title = meta.title || filename.replace(ext, '')
  const collection = meta.collection || 'default'
  const section = meta.section || 'library'
  const desc = meta.description || ''
  const tags = Array.isArray(meta.tags) ? meta.tags.join(',') : (meta.tags || '')

  const typeMap = { blog: 'blog', library: 'book_group' }
  const colType = typeMap[section] || 'book_group'
  const itemType = section === 'blog' ? 'post' : 'book'
  const sourceFile = `content/published/${collection}/${filename}`

  // 创建或获取集合
  let col = await dbGet('SELECT id FROM collections WHERE slug = ?', [collection])
  if (!col) {
    const r = await dbRun(
      'INSERT INTO collections (name, slug, description, type) VALUES (?,?,?,?)',
      [collection.charAt(0).toUpperCase() + collection.slice(1).replace(/-/g, ' '), collection, '', colType]
    )
    col = { id: r.id }
  }

  // 更新或创建条目
  const existing = await dbGet(
    'SELECT id FROM items WHERE collection_id = ? AND title = ?',
    [col.id, title]
  )

  if (existing) {
    await dbRun(
      'UPDATE items SET description=?, tags=?, content=?, content_type=?, status=?, source_file=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [desc, tags, parsed.content, ext === '.md' ? 'markdown' : 'txt', 'draft', sourceFile, existing.id]
    )
    console.log(`  ⟳ ${title}`)
  } else {
    const itemSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '').slice(0, 50)
    await dbRun(
      'INSERT INTO items (collection_id, title, slug, description, tags, content, content_type, type, status, is_visible, source_file) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [col.id, title, itemSlug, desc, tags, parsed.content, ext === '.md' ? 'markdown' : 'txt', itemType, 'draft', 1, sourceFile]
    )
    console.log(`  ✓ ${title}`)
  }

  // 归档
  const archiveDir = path.join(PUBLISHED, collection)
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true })
  const dest = path.join(archiveDir, filename)
  if (fs.existsSync(dest)) fs.unlinkSync(dest)
  fs.copyFileSync(filePath, dest)
  fs.unlinkSync(filePath)
  return true
}

let running = false
async function scanLoop() {
  if (running) return
  running = true
  try {
    const allFiles = fs.readdirSync(INCOMING)
    if (allFiles.length > 0) {
      for (const f of allFiles) {
        const fp = path.join(INCOMING, f)
        if (!fs.existsSync(fp)) continue
        const stat = fs.statSync(fp)
        if (stat.isDirectory()) continue
        const ext = path.extname(f).toLowerCase()

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) && IMAGES_IN) {
          const dest = path.join(IMAGES_IN, f)
          if (fs.existsSync(dest)) {
            const uniq = `${Date.now()}_${f}`
            fs.renameSync(fp, path.join(IMAGES_IN, uniq))
            console.log(`  📸 ${f} → incoming-images/`)
          } else {
            fs.renameSync(fp, dest)
            console.log(`  📸 ${f} → incoming-images/`)
          }
          continue
        }

        if (!['.md', '.txt'].includes(ext)) continue

        const fp2 = path.join(INCOMING, f)
        if (!fs.existsSync(fp2)) continue
        console.log(`\n📥 ${f}`)
        try { await importOne(fp2) }
        catch (e) { console.error(`  ❌ ${e.message}`); await sleep(2000) }
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('📁 文件扫描异常:', e.message)
  } finally {
    running = false
  }
}

let scanDebounce = null
function debouncedScan() {
  if (scanDebounce) clearTimeout(scanDebounce)
  scanDebounce = setTimeout(scanLoop, 2000)
}

let fsWatcher = null
let pollInterval = null
const POLL_INTERVAL = 60000
const WATCH_INTERVAL = 3000

function startWatcher(dbModule) {
  if (process.env.NODE_APP_INSTANCE && process.env.NODE_APP_INSTANCE !== '0') {
    console.log('📁 Import: 由实例 0 管理，当前实例跳过')
    return null
  }
  dbGet = dbModule.dbGet; dbRun = dbModule.dbRun
  INCOMING = path.join(__dirname, '..', '..', 'content', 'incoming')
  PUBLISHED = path.join(__dirname, '..', '..', 'content', 'published')
  IMAGES_IN = path.join(__dirname, '..', '..', 'content', 'incoming-images')
  ensureDirs()

  const usePolling = process.env.FILE_WATCH_MODE === 'polling'
    || process.env.NODE_ENV === 'development'

  if (usePolling) {
    console.log(`\n📁 Import: ${INCOMING}`)
    console.log(`   每 ${WATCH_INTERVAL / 1000}s 轮询 .md / .txt，图片自动转到 incoming-images/`)
    pollInterval = setInterval(scanLoop, WATCH_INTERVAL)
    scanLoop()
    return pollInterval
  }

  console.log(`\n📁 Import (事件驱动): ${INCOMING}`)
  try {
    fsWatcher = fs.watch(INCOMING, { persistent: true }, (eventType, filename) => {
      if (!filename) return
      if (['.md', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => filename.toLowerCase().endsWith(ext))) {
        debouncedScan()
      }
    })
    fsWatcher.on('error', (err) => {
      console.error('📁 fs.watch 错误:', err.message)
    })
    console.log(`   fs.watch 已启动，降级轮询间隔: ${POLL_INTERVAL / 1000}s`)
  } catch (e) {
    console.warn(`   fs.watch 不可用 (${e.message})，降级为轮询模式`)
    pollInterval = setInterval(scanLoop, WATCH_INTERVAL)
  }

  pollInterval = setInterval(scanLoop, POLL_INTERVAL)
  scanLoop()
  return pollInterval
}

function stopWatcher() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
  if (scanDebounce) { clearTimeout(scanDebounce); scanDebounce = null }
  if (fsWatcher) { try { fsWatcher.close() } catch {}; fsWatcher = null }
}

module.exports = { startWatcher, stopWatcher }
