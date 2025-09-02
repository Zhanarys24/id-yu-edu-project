import { PortfolioFile } from '@/lib/types/portfolio';

/**
 * Утилиты для работы с файлами портфолио
 */

export const downloadFile = (file: PortfolioFile): void => {
  try {
    // Создаем ссылку для скачивания файла
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
    // Fallback: открываем файл в новой вкладке
    window.open(file.url, '_blank');
  }
};

export const downloadAllFiles = (files: PortfolioFile[]): void => {
  files.forEach((file, index) => {
    // Добавляем небольшую задержку между скачиваниями
    setTimeout(() => {
      downloadFile(file);
    }, index * 500);
  });
};

export const getFileSizeString = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  } else {
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
  }
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileTypeFromExtension = (filename: string): 'pdf' | 'image' | 'document' => {
  const extension = getFileExtension(filename);
  
  if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return 'image';
  } else {
    return 'document';
  }
};

export const isImageFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
};

export const isPdfFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'pdf';
};

export const isDocumentFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension);
};

export const formatFileDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const createFilePreviewUrl = (file: PortfolioFile): string | null => {
  if (isImageFile(file.name)) {
    return file.url;
  }
  return null;
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = getFileExtension(file.name);
  return allowedTypes.some(type => {
    const cleanType = type.replace('.', '');
    return fileExtension === cleanType;
  });
};
