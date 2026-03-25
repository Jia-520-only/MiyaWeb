// Markdown 文件加载工具
const markdownFiles = import.meta.glob('/src/content/md/*.md', { as: 'raw' })

export interface MarkdownChapter {
  title: string
  content: string
  order: number
}

export interface MarkdownBook {
  id: string
  title: string
  cover?: string
  color?: string
  category: string
  tags: string[]
  author?: string
  date: string
  chapters: MarkdownChapter[]
}

// 从文件路径提取 ID
function extractIdFromPath(path: string): string {
  const match = path.match(/\/(\d+)\.md$/)
  return match ? match[1] : path
}

// 解析 Markdown 文件内容为章节
function parseMarkdownToChapters(content: string): MarkdownChapter[] {
  const chapters: MarkdownChapter[] = []
  const lines = content.split('\n')

  let currentChapter: MarkdownChapter | null = null
  let chapterOrder = 0
  let currentContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 检测章节标题（### 或 ## 开头）
    if (line.match(/^##?\s+/)) {
      // 保存上一个章节
      if (currentChapter) {
        currentChapter.content = currentContent.join('\n').trim()
        chapters.push(currentChapter)
      }

      // 创建新章节
      const title = line.replace(/^##?\s+/, '').trim()
      chapterOrder++
      currentChapter = {
        title,
        content: '',
        order: chapterOrder
      }
      currentContent = []
    } else if (currentChapter) {
      currentContent.push(line)
    }
  }

  // 保存最后一个章节
  if (currentChapter) {
    currentChapter.content = currentContent.join('\n').trim()
    chapters.push(currentChapter)
  }

  // 如果没有章节标题，整个内容作为第一章
  if (chapters.length === 0 && content.trim()) {
    chapters.push({
      title: '内容',
      content: content.trim(),
      order: 1
    })
  }

  return chapters
}

// 提取元数据（YAML front matter）
function extractMetadata(content: string): { metadata: Record<string, any>, content: string } {
  const metadata: Record<string, any> = {}
  let cleanContent = content

  // 检查是否有 YAML front matter
  if (content.startsWith('---')) {
    const endMarker = content.indexOf('---', 4)
    if (endMarker !== -1) {
      const frontMatter = content.slice(4, endMarker).trim()
      cleanContent = content.slice(endMarker + 3).trim()

      // 解析 YAML
      frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          // 尝试解析为数组
          if (value.startsWith('[') && value.endsWith(']')) {
            metadata[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''))
          } else {
            // 移除引号
            metadata[key.trim()] = value.replace(/^['"]|['"]$/g, '')
          }
        }
      })
    }
  }

  return { metadata, content: cleanContent }
}

// 加载单个 Markdown 文件
export async function loadMarkdownFile(id: string): Promise<MarkdownBook | null> {
  try {
    // 查找对应的 Markdown 文件
    const fileKey = Object.keys(markdownFiles).find(key =>
      key.endsWith(`/${id}.md`) || key.includes(`${id}.md`)
    )

    if (!fileKey) {
      console.warn(`Markdown file not found: ${id}`)
      return null
    }

    // 动态导入文件
    const content = await markdownFiles[fileKey]()

    // 提取元数据和内容
    const { metadata, content: cleanContent } = extractMetadata(content as string)

    // 解析章节
    const chapters = parseMarkdownToChapters(cleanContent)

    return {
      id,
      title: metadata.title || `笔记 ${id}`,
      cover: metadata.cover,
      color: metadata.color,
      category: metadata.category || '技术',
      tags: metadata.tags || [],
      author: metadata.author || 'Miya',
      date: metadata.date || new Date().toLocaleDateString('zh-CN'),
      chapters
    }
  } catch (error) {
    console.error(`Failed to load markdown file ${id}:`, error)
    return null
  }
}

// 加载所有 Markdown 文件
export async function loadAllMarkdownFiles(): Promise<MarkdownBook[]> {
  const books: MarkdownBook[] = []

  try {
    const fileKeys = Object.keys(markdownFiles)

    for (const key of fileKeys) {
      const id = extractIdFromPath(key)
      const book = await loadMarkdownFile(id)
      if (book) {
        books.push(book)
      }
    }
  } catch (error) {
    console.error('Failed to load markdown files:', error)
  }

  return books
}

// 从 LocalStorage 加载笔记内容（兼容旧版本）
export function loadNoteFromStorage(id: string): MarkdownBook | null {
  try {
    const content = localStorage.getItem(`note_${id}`)
    if (content) {
      const parsed = JSON.parse(content)
      const chapters = parseMarkdownToChapters(parsed.content || '')

      return {
        id,
        title: parsed.title || `笔记 ${id}`,
        cover: parsed.cover,
        color: parsed.color,
        category: parsed.category || '技术',
        tags: parsed.tags || [],
        date: parsed.date || new Date().toLocaleDateString('zh-CN'),
        chapters
      }
    }
  } catch (error) {
    console.error('Failed to load note from storage:', error)
  }
  return null
}

