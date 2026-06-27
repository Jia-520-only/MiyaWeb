const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const thumbDir = path.join(uploadDir, 'thumbnails');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif,webp,pdf,md,txt,epub')
    .split(',')
    .map(ext => ext.trim().toLowerCase());
  
  const extension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${extension}。只支持: ${allowedExtensions.join(', ')}`));
  }
};

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 按年份和月份创建目录
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const dir = path.join(uploadDir, year.toString(), month);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机字符串 + 原扩展名
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const extension = path.extname(file.originalname);
    
    cb(null, `${timestamp}_${random}${extension}`);
  }
});

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10 // 最多10个文件
  }
});

// 生成缩略图
const generateThumbnail = async (filePath, filename) => {
  try {
    // 只对图片生成缩略图
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = path.extname(filename).toLowerCase().substring(1);
    
    if (!imageExtensions.includes(extension)) {
      return null;
    }
    
    // 创建缩略图路径
    const thumbFilename = `thumb_${path.basename(filename, path.extname(filename))}.webp`;
    const thumbPath = path.join(thumbDir, thumbFilename);
    
    // 生成缩略图（300x300，自适应裁剪）
    await sharp(filePath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);
    
    return thumbPath;
    
  } catch (error) {
    console.warn('生成缩略图失败:', error.message);
    return null;
  }
};

// 压缩图片（上传时自动调用）
const compressImage = async (filePath, maxWidth = 1920, quality = 80) => {
  try {
    const extension = path.extname(filePath).toLowerCase().substring(1);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    if (!imageExtensions.includes(extension)) return false;

    const metadata = await sharp(filePath).metadata();
    // 只压缩超过 maxWidth 的大图
    if (metadata.width && metadata.width <= maxWidth) return false;

    const outputPath = filePath; // 原地压缩
    const options = { quality };

    if (extension === 'png') {
      // 大 PNG 转为 WebP 节省空间
      await sharp(filePath)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .webp(options)
        .toFile(outputPath + '.webp');
      fs.renameSync(outputPath + '.webp', outputPath.replace(`.${extension}`, '.webp'));
      return true; // 返回 true 表示文件名已改变
    } else {
      await sharp(filePath)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .jpeg(options)
        .toFile(outputPath);
      return false;
    }
  } catch (error) {
    console.warn('压缩图片失败:', error.message);
    return false;
  }
};

// 获取文件信息
const getFileInfo = async (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const extension = path.extname(filePath).toLowerCase().substring(1);
    
    const info = {
      size: stats.size,
      mimeType: getMimeType(extension),
      extension: extension
    };
    
    // 如果是图片，获取尺寸
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      try {
        const metadata = await sharp(filePath).metadata();
        info.width = metadata.width;
        info.height = metadata.height;
      } catch (e) {
        console.warn('获取图片尺寸失败:', e.message);
      }
    }
    
    return info;
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return null;
  }
};

// 根据扩展名获取MIME类型
const getMimeType = (extension) => {
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

// 清理临时文件
const cleanupTempFiles = (files) => {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    return;
  }
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.warn('清理临时文件失败:', error.message);
    }
  });
};

// 获取文件相对路径（用于URL）
const getRelativePath = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const serverRoot = path.resolve(process.cwd());
  
  if (absolutePath.startsWith(serverRoot)) {
    return absolutePath.substring(serverRoot.length).replace(/\\/g, '/');
  }
  
  return filePath;
};

module.exports = {
  upload,
  generateThumbnail,
  compressImage,
  getFileInfo,
  cleanupTempFiles,
  getRelativePath,
  uploadDir,
  thumbDir
};