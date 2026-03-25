const { dbRun } = require('./db');

async function createCompanionsTables() {
  console.log('开始创建伴侣分享社区相关表...');

  try {
    // 伴侣表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS companions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        avatar TEXT,
        personality TEXT,
        background TEXT,
        tags TEXT,
        is_public BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ 伴侣表创建成功');

    // 幻想书章节表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS companion_chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companion_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        chapter_number INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ 幻想书章节表创建成功');

    // 一人的小说对话表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS companion_dialogues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companion_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        emotion VARCHAR(50),
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ 对话记录表创建成功');

    // 伴侣收藏表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS companion_favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companion_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(companion_id, user_id),
        FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ 收藏表创建成功');

    // 创建索引
    await dbRun('CREATE INDEX IF NOT EXISTS idx_companions_user ON companions(user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_companions_type ON companions(type)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_companions_public ON companions(is_public)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_chapters_companion ON companion_chapters(companion_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_dialogues_companion ON companion_dialogues(companion_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_favorites_companion ON companion_favorites(companion_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_favorites_user ON companion_favorites(user_id)');
    console.log('✅ 索引创建成功');

    console.log('🎉 伴侣分享社区数据库表创建完成！');
    return true;
  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  }
}

module.exports = { createCompanionsTables };

// 如果直接运行此文件，执行表创建
if (require.main === module) {
  const { closeDB } = require('./db');
  createCompanionsTables()
    .then(() => closeDB())
    .catch((err) => {
      console.error(err);
      closeDB();
      process.exit(1);
    });
}
