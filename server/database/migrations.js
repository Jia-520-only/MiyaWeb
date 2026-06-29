const { dbRun } = require('./db');

const alterMigrations = [
  `ALTER TABLE items ADD COLUMN status VARCHAR(20) DEFAULT 'published' CHECK(status IN ('draft', 'published'))`,
  `ALTER TABLE items ADD COLUMN source_file VARCHAR(500)`,
  `ALTER TABLE articles_v2 ADD COLUMN status VARCHAR(20) DEFAULT 'published' CHECK(status IN ('draft', 'published'))`,
]

// 数据库迁移SQL语句
const migrations = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('admin', 'editor', 'user')),
    display_name VARCHAR(100),
    avatar VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 文章分类表
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 文章表
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    cover_image VARCHAR(255),
    read_time INTEGER,
    tags TEXT, -- JSON字符串存储标签
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 内容项表（用于可编辑的页面内容）
  `CREATE TABLE IF NOT EXISTS content_items (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK(type IN ('text', 'markdown', 'link', 'image', 'array', 'object')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT, -- JSON字符串存储元数据
    page VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 文件上传记录表
  `CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    size INTEGER,
    width INTEGER,
    height INTEGER,
    thumb_path VARCHAR(500),
    alt_text VARCHAR(255),
    description TEXT,
    is_public BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,

  // 评论表
  `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    user_id INTEGER,
    parent_id INTEGER,
    author_name VARCHAR(100),
    author_email VARCHAR(100),
    author_url VARCHAR(255),
    author_ip VARCHAR(45),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'spam', 'trash')),
    is_anonymous BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
  )`,

  // 访客统计表
  `CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
  )`,

  // 创建索引提高查询性能
  `CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_items_page ON content_items(page)`,
  `CREATE INDEX IF NOT EXISTS idx_content_items_active ON content_items(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

  `CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles(tags)`,
  `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
  `CREATE INDEX IF NOT EXISTS idx_content_items_page_section ON content_items(page, section)`
];

const lateMigrations = [
  `CREATE INDEX IF NOT EXISTS idx_items_slug ON items(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_items_collection_status ON items(collection_id, status, is_visible)`,
  `CREATE INDEX IF NOT EXISTS idx_companions_created ON companions(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_companion_dialogues_created ON companion_dialogues(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_companion_chapters_number ON companion_chapters(companion_id, chapter_number)`,
  `CREATE INDEX IF NOT EXISTS idx_volumes_item ON volumes(item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chapters_item ON chapters(item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chapters_volume ON chapters(volume_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_v2_chapter ON articles_v2(chapter_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_v2_item ON articles_v2(item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_navigation_sort ON nav_items(sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_resources_category ON resource_links(category)`,
  `CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type)`,
  `CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id)`
];

// 安全迁移：添加 items 表的 content/content_type 字段
const safeMigrations = async () => {
  const migrations = [
    { sql: `ALTER TABLE items ADD COLUMN content TEXT DEFAULT ''`, desc: 'items.content' },
    { sql: `ALTER TABLE items ADD COLUMN content_type VARCHAR(20) DEFAULT 'markdown' CHECK(content_type IN ('markdown', 'txt', 'richtext'))`, desc: 'items.content_type' },
  ];
  const { dbRun } = require('./db');
  for (const m of migrations) {
    try {
      await dbRun(m.sql);
      console.log(`  ✅ 迁移 ${m.desc} 完成`);
    } catch (e) {
      // 列已存在时忽略
      if (e.message && e.message.includes('duplicate column')) {
        console.log(`  ⏭️  ${m.desc} 已存在，跳过`);
      } else {
        console.error(`  ❌ 迁移 ${m.desc} 失败:`, e.message);
      }
    }
  }
};

// 执行所有迁移
const runMigrations = async () => {
  console.log('🔄 开始数据库迁移...');
  
  try {
    for (let i = 0; i < migrations.length; i++) {
      await dbRun(migrations[i]);
      console.log(`✅ 迁移 ${i + 1}/${migrations.length} 完成`);
    }
    for (const m of alterMigrations) {
      try { await dbRun(m) } catch { /* column may already exist */ }
    }
    
    console.log('🎉 所有数据库迁移完成');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  }
};

// 延迟迁移 - 在 CMS/伴侣表创建后执行
const runLateMigrations = async () => {
  console.log('🔄 执行延迟索引迁移...');
  try {
    for (let i = 0; i < lateMigrations.length; i++) {
      try {
        await dbRun(lateMigrations[i]);
      } catch { /* table may not exist yet */ }
    }

    // 清理旧数据中的绝对 URL → 相对路径
    console.log('🧹 清理旧图片URL...');
    const stripHost = (col) => `REPLACE(REPLACE(${col}, 'http://jiaandmiya.com', ''), 'https://jiaandmiya.com', '')`;
    const cleanTable = async (table, columns) => {
      for (const col of columns) {
        try {
          await dbRun(`UPDATE ${table} SET ${col} = ${stripHost(col)} WHERE ${col} LIKE 'http%'`);
        } catch { /* might not exist */ }
      }
    };
    await cleanTable('uploads', ['path', 'thumb_path']);
    await cleanTable('sidebar_images', ['path', 'thumb_path']);
    await cleanTable('banner_images', ['path', 'thumb_path']);
    await cleanTable('collections', ['cover_image']);
    await cleanTable('items', ['cover_image']);
    await cleanTable('resource_links', ['cover_image']);
    await cleanTable('profiles', ['avatar', 'cover_image', 'background_image']);
    await cleanTable('articles', ['cover_image']);
    await cleanTable('oc_images', []);
    // 清理正文内容中嵌入的旧 URL
    try {
      await dbRun(`UPDATE articles SET content = REPLACE(REPLACE(content, 'http://jiaandmiya.com', ''), 'https://jiaandmiya.com', '') WHERE content LIKE '%http://jiaandmiya.com%' OR content LIKE '%https://jiaandmiya.com%'`);
      await dbRun(`UPDATE items SET description = REPLACE(REPLACE(description, 'http://jiaandmiya.com', ''), 'https://jiaandmiya.com', '') WHERE description LIKE '%http://jiaandmiya.com%' OR description LIKE '%https://jiaandmiya.com%'`);
      await dbRun(`UPDATE content_items SET content = REPLACE(REPLACE(content, 'http://jiaandmiya.com', ''), 'https://jiaandmiya.com', '') WHERE content LIKE '%http://jiaandmiya.com%' OR content LIKE '%https://jiaandmiya.com%'`);
      await dbRun(`UPDATE content_items SET metadata = REPLACE(REPLACE(metadata, 'http://jiaandmiya.com', ''), 'https://jiaandmiya.com', '') WHERE metadata LIKE '%http://jiaandmiya.com%' OR metadata LIKE '%https://jiaandmiya.com%'`);
    } catch { /* skip */ }
    console.log('✅ 图片URL清理完成');

    console.log('✅ 延迟索引迁移完成');
  } catch (error) {
    console.error('❌ 延迟索引迁移失败:', error);
  }
};

// 初始化数据库
const initDatabase = async () => {
  try {
    await runMigrations();
    return true;
  } catch (error) {
    console.error('初始化数据库失败:', error);
    return false;
  }
};

module.exports = {
  runMigrations,
  runLateMigrations,
  initDatabase,
  safeMigrations
};