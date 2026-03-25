// 图片上传工具
export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export class ImageUploader {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // 验证文件
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: '文件大小不能超过 5MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: '只支持 JPG、PNG、GIF、WebP 格式' };
    }

    return { valid: true };
  }

  // 压缩图片
  static async compressImage(file: File, maxWidth: number = 1200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取 canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  // 上传图片到本地存储（模拟）
  static async uploadImage(file: File): Promise<UploadedImage> {
    // 验证文件
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 压缩图片
    const compressed = await this.compressImage(file);

    // 生成唯一 ID
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建文件 URL（实际项目中应该上传到服务器）
    const url = URL.createObjectURL(compressed);

    const uploadedImage: UploadedImage = {
      id,
      name: file.name,
      url,
      size: compressed.size,
      type: compressed.type,
      uploadedAt: new Date().toISOString()
    };

    // 保存到 localStorage（仅用于演示）
    this.saveToLocalStorage(uploadedImage);

    return uploadedImage;
  }

  // 保存到 localStorage
  private static saveToLocalStorage(image: UploadedImage) {
    try {
      const images = this.getStoredImages();
      images.push(image);
      localStorage.setItem('uploaded_images', JSON.stringify(images));
    } catch (error) {
      console.error('保存图片信息失败:', error);
    }
  }

  // 获取已存储的图片
  static getStoredImages(): UploadedImage[] {
    try {
      const stored = localStorage.getItem('uploaded_images');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取图片信息失败:', error);
      return [];
    }
  }

  // 删除图片
  static deleteImage(id: string) {
    try {
      const images = this.getStoredImages().filter((img) => img.id !== id);
      localStorage.setItem('uploaded_images', JSON.stringify(images));
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  }

  // 生成 Markdown 图片语法
  static generateMarkdown(url: string, alt?: string): string {
    return `![${alt || '图片'}](${url})`;
  }
}
