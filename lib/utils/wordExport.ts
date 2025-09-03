import { PortfolioItem, PortfolioFile } from '@/lib/types/portfolio';
import { RegisteredUser } from '@/lib/types/user';

/**
 * Утилиты для экспорта портфолио в Word документ
 * Официальный и профессиональный формат
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
    link.download = `Portfolio_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    
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
      return `${sizeInBytes} байт`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024)} КБ`;
    } else {
      return `${Math.round(sizeInBytes / (1024 * 1024))} МБ`;
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

  // Сортируем элементы по дате создания (сначала новые)
  Object.keys(groupedItems).forEach(type => {
    groupedItems[type].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

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
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 2.5cm 2cm 2.5cm 2cm;
          mso-header-margin: 1.5cm;
          mso-footer-margin: 1.5cm;
        }
        
        body {
          font-family: 'Times New Roman', 'Times', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          text-align: justify;
        }

        /* Заголовки */
        h1, h2, h3, h4 {
          color: #2c5aa0;
          font-weight: bold;
          page-break-after: avoid;
          margin-top: 24pt;
          margin-bottom: 12pt;
        }

        h1 { 
          font-size: 18pt;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1pt;
          border-bottom: 2pt solid #2c5aa0;
          padding-bottom: 6pt;
        }

        h2 { 
          font-size: 16pt;
          border-left: 4pt solid #2c5aa0;
          padding-left: 12pt;
        }

        h3 { 
          font-size: 14pt;
          color: #3366cc;
        }

        h4 { 
          font-size: 12pt;
          color: #666666;
        }

        /* Титульная страница */
        .title-page {
          text-align: center;
          margin-bottom: 48pt;
          page-break-after: always;
          padding: 40pt 0;
        }

        .university-logo {
          font-size: 24pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 12pt;
          text-transform: uppercase;
          letter-spacing: 2pt;
        }

        .university-name {
          font-size: 16pt;
          color: #1a1a1a;
          margin-bottom: 32pt;
          font-weight: normal;
        }

        .document-title {
          font-size: 28pt;
          font-weight: bold;
          color: #2c5aa0;
          margin: 32pt 0;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }

        .user-name {
          font-size: 20pt;
          margin: 24pt 0;
          font-weight: bold;
          color: #1a1a1a;
        }

        .date-info {
          font-size: 12pt;
          color: #666666;
          margin-top: 48pt;
        }

        /* Содержание */
        .table-of-contents {
          margin-bottom: 32pt;
          page-break-after: always;
        }

        .toc-title {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 24pt;
          color: #2c5aa0;
          text-transform: uppercase;
        }

        .toc-item {
          margin-bottom: 6pt;
          padding: 4pt 0;
          border-bottom: 1pt dotted #cccccc;
        }

        .toc-number {
          display: inline-block;
          width: 30pt;
          font-weight: bold;
          color: #2c5aa0;
        }

        .toc-text {
          color: #1a1a1a;
        }

        /* Информация о пользователе */
        .user-info {
          margin-bottom: 32pt;
          padding: 20pt;
          border: 1pt solid #2c5aa0;
          border-radius: 0;
          background-color: #f8f9ff;
        }

        .user-info-title {
          font-size: 14pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 16pt;
          text-align: center;
        }

        .user-info-grid {
          display: table;
          width: 100%;
          border-collapse: collapse;
        }

        .user-info-row {
          display: table-row;
        }

        .user-info-label {
          display: table-cell;
          font-weight: bold;
          color: #1a1a1a;
          padding: 6pt 12pt 6pt 0;
          width: 30%;
          border-bottom: 1pt solid #e0e0e0;
          vertical-align: top;
        }

        .user-info-value {
          display: table-cell;
          padding: 6pt 0;
          color: #333333;
          border-bottom: 1pt solid #e0e0e0;
          vertical-align: top;
        }

        /* Статистика */
        .statistics {
          margin: 24pt 0;
          padding: 16pt;
          background-color: #f0f4f8;
          border: 1pt solid #d0d7de;
        }

        .stats-title {
          font-size: 14pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 12pt;
          text-align: center;
        }

        .stats-grid {
          display: table;
          width: 100%;
          border-collapse: collapse;
        }

        .stats-row {
          display: table-row;
        }

        .stat-cell {
          display: table-cell;
          text-align: center;
          padding: 8pt;
          border: 1pt solid #d0d7de;
          background-color: #ffffff;
        }

        .stat-number {
          font-size: 18pt;
          font-weight: bold;
          color: #2c5aa0;
          display: block;
        }

        .stat-label {
          font-size: 10pt;
          color: #666666;
          margin-top: 4pt;
        }

        /* Разделы портфолио */
        .portfolio-section {
          margin-bottom: 32pt;
          page-break-inside: avoid;
        }

        .section-header {
          background-color: #2c5aa0;
          color: #ffffff;
          padding: 12pt;
          margin-bottom: 16pt;
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }

        /* Элементы портфолио */
        .portfolio-item {
          margin-bottom: 24pt;
          padding: 16pt;
          border: 1pt solid #d0d7de;
          border-left: 4pt solid #2c5aa0;
          background-color: #fafbfc;
          page-break-inside: avoid;
        }

        .item-header {
          margin-bottom: 12pt;
          padding-bottom: 8pt;
          border-bottom: 1pt solid #e0e0e0;
        }

        .item-title {
          font-size: 13pt;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 6pt;
        }

        .item-meta {
          font-size: 10pt;
          color: #666666;
          font-style: italic;
        }

        .item-description {
          margin: 12pt 0;
          line-height: 1.6;
          text-align: justify;
          color: #333333;
        }

        .item-files {
          margin-top: 12pt;
          padding-top: 12pt;
          border-top: 1pt solid #e0e0e0;
        }

        .files-title {
          font-size: 11pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 8pt;
        }

        .file-list {
          margin-left: 16pt;
        }

        .file-item {
          margin-bottom: 4pt;
          padding: 4pt 8pt;
          background-color: #ffffff;
          border: 1pt solid #e0e0e0;
          border-left: 3pt solid #28a745;
          font-size: 10pt;
        }

        .file-name {
          font-weight: bold;
          color: #1a1a1a;
        }

        .file-details {
          color: #666666;
          font-size: 9pt;
          margin-top: 2pt;
        }

        /* Пустое состояние */
        .empty-state {
          text-align: center;
          padding: 40pt;
          color: #666666;
          font-style: italic;
        }

        /* Подвал документа */
        .document-footer {
          margin-top: 48pt;
          padding-top: 16pt;
          border-top: 2pt solid #2c5aa0;
          text-align: center;
          font-size: 10pt;
          color: #666666;
        }

        .footer-university {
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 4pt;
        }

        .footer-date {
          font-style: italic;
        }

        /* Разрывы страниц */
        .page-break {
          page-break-before: always;
        }

        .avoid-break {
          page-break-inside: avoid;
        }

        /* Нумерация страниц */
        .page-number:after {
          content: counter(page);
        }

        /* Таблицы */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
        }

        th {
          background-color: #2c5aa0;
          color: #ffffff;
          padding: 8pt;
          text-align: left;
          font-weight: bold;
        }

        td {
          padding: 6pt 8pt;
          border: 1pt solid #d0d7de;
          vertical-align: top;
        }

        tr:nth-child(even) {
          background-color: #f8f9ff;
        }
      </style>
    </head>
    <body>
      <!-- Титульная страница -->
      <div class="title-page">
        <div class="university-logo">YU</div>
        <div class="university-name">Университет имени Есенова</div>
        
        <div class="document-title">Портфолио</div>
        
        <div class="user-name">${user.name}</div>
        
        <div class="date-info">
          Дата формирования документа: ${currentDate}
        </div>
      </div>

      <!-- Содержание -->
      ${Object.keys(groupedItems).length > 0 ? `
        <div class="table-of-contents">
          <div class="toc-title">Содержание</div>
          
          <div class="toc-item">
            <span class="toc-number">1.</span>
            <span class="toc-text">Информация о пользователе</span>
          </div>
          
          <div class="toc-item">
            <span class="toc-number">2.</span>
            <span class="toc-text">Общая статистика</span>
          </div>
          
          ${Object.keys(groupedItems).map((type, index) => `
            <div class="toc-item">
              <span class="toc-number">${index + 3}.</span>
              <span class="toc-text">${getTypeLabel(type)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Информация о пользователе -->
      <h1>1. Информация о пользователе</h1>
      <div class="user-info">
        <div class="user-info-title">Персональные данные</div>
        <div class="user-info-grid">
          <div class="user-info-row">
            <div class="user-info-label">Полное имя:</div>
            <div class="user-info-value">${user.name}</div>
          </div>
          <div class="user-info-row">
            <div class="user-info-label">Электронная почта:</div>
            <div class="user-info-value">${user.email}</div>
          </div>
          <div class="user-info-row">
            <div class="user-info-label">Роль в системе:</div>
            <div class="user-info-value">${user.role}</div>
          </div>
          <div class="user-info-row">
            <div class="user-info-label">Статус аккаунта:</div>
            <div class="user-info-value">${user.isActive ? 'Активен' : 'Неактивен'}</div>
          </div>
          <div class="user-info-row">
            <div class="user-info-label">Дата регистрации:</div>
            <div class="user-info-value">${formatDate(user.registeredAt)}</div>
          </div>
          ${user.lastLogin ? `
            <div class="user-info-row">
              <div class="user-info-label">Последний вход:</div>
              <div class="user-info-value">${formatDate(user.lastLogin)}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Статистика -->
      <h1>2. Общая статистика портфолио</h1>
      <div class="statistics">
        <div class="stats-title">Сводная информация</div>
        <div class="stats-grid">
          <div class="stats-row">
            <div class="stat-cell">
              <span class="stat-number">${portfolioItems.length}</span>
              <div class="stat-label">Всего записей</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${portfolioItems.filter(item => item.attachments && item.attachments.length > 0).length}</span>
              <div class="stat-label">Записей с файлами</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${Object.keys(groupedItems).length}</span>
              <div class="stat-label">Разделов</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${portfolioItems.reduce((total, item) => total + (item.attachments ? item.attachments.length : 0), 0)}</span>
              <div class="stat-label">Прикрепленных файлов</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Содержимое портфолио -->
      ${Object.keys(groupedItems).length === 0 ? `
        <div class="empty-state">
          <h2>Портфолио пустое</h2>
          <p>У пользователя пока нет записей в портфолио.</p>
        </div>
      ` : ''}

      ${Object.entries(groupedItems).map(([type, items], sectionIndex) => `
        <div class="page-break"></div>
        <div class="portfolio-section">
          <h1>${sectionIndex + 3}. ${getTypeLabel(type)}</h1>
          
          <p><strong>Количество записей в разделе:</strong> ${items.length}</p>
          
          ${items.map((item, itemIndex) => `
            <div class="portfolio-item avoid-break">
              <div class="item-header">
                <div class="item-title">${sectionIndex + 3}.${itemIndex + 1}. ${item.title}</div>
                <div class="item-meta">
                  Создано: ${formatDate(item.createdAt)} | 
                  Обновлено: ${formatDate(item.updatedAt)}
                </div>
              </div>
              
              ${item.description ? `
                <div class="item-description">
                  <h4>Описание:</h4>
                  <p>${item.description.replace(/\n/g, '</p><p>')}</p>
                </div>
              ` : ''}
              
              ${item.attachments && item.attachments.length > 0 ? `
                <div class="item-files">
                  <div class="files-title">Прикрепленные файлы (${item.attachments.length}):</div>
                  <div class="file-list">
                    ${item.attachments.map((file, fileIndex) => `
                      <div class="file-item">
                        <div class="file-name">${fileIndex + 1}. ${file.name}</div>
                        <div class="file-details">
                          Размер: ${formatFileSize(file.size)} | 
                          Загружен: ${formatDate(file.uploadedAt)}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div class="item-files">
                  <div class="files-title">Прикрепленных файлов нет</div>
                </div>
              `}
            </div>
          `).join('')}
        </div>
      `).join('')}

      <!-- Подвал документа -->
      <div class="document-footer">
        <div class="footer-university">Университет имени Есенова (YU)</div>
        <div class="footer-date">Документ сформирован ${currentDate}</div>
        <div style="margin-top: 8pt; font-size: 9pt;">
          Система управления портфолио
        </div>
      </div>
    </body>
    </html>
  `;
};