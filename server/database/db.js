const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保数据库目录存在
const dbDir = path.dirname(process.env.DATABASE_PATH || './database/jiaandmiya.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(
  process.env.DATABASE_PATH || './database/jiaandmiya.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
    } else {
      console.log('✅ 已连接到 SQLite 数据库');
      db.run('PRAGMA foreign_keys = ON;');
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = NORMAL;');
      db.run('PRAGMA cache_size = -64000;');
      db.run('PRAGMA temp_store = MEMORY;');
      db.run('PRAGMA mmap_size = 268435456;');
      db.run('PRAGMA busy_timeout = 5000;');
    }
  }
);

// 数据库查询辅助函数
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// 关闭数据库连接（用于测试和清理）
const closeDB = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = {
  db,
  dbAll,
  dbGet,
  dbRun,
  closeDB
};