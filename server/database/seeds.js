const bcrypt = require('bcryptjs');
const { dbRun } = require('./db');

// 创建默认管理员账户
const createDefaultAdmin = async () => {
  try {
    const adminCheck = await require('./db').dbGet('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
    
    if (adminCheck) {
      console.log('✅ 管理员账户已存在');
      return;
    }
    
    // 从环境变量获取管理员凭据
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jiaandmiya.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    // 插入管理员账户
    await dbRun(
      `INSERT INTO users (username, email, password_hash, role, display_name, is_active) 
       VALUES (?, ?, ?, 'admin', ?, 1)`,
      [adminUsername, adminEmail, passwordHash, '网站管理员']
    );
    
    console.log(`✅ 已创建默认管理员账户`);
    console.log(`👤 用户名: ${adminUsername}`);
    console.log(`📧 邮箱: ${adminEmail}`);
    console.log(`🔑 密码: ${adminPassword.charAt(0)}${'*'.repeat(Math.max(0, adminPassword.length - 1))}`);
    console.log('⚠️  请立即修改默认密码！');
  } catch (error) {
    console.error('❌ 创建默认数据失败:', error);
    throw error;
  }
};


module.exports = {
  createDefaultAdmin
};