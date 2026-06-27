// 验证工具函数

const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

const isStrongPassword = (password) => {
  // 至少8个字符，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const validateUserRegistration = (data) => {
  const errors = {};
  
  // 验证用户名
  if (!data.username) {
    errors.username = '用户名不能为空';
  } else if (!isUsername(data.username)) {
    errors.username = '用户名只能包含字母、数字、下划线和连字符，长度3-20位';
  }
  
  // 验证邮箱
  if (!data.email) {
    errors.email = '邮箱不能为空';
  } else if (!isEmail(data.email)) {
    errors.email = '邮箱格式不正确';
  }
  
  // 验证密码
  if (!data.password) {
    errors.password = '密码不能为空';
  } else if (!isStrongPassword(data.password)) {
    errors.password = '密码至少8位，需包含字母和数字';
  }
  
  // 验证确认密码
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateLogin = (data) => {
  const errors = {};
  
  if (!data.username) {
    errors.username = '用户名或邮箱不能为空';
  }
  
  if (!data.password) {
    errors.password = '密码不能为空';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateArticle = (data) => {
  const errors = {};
  
  // 验证标题
  if (!data.title || data.title.trim().length === 0) {
    errors.title = '文章标题不能为空';
  } else if (data.title.length > 255) {
    errors.title = '文章标题不能超过255个字符';
  }
  
  // 验证内容
  if (!data.content || data.content.trim().length === 0) {
    errors.content = '文章内容不能为空';
  }
  
  // 验证分类
  if (data.category_id && !Number.isInteger(parseInt(data.category_id))) {
    errors.category_id = '分类ID格式不正确';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateContentItem = (data) => {
  const errors = {};
  
  // 验证类型
  const allowedTypes = ['text', 'markdown', 'link', 'image', 'array', 'object'];
  if (!data.type || !allowedTypes.includes(data.type)) {
    errors.type = `类型必须是: ${allowedTypes.join(', ')}`;
  }
  
  // 验证标题
  if (!data.title || data.title.trim().length === 0) {
    errors.title = '标题不能为空';
  }
  
  // 验证内容
  if (typeof data.content === 'undefined' || data.content === null) {
    errors.content = '内容不能为空';
  }
  
  // 验证页面
  if (!data.page || data.page.trim().length === 0) {
    errors.page = '页面标识不能为空';
  }
  
  // 验证区域
  if (!data.section || data.section.trim().length === 0) {
    errors.section = '区域标识不能为空';
  }
  
  // 验证JSON格式（如果是array或object类型）
  if (data.type === 'array' || data.type === 'object') {
    try {
      JSON.parse(data.content);
    } catch (e) {
      errors.content = '内容必须是有效的JSON格式';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateFileUpload = (file, allowedExtensions, maxSize) => {
  const errors = {};
  
  if (!file) {
    errors.file = '未选择文件';
    return { isValid: false, errors };
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    errors.size = `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  // 检查文件扩展名
  const extension = file.originalname.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.extension = `只支持以下格式: ${allowedExtensions.join(', ')}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 清理和规范化输入
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeInput(value);
  }
  return sanitized;
};

module.exports = {
  isEmail,
  isUsername,
  isStrongPassword,
  validateUserRegistration,
  validateLogin,
  validateArticle,
  validateContentItem,
  validateFileUpload,
  sanitizeInput,
  sanitizeObject
};