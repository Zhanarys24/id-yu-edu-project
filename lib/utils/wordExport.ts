import { PortfolioItem, PortfolioFile } from '@/lib/types/portfolio';
import { RegisteredUser } from '@/lib/types/user';

/**
 * Утилиты для экспорта портфолио в Word документ
 */

export const exportPortfolioToWord = (
  user: RegisteredUser, 
  portfolioItems: PortfolioItem[]
): void => {
  try {
    // Создаем HTML контент для Word документа
    const htmlContent = generateWordHTML(user, portfolioItems);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Портфолио_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте в Word:', error);
    alert('Произошла ошибка при экспорте документа');
  }
};

const generateWordHTML = (user: RegisteredUser, portfolioItems: PortfolioItem[]): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'general': return 'Общая информация';
      case 'publications': return 'Публикации и научная деятельность';
      case 'teaching': return 'Преподавательская деятельность';
      case 'achievements': return 'Достижения и награды';
      case 'additional': return 'Дополнительная деятельность';
      default: return type;
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024)} KB`;
    } else {
      return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Группируем элементы по типам
  const groupedItems = portfolioItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, PortfolioItem[]>);

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Портфолио - ${user.name}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 2.5cm 2cm 2.5cm 2cm;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30pt;
          border-bottom: 2pt solid #000;
          padding-bottom: 15pt;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 10pt;
        }
        .subtitle {
          font-size: 14pt;
          margin-bottom: 5pt;
        }
        .date {
          font-size: 10pt;
          color: #666;
        }
        .section {
          margin-bottom: 25pt;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 15pt;
          color: #2c3e50;
          border-bottom: 1pt solid #bdc3c7;
          padding-bottom: 5pt;
        }
        .item {
          margin-bottom: 15pt;
          padding: 10pt;
          border-left: 3pt solid #3498db;
          background-color: #f8f9fa;
        }
        .item-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 5pt;
          color: #2c3e50;
        }
        .item-description {
          margin-bottom: 8pt;
          text-align: justify;
        }
        .item-meta {
          font-size: 10pt;
          color: #666;
          margin-bottom: 5pt;
        }
        .item-files {
          margin-top: 8pt;
          padding-top: 8pt;
          border-top: 1pt solid #e9ecef;
        }
        .file-list {
          font-size: 10pt;
          color: #666;
        }
        .file-item {
          margin-bottom: 3pt;
        }
        .no-data {
          text-align: center;
          color: #999;
          font-style: italic;
          padding: 20pt;
        }
        .user-info {
          background-color: #f1f3f4;
          padding: 15pt;
          margin-bottom: 20pt;
          border-radius: 5pt;
        }
        .user-info h3 {
          margin: 0 0 10pt 0;
          font-size: 12pt;
          color: #2c3e50;
        }
        .user-info p {
          margin: 3pt 0;
          font-size: 11pt;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          margin: 20pt 0;
          padding: 15pt;
          background-color: #e8f4f8;
          border-radius: 5pt;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 16pt;
          font-weight: bold;
          color: #2c3e50;
        }
        .stat-label {
          font-size: 10pt;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ПОРТФОЛИО</div>
        <div class="subtitle">${user.name}</div>
        <div class="date">Дата экспорта: ${currentDate}</div>
      </div>

      <div class="user-info">
        <h3>Информация о пользователе</h3>
        <p><strong>Имя:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Роль:</strong> ${user.role}</p>
        <p><strong>Статус:</strong> ${user.isActive ? 'Активен' : 'Неактивен'}</p>
        <p><strong>Дата регистрации:</strong> ${formatDate(user.registeredAt)}</p>
        ${user.lastLogin ? `<p><strong>Последний вход:</strong> ${formatDate(user.lastLogin)}</p>` : ''}
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${portfolioItems.length}</div>
          <div class="stat-label">Всего записей</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${portfolioItems.filter(item => item.attachments && item.attachments.length > 0).length}</div>
          <div class="stat-label">С файлами</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${Object.keys(groupedItems).length}</div>
          <div class="stat-label">Разделов</div>
        </div>
      </div>

      ${Object.keys(groupedItems).length === 0 ? `
        <div class="section">
          <div class="no-data">
            У пользователя пока нет записей в портфолио
          </div>
        </div>
      ` : ''}

      ${Object.entries(groupedItems).map(([type, items]) => `
        <div class="section">
          <div class="section-title">${getTypeLabel(type)}</div>
          ${items.map(item => `
            <div class="item">
              <div class="item-title">${item.title}</div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
              <div class="item-meta">
                <strong>Дата создания:</strong> ${formatDate(item.createdAt)}<br>
                <strong>Последнее обновление:</strong> ${formatDate(item.updatedAt)}
              </div>
              ${item.attachments && item.attachments.length > 0 ? `
                <div class="item-files">
                  <strong>Прикрепленные файлы:</strong>
                  <div class="file-list">
                    ${item.attachments.map(file => `
                      <div class="file-item">
                        • ${file.name} (${formatFileSize(file.size)}) - ${formatDate(file.uploadedAt)}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}

      <div style="margin-top: 40pt; text-align: center; font-size: 10pt; color: #666;">
        Документ сгенерирован автоматически ${currentDate}
      </div>
    </body>
    </html>
  `;
};
