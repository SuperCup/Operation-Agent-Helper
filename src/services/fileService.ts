interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  url?: string;
  previewUrl?: string;
  uploadedAt: Date;
  sessionId?: string;
  taskId?: string;
  fileType?: 'reference' | 'material' | 'data' | 'other';
}

class FileService {
  private dbName = 'FileDB';
  private dbVersion = 1;
  private storeName = 'files';

  /**
   * 初始化IndexedDB
   */
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('taskId', 'taskId', { unique: false });
          store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
      };
    });
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    options?: {
      sessionId?: string;
      taskId?: string;
      fileType?: 'reference' | 'material' | 'data' | 'other';
    }
  ): Promise<StoredFile> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 读取文件为Blob
    const blob = new Blob([file], { type: file.type });

    const storedFile: StoredFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: blob,
      uploadedAt: new Date(),
      sessionId: options?.sessionId,
      taskId: options?.taskId,
      fileType: options?.fileType || 'other',
    };

    // 生成预览URL（如果是图片）
    if (file.type.startsWith('image/')) {
      storedFile.previewUrl = URL.createObjectURL(blob);
    }

    // 存储到IndexedDB
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(storedFile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }

    return storedFile;
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    options?: {
      sessionId?: string;
      taskId?: string;
      fileType?: 'reference' | 'material' | 'data' | 'other';
    }
  ): Promise<StoredFile[]> {
    const results: StoredFile[] = [];
    for (const file of files) {
      try {
        const storedFile = await this.uploadFile(file, options);
        results.push(storedFile);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
      }
    }
    return results;
  }

  /**
   * 获取文件
   */
  async getFile(fileId: string): Promise<StoredFile | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      return new Promise<StoredFile | null>((resolve, reject) => {
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get file:', error);
      return null;
    }
  }

  /**
   * 获取文件列表
   */
  async getFiles(options?: {
    sessionId?: string;
    taskId?: string;
    fileType?: 'reference' | 'material' | 'data' | 'other';
  }): Promise<StoredFile[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      let files: StoredFile[] = [];

      if (options?.sessionId) {
        const index = store.index('sessionId');
        files = await new Promise<StoredFile[]>((resolve, reject) => {
          const request = index.getAll(options.sessionId!);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else if (options?.taskId) {
        const index = store.index('taskId');
        files = await new Promise<StoredFile[]>((resolve, reject) => {
          const request = index.getAll(options.taskId!);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        files = await new Promise<StoredFile[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      return options?.fileType
        ? files.filter((f) => f.fileType === options.fileType)
        : files;
    } catch (error) {
      console.error('Failed to get files:', error);
      return [];
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const file = await this.getFile(fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }

      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      try {
        await this.deleteFile(fileId);
      } catch (error) {
        console.error(`Failed to delete file ${fileId}:`, error);
      }
    }
  }

  /**
   * 获取文件URL（用于下载/预览）
   */
  async getFileURL(fileId: string): Promise<string> {
    const file = await this.getFile(fileId);
    if (!file) throw new Error('File not found');

    if (file.url) {
      return file.url;
    }

    // 生成临时URL
    const url = URL.createObjectURL(file.data);
    return url;
  }

  /**
   * 预览文件（图片/PDF）
   */
  async previewFile(fileId: string): Promise<string> {
    const file = await this.getFile(fileId);
    if (!file) throw new Error('File not found');

    if (file.previewUrl) {
      return file.previewUrl;
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file.data);
      return url;
    }

    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file.data);
      return url;
    }

    throw new Error('File type not supported for preview');
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: string, filename?: string): Promise<void> {
    const file = await this.getFile(fileId);
    if (!file) throw new Error('File not found');

    const url = await this.getFileURL(fileId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理临时URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        return {
          used,
          quota,
          percentage: quota > 0 ? (used / quota) * 100 : 0,
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return { used: 0, quota: 0, percentage: 0 };
  }

  /**
   * 清理旧文件
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const index = store.index('uploadedAt');
      
      return new Promise<number>((resolve, reject) => {
        let deletedCount = 0;
        const request = index.openCursor();
        
        request.onsuccess = (event) => {
          const target = event.target as IDBRequest<IDBCursorWithValue | null>;
          const cursor = target.result;
          if (cursor) {
            const file = cursor.value as StoredFile;
            if (file.uploadedAt < cutoffDate) {
              if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
              }
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          } else {
            resolve(deletedCount);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to cleanup old files:', error);
      return 0;
    }
  }

  /**
   * 获取文件大小（格式化）
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}

export const fileService = new FileService();
