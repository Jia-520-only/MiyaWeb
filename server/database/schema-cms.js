const { dbRun } = require('./db');

/**
 * 统一内容管理系统 (CMS) 数据库架构
 * 
 * collections (图书组 / 伴侣组)
 *   └── items (图书 / 伴侣卡片)
 *         └── volumes (卷 - 可选分组)
 *               └── chapters (章节)
 *                     └── articles (文章/内容，支持 txt/markdown)
 */

async function createCMSTables() {
  console.log('开始创建 CMS 内容管理系统表...');

  try {
    // ─────────────────────────────────────
    // 1. 内容集合表（图书组 / 伴侣组）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        type VARCHAR(30) NOT NULL CHECK(type IN ('book_group', 'companion_group', 'blog')),
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  collections 表创建成功');

    // ─────────────────────────────────────
    // 2. 内容项表（图书 / 伴侣卡片）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        type VARCHAR(30) NOT NULL CHECK(type IN ('book', 'companion', 'post')),
        author_id INTEGER,
        tags TEXT,
        custom_data TEXT,
        sort_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT 1,
        view_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published' CHECK(status IN ('draft', 'published')),
        content TEXT,
        content_type VARCHAR(20) DEFAULT 'markdown' CHECK(content_type IN ('markdown', 'txt', 'richtext')),
        source_file VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('  items 表创建成功');

    // ─────────────────────────────────────
    // 3. 卷表（图书的可选分组）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS volumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log('  volumes 表创建成功');

    // ─────────────────────────────────────
    // 4. 章节表
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        volume_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE SET NULL
      )
    `);
    console.log('  chapters 表创建成功');

    // ─────────────────────────────────────
    // 5. 文章表（支持 txt 和 markdown）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS articles_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER,
        item_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        content_type VARCHAR(10) NOT NULL DEFAULT 'markdown' CHECK(content_type IN ('markdown', 'txt')),
        summary TEXT,
        cover_image VARCHAR(500),
        attachments TEXT,
        is_downloadable BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log('  articles_v2 表创建成功');

    // ─────────────────────────────────────
    // 6. 导航配置表（侧边栏导航）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS nav_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        title VARCHAR(100) NOT NULL,
        icon VARCHAR(100),
        link VARCHAR(500),
        link_type VARCHAR(20) DEFAULT 'internal' CHECK(link_type IN ('internal', 'external')),
        is_visible BOOLEAN DEFAULT 1,
        open_in_new_tab BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES nav_items(id) ON DELETE CASCADE
      )
    `);
    console.log('  nav_items 表创建成功');

    // ─────────────────────────────────────
    // 7. 免费资源链接表
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS resource_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(100),
        category VARCHAR(100),
        cover_image VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT 1,
        download_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  resource_links 表创建成功');

    // ─────────────────────────────────────
    // 8. 用户资料扩展表（弥娅/个人中心）
    // ─────────────────────────────────────
    await dbRun(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        display_name VARCHAR(100),
        bio TEXT,
        bio_type VARCHAR(10) DEFAULT 'markdown' CHECK(bio_type IN ('markdown', 'txt')),
        avatar VARCHAR(500),
        cover_image VARCHAR(500),
        background_image VARCHAR(500),
        social_links TEXT,
        custom_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('  profiles 表创建成功');

    // ─────────────────────────────────────
    // 9. 索引
    // ─────────────────────────────────────
    await dbRun('CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_collections_visible ON collections(is_visible)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_collections_sort ON collections(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collection_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_items_type ON items(type)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_items_visible ON items(is_visible)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_items_sort ON items(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_volumes_item ON volumes(item_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_volumes_sort ON volumes(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_chapters_item ON chapters(item_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_chapters_volume ON chapters(volume_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_chapters_sort ON chapters(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_articles_v2_chapter ON articles_v2(chapter_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_articles_v2_item ON articles_v2(item_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_articles_v2_sort ON articles_v2(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_nav_parent ON nav_items(parent_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_nav_visible ON nav_items(is_visible)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_nav_sort ON nav_items(sort_order)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_resource_links_category ON resource_links(category)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_resource_links_visible ON resource_links(is_visible)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id)');

    // ── 侧边栏图片表 ──
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sidebar_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        thumb_path VARCHAR(500),
        mime_type VARCHAR(100),
        size INTEGER,
        width INTEGER,
        height INTEGER,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun('CREATE INDEX IF NOT EXISTS idx_sidebar_sort ON sidebar_images(sort_order)');

    // ── OC 图片关联表 ──
    await dbRun(`
      CREATE TABLE IF NOT EXISTS oc_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        upload_id INTEGER NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun('CREATE INDEX IF NOT EXISTS idx_oc_images_item ON oc_images(item_id)');

    // ── Banner 图片表 ──
    await dbRun(`
      CREATE TABLE IF NOT EXISTS banner_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        thumb_path VARCHAR(500),
        mime_type VARCHAR(100),
        size INTEGER,
        width INTEGER,
        height INTEGER,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun('CREATE INDEX IF NOT EXISTS idx_banner_sort ON banner_images(sort_order)');

    // ── 侧边栏推荐链接表 ──
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sidebar_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label VARCHAR(255) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('  索引创建成功');

    console.log('CMS 内容管理系统数据库表创建完成!');
    return true;
  } catch (error) {
    console.error('创建 CMS 表失败:', error);
    throw error;
  }
}

module.exports = { createCMSTables };

// 直接运行时执行表创建
if (require.main === module) {
  const { closeDB } = require('./db');
  createCMSTables()
    .then(() => closeDB())
    .catch((err) => {
      console.error(err);
      closeDB();
      process.exit(1);
    });
}
