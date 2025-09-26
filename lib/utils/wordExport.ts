import { PortfolioItem, PortfolioFile, GeneralInfo, Publication, TeachingActivity, Achievement, AdditionalActivity } from '@/lib/types/portfolio';
import { RegisteredUser } from '@/lib/types/user';
import { UserClickData, EducationCategory } from '@/lib/types/education';

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
      case 'general': return 'Общая информация и профессиональный профиль';
      case 'publications': return 'Научные публикации и исследовательская деятельность';
      case 'teaching': return 'Преподавательская деятельность и образовательные программы';
      case 'achievements': return 'Достижения, награды и сертификаты';
      case 'additional': return 'Дополнительная деятельность и общественная работа';
      default: return type;
    }
  };

  const getTypeDescription = (type: string): string => {
    switch (type) {
      case 'general': return 'Основная информация о профессиональном профиле, образовании, опыте работы и ключевых компетенциях';
      case 'publications': return 'Научные статьи, монографии, доклады на конференциях и другие публикации';
      case 'teaching': return 'Преподаваемые дисциплины, образовательные программы, методическая работа';
      case 'achievements': return 'Награды, сертификаты, дипломы, достижения в профессиональной деятельности';
      case 'additional': return 'Участие в проектах, общественная деятельность, волонтерство, консультации';
      default: return '';
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

  // Создаем подробную статистику
  const detailedStats = {
    totalItems: portfolioItems.length,
    itemsWithFiles: portfolioItems.filter(item => item.attachments && item.attachments.length > 0).length,
    totalFiles: portfolioItems.reduce((total, item) => total + (item.attachments ? item.attachments.length : 0), 0),
    totalFileSize: portfolioItems.reduce((total, item) => 
      total + (item.attachments ? item.attachments.reduce((fileTotal, file) => fileTotal + file.size, 0) : 0), 0),
    sectionsCount: Object.keys(groupedItems).length,
    recentActivity: portfolioItems.filter(item => {
      const itemDate = new Date(item.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return itemDate > thirtyDaysAgo;
    }).length
  };

  const getFileTypeStats = () => {
    const fileTypes = portfolioItems.reduce((acc, item) => {
      if (item.attachments) {
        item.attachments.forEach(file => {
          acc[file.type] = (acc[file.type] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(fileTypes).map(([type, count]) => 
      `${type.toUpperCase()}: ${count}`
    ).join(' | ');
  };

  // Функция для детального отображения каждого типа записи
  const renderDetailedPortfolioItem = (item: PortfolioItem, itemIndex: number, sectionIndex: number): string => {
    const baseInfo = `
      <div class="portfolio-item avoid-break">
        <div class="item-header">
          <div class="item-type-badge">${item.type.toUpperCase()}</div>
          <div class="item-title">${sectionIndex + 3}.${itemIndex + 1}. ${item.title}</div>
          <div class="item-meta">
            📅 Создано: ${formatDate(item.createdAt)} | 
            🔄 Обновлено: ${formatDate(item.updatedAt)}
            ${item.date ? ` | 📆 Дата события: ${formatDate(item.date)}` : ''}
          </div>
        </div>
    `;

    let detailedContent = '';

    // Детальное отображение в зависимости от типа
    switch (item.type) {
      case 'general':
        const generalItem = item as GeneralInfo; // Приводим к типу GeneralInfo
        detailedContent = `
          <div class="item-description">
            <h4>👤 Полное имя:</h4>
            <p><strong>${generalItem.fullName || 'Не указано'}</strong></p>
            
            <h4>💼 Должность:</h4>
            <p>${generalItem.position || 'Не указано'}</p>
            
            <h4>🏢 Отдел/Кафедра:</h4>
            <p>${generalItem.department || 'Не указано'}</p>
            
            <h4>🎓 Образование:</h4>
            <p>${generalItem.education || 'Не указано'}</p>
            
            <h4>💼 Опыт работы:</h4>
            <p>${generalItem.experience || 'Не указано'}</p>
            
            <h4>🛠️ Навыки и компетенции:</h4>
            <ul>
              ${generalItem.skills && generalItem.skills.length > 0 
                ? generalItem.skills.map((skill: string) => `<li>${skill}</li>`).join('')
                : '<li>Навыки не указаны</li>'
              }
            </ul>
            
            <h4>🌍 Языки:</h4>
            <ul>
              ${generalItem.languages && generalItem.languages.length > 0 
                ? generalItem.languages.map((lang: string) => `<li>${lang}</li>`).join('')
                : '<li>Языки не указаны</li>'
              }
            </ul>
            
            <h4>📞 Контактная информация:</h4>
            <ul>
              <li><strong>Email:</strong> ${generalItem.contactInfo?.email || 'Не указан'}</li>
              <li><strong>Телефон:</strong> ${generalItem.contactInfo?.phone || 'Не указан'}</li>
              <li><strong>Адрес:</strong> ${generalItem.contactInfo?.address || 'Не указан'}</li>
            </ul>
          </div>
        `;
        break;

      case 'publications':
        const pubItem = item as Publication; // Приводим к типу Publication
        detailedContent = `
          <div class="item-description">
            <h4>📚 Название публикации:</h4>
            <p><strong>${pubItem.title || 'Не указано'}</strong></p>
            
            <h4>👥 Авторы:</h4>
            <ul>
              ${pubItem.authors && pubItem.authors.length > 0 
                ? pubItem.authors.map((author: string) => `<li>${author}</li>`).join('')
                : '<li>Авторы не указаны</li>'
              }
            </ul>
            
            <h4>📖 Журнал/Издание:</h4>
            <p>${pubItem.journal || 'Не указано'}</p>
            
            <h4>📅 Год публикации:</h4>
            <p>${pubItem.year || 'Не указан'}</p>
            
            <h4>🔗 DOI:</h4>
            <p>${pubItem.doi || 'Не указан'}</p>
            
            <h4>🌐 URL:</h4>
            <p>${pubItem.url ? `<a href="${pubItem.url}" target="_blank">${pubItem.url}</a>` : 'Не указан'}</p>
            
            <h4>📊 Импакт-фактор:</h4>
            <p>${pubItem.impactFactor || 'Не указан'}</p>
            
            <h4>📈 Количество цитирований:</h4>
            <p>${pubItem.citations || 'Не указано'}</p>
          </div>
        `;
        break;

      case 'teaching':
        const teachingItem = item as TeachingActivity; // Приводим к типу TeachingActivity
        detailedContent = `
          <div class="item-description">
            <h4>📚 Название курса:</h4>
            <p><strong>${teachingItem.courseName || 'Не указано'}</strong></p>
            
            <h4>🔢 Код курса:</h4>
            <p>${teachingItem.courseCode || 'Не указан'}</p>
            
            <h4>📅 Семестр:</h4>
            <p>${teachingItem.semester || 'Не указан'}</p>
            
            <h4>📅 Год:</h4>
            <p>${teachingItem.year || 'Не указан'}</p>
            
            <h4>👥 Количество студентов:</h4>
            <p>${teachingItem.studentsCount || 'Не указано'}</p>
            
            <h4>⭐ Оценка курса:</h4>
            <p>${teachingItem.evaluation || 'Не указана'}</p>
            
            <h4>📝 Описание курса:</h4>
            <p>${teachingItem.description || 'Описание не предоставлено'}</p>
          </div>
        `;
        break;

      case 'achievements':
        const achievementItem = item as Achievement; // Приводим к типу Achievement
        const categoryLabels = {
          'certificate': 'Сертификат',
          'diploma': 'Диплом',
          'award': 'Награда',
          'test': 'Тест/Экзамен',
          'other': 'Другое'
        };
        detailedContent = `
          <div class="item-description">
            <h4>🏆 Название достижения:</h4>
            <p><strong>${achievementItem.title || 'Не указано'}</strong></p>
            
            <h4>🏢 Выдающая организация:</h4>
            <p>${achievementItem.issuer || 'Не указана'}</p>
            
            <h4>📅 Дата получения:</h4>
            <p>${achievementItem.date ? formatDate(achievementItem.date) : 'Не указана'}</p>
            
            <h4>🏷️ Категория:</h4>
            <p>${categoryLabels[achievementItem.category as keyof typeof categoryLabels] || achievementItem.category || 'Не указана'}</p>
            
            <h4>📊 Оценка/Балл:</h4>
            <p>${achievementItem.score || 'Не указан'}</p>
            
            <h4>⏰ Срок действия:</h4>
            <p>${achievementItem.validityPeriod || 'Не указан'}</p>
            
            <h4>📝 Описание:</h4>
            <p>${achievementItem.description || 'Описание не предоставлено'}</p>
          </div>
        `;
        break;

      case 'additional':
        const additionalItem = item as AdditionalActivity; // Приводим к типу AdditionalActivity
        detailedContent = `
          <div class="item-description">
            <h4>📋 Название деятельности:</h4>
            <p><strong>${additionalItem.title || 'Не указано'}</strong></p>
            
            <h4>🏢 Организация:</h4>
            <p>${additionalItem.organization || 'Не указана'}</p>
            
            <h4>👤 Роль/Должность:</h4>
            <p>${additionalItem.role || 'Не указана'}</p>
            
            <h4>📅 Дата начала:</h4>
            <p>${additionalItem.startDate ? formatDate(additionalItem.startDate) : 'Не указана'}</p>
            
            <h4>📅 Дата окончания:</h4>
            <p>${additionalItem.endDate ? formatDate(additionalItem.endDate) : 'По настоящее время'}</p>
            
            <h4>📝 Описание деятельности:</h4>
            <p>${additionalItem.description || 'Описание не предоставлено'}</p>
            
            <h4>💡 Влияние/Результат:</h4>
            <p>${additionalItem.impact || 'Не указано'}</p>
          </div>
        `;
        break;

      default:
        // Для других типов показываем базовую информацию
        detailedContent = `
          <div class="item-description">
            <h4>📝 Описание:</h4>
            <p>${item.description || 'Описание не предоставлено'}</p>
          </div>
        `;
    }

    // Добавляем метаданные, если они есть
    const metadataContent = item.metadata && Object.keys(item.metadata).length > 0 ? `
      <div class="item-description">
        <h4>📋 Дополнительная информация:</h4>
        <ul>
          ${Object.entries(item.metadata).map(([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
          `).join('')}
        </ul>
      </div>
    ` : '';

    // Добавляем файлы
    const filesContent = item.attachments && item.attachments.length > 0 ? `
      <div class="item-files">
        <div class="files-title">📎 Прикрепленные файлы (${item.attachments.length}):</div>
        <div class="file-list">
          ${item.attachments.map((file, fileIndex) => `
            <div class="file-item">
              <div class="file-name">${fileIndex + 1}. ${file.name}</div>
              <div class="file-details">
                📏 Размер: ${formatFileSize(file.size)} | 
                📅 Загружен: ${formatDate(file.uploadedAt)} | 
                🏷️ Тип: ${file.type.toUpperCase()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="item-files">
        <div class="files-title">📎 Прикрепленных файлов нет</div>
      </div>
    `;

    return baseInfo + detailedContent + metadataContent + filesContent + '</div>';
  };

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
          text-align: left;
        }

        /* Заголовки */
        h1, h2, h3, h4, h5 {
          color: #2c5aa0;
          font-weight: bold;
          page-break-after: avoid;
          margin-top: 24pt;
          margin-bottom: 12pt;
        }

        h1 { 
          font-size: 20pt;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1.5pt;
          border-bottom: 3pt solid #2c5aa0;
          padding-bottom: 8pt;
          margin-bottom: 20pt;
          box-shadow: 0 2pt 4pt rgba(44, 90, 160, 0.1);
        }

        h2 { 
          font-size: 16pt;
          border-left: 5pt solid #2c5aa0;
          padding-left: 15pt;
          background: linear-gradient(90deg, #f8f9ff 0%, transparent 100%);
          padding: 12pt 15pt;
          margin: 20pt 0 16pt 0;
          border-radius: 0 8pt 8pt 0;
        }

        h3 { 
          font-size: 14pt;
          color: #3366cc;
          border-bottom: 1pt solid #e0e6ff;
          padding-bottom: 6pt;
          margin-bottom: 12pt;
        }

        h4 { 
          font-size: 12pt;
          color: #4a5568;
          font-weight: 600;
          margin-bottom: 8pt;
        }

        h5 {
          font-size: 11pt;
          color: #666666;
          font-weight: 500;
          margin-bottom: 6pt;
        }

        /* Титульная страница */
        .title-page {
          text-align: center;
          margin-bottom: 48pt;
          page-break-after: always;
          padding: 60pt 40pt;
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          border: 2pt solid #e0e6ff;
        }

        .university-logo {
          font-size: 32pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 16pt;
          text-transform: uppercase;
          letter-spacing: 3pt;
          text-shadow: 2pt 2pt 4pt rgba(44, 90, 160, 0.1);
        }

        .university-name {
          font-size: 18pt;
          color: #1a1a1a;
          margin-bottom: 40pt;
          font-weight: 500;
          line-height: 1.4;
        }

        .document-title {
          font-size: 32pt;
          font-weight: bold;
          color: #2c5aa0;
          margin: 40pt 0;
          text-transform: uppercase;
          letter-spacing: 2pt;
          text-shadow: 1pt 1pt 2pt rgba(44, 90, 160, 0.1);
        }

        .user-name {
          font-size: 24pt;
          margin: 32pt 0;
          font-weight: bold;
          color: #1a1a1a;
          text-shadow: 1pt 1pt 2pt rgba(0, 0, 0, 0.05);
        }

        .user-role {
          font-size: 16pt;
          color: #4a5568;
          margin-bottom: 20pt;
          font-style: italic;
        }

        .date-info {
          font-size: 14pt;
          color: #666666;
          margin-top: 60pt;
          padding: 16pt;
          background-color: #f8f9ff;
          border: 1pt solid #e0e6ff;
          border-radius: 8pt;
          display: inline-block;
        }

        .document-subtitle {
          font-size: 14pt;
          color: #4a5568;
          margin: 20pt 0;
          font-style: italic;
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
          margin-bottom: 40pt;
          page-break-inside: avoid;
        }

        .section-header {
          background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
          color: #ffffff;
          padding: 20pt;
          margin-bottom: 24pt;
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1.5pt;
          border-radius: 8pt;
          box-shadow: 0 4pt 8pt rgba(44, 90, 160, 0.2);
        }

        .section-description {
          background-color: #f8f9ff;
          border-left: 4pt solid #2c5aa0;
          padding: 16pt;
          margin-bottom: 24pt;
          font-style: italic;
          color: #4a5568;
          border-radius: 0 8pt 8pt 0;
        }

        .section-stats {
          background-color: #e8f4fd;
          border: 1pt solid #b3d9ff;
          padding: 12pt;
          margin-bottom: 20pt;
          border-radius: 6pt;
          text-align: center;
        }

        .stats-text {
          font-weight: bold;
          color: #2c5aa0;
          font-size: 12pt;
        }

        /* Элементы портфолио */
        .portfolio-item {
          margin-bottom: 28pt;
          padding: 20pt;
          border: 2pt solid #e0e6ff;
          border-left: 6pt solid #2c5aa0;
          background: linear-gradient(135deg, #fafbfc 0%, #f8f9ff 100%);
          page-break-inside: avoid;
          border-radius: 0 8pt 8pt 0;
          box-shadow: 0 2pt 6pt rgba(44, 90, 160, 0.1);
        }

        .item-header {
          margin-bottom: 16pt;
          padding-bottom: 12pt;
          border-bottom: 2pt solid #e0e6ff;
        }

        .item-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 8pt;
          line-height: 1.3;
        }

        .item-meta {
          font-size: 11pt;
          color: #4a5568;
          font-style: italic;
          background-color: #f0f4f8;
          padding: 6pt 10pt;
          border-radius: 4pt;
          display: inline-block;
        }

        .item-type-badge {
          display: inline-block;
          background-color: #2c5aa0;
          color: white;
          padding: 4pt 8pt;
          border-radius: 12pt;
          font-size: 9pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
          margin-bottom: 8pt;
        }

        .item-description {
          margin: 16pt 0;
          line-height: 1.6;
          text-align: left;
          color: #333333;
        }

        .item-description h4 {
          color: #2c5aa0;
          font-size: 11pt;
          font-weight: bold;
          margin: 12pt 0 6pt 0;
          padding: 4pt 8pt;
          background-color: #f0f4f8;
          border-left: 3pt solid #2c5aa0;
          border-radius: 0 4pt 4pt 0;
        }

        .item-description p {
          margin: 6pt 0;
          padding-left: 12pt;
        }

        .item-description ul {
          margin: 8pt 0;
          padding-left: 20pt;
        }

        .item-description li {
          margin: 4pt 0;
          line-height: 1.4;
        }

        .item-description strong {
          color: #1a1a1a;
          font-weight: bold;
        }

        .item-description a {
          color: #2c5aa0;
          text-decoration: underline;
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
        <div class="document-subtitle">Профессиональное портфолио преподавателя</div>
        
        <div class="user-name">${user.name}</div>
        <div class="user-role">${user.role === 'super_admin' ? 'Супер-администратор' : user.role === 'admin_news' ? 'Администратор новостей' : user.role === 'admin_portfolio' ? 'Администратор портфолио' : user.role === 'admin_education' ? 'Администратор образования' : user.role === 'admin_events' ? 'Администратор событий' : user.role === 'admin_eservices' ? 'Администратор сервисов' : user.role === 'admin_yessenovai' ? 'Администратор Yessenov AI' : user.role === 'admin_gamification' ? 'Администратор геймификации' : user.role === 'student' ? 'Студент' : 'Пользователь'}</div>
        
        <div class="date-info">
          <strong>Дата формирования документа:</strong><br>
          ${currentDate}
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
        <div class="stats-title">📊 Сводная информация</div>
        <div class="stats-grid">
          <div class="stats-row">
            <div class="stat-cell">
              <span class="stat-number">${detailedStats.totalItems}</span>
              <div class="stat-label">Всего записей</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${detailedStats.itemsWithFiles}</span>
              <div class="stat-label">Записей с файлами</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${detailedStats.sectionsCount}</span>
              <div class="stat-label">Разделов</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${detailedStats.totalFiles}</span>
              <div class="stat-label">Прикрепленных файлов</div>
            </div>
          </div>
          <div class="stats-row">
            <div class="stat-cell">
              <span class="stat-number">${formatFileSize(detailedStats.totalFileSize)}</span>
              <div class="stat-label">Общий размер файлов</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${detailedStats.recentActivity}</span>
              <div class="stat-label">Записей за 30 дней</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${Math.round(detailedStats.totalItems / Math.max(detailedStats.sectionsCount, 1))}</span>
              <div class="stat-label">Среднее записей на раздел</div>
            </div>
            <div class="stat-cell">
              <span class="stat-number">${Math.round(detailedStats.totalFiles / Math.max(detailedStats.totalItems, 1) * 100)}%</span>
              <div class="stat-label">Процент записей с файлами</div>
            </div>
          </div>
        </div>
        
        ${detailedStats.totalFiles > 0 ? `
          <div style="margin-top: 16pt; padding: 12pt; background-color: #f0f4f8; border-radius: 6pt;">
            <div style="font-weight: bold; color: #2c5aa0; margin-bottom: 8pt;">📁 Статистика по типам файлов:</div>
            <div style="font-size: 11pt; color: #4a5568;">${getFileTypeStats()}</div>
          </div>
        ` : ''}
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
          
          <div class="section-description">
            ${getTypeDescription(type)}
          </div>
          
          <div class="section-stats">
            <div class="stats-text">
              📊 Количество записей в разделе: <strong>${items.length}</strong> | 
              📁 Записей с файлами: <strong>${items.filter(item => item.attachments && item.attachments.length > 0).length}</strong> | 
              📎 Общее количество файлов: <strong>${items.reduce((total, item) => total + (item.attachments ? item.attachments.length : 0), 0)}</strong>
            </div>
          </div>
          
          ${items.map((item, itemIndex) => renderDetailedPortfolioItem(item, itemIndex, sectionIndex)).join('')}
        </div>
      `).join('')}

      <!-- Подвал документа -->
      <div class="document-footer">
        <div class="footer-university">Университет имени Есенова (YU)</div>
        <div class="footer-date">Документ сформирован ${currentDate}</div>
        <div style="margin-top: 12pt; font-size: 10pt; color: #4a5568;">
          <strong>Система управления портфолио</strong><br>
          Автоматически сгенерированный документ<br>
          Версия документа: 2.0 | Дата последнего обновления: ${currentDate}
        </div>
        <div style="margin-top: 8pt; font-size: 9pt; color: #666666;">
          Данный документ содержит полную информацию о портфолио пользователя и может использоваться 
          для аттестации, портфолио-оценки и других официальных целей.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Экспорт данных о переходах по карточкам образования в Word документ
 */
export const exportEducationClicksToWord = (
  clicksData: UserClickData[],
  category?: EducationCategory
): void => {
  try {
    // Создаем HTML контент для Word документа
    const htmlContent = generateEducationClicksHTML(clicksData, category);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const categoryName = category ? getCategoryName(category) : 'Все категории';
    link.download = `Education_Clicks_${categoryName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    
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

const getCategoryName = (category: EducationCategory): string => {
  switch (category) {
    case 'education': return 'Образование';
    case 'science': return 'Наука';
    case 'upbringing': return 'Воспитание';
    default: return category;
  }
};

const generateEducationClicksHTML = (
  clicksData: UserClickData[],
  category?: EducationCategory
): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Группируем данные по категориям для статистики
  const statsByCategory = clicksData.reduce((acc, click) => {
    if (!acc[click.category]) {
      acc[click.category] = {
        totalClicks: 0,
        uniqueUsers: new Set(),
        cards: new Set()
      };
    }
    acc[click.category].totalClicks += click.clickCount;
    acc[click.category].uniqueUsers.add(click.userId);
    acc[click.category].cards.add(click.cardId);
    return acc;
  }, {} as Record<EducationCategory, { totalClicks: number; uniqueUsers: Set<string>; cards: Set<string> }>);

  // Создаем строки данных
  const rows = clicksData.map((clickData, index) => {
    const clickDate = new Date(clickData.clickedAt);
    const formattedDate = clickDate.toLocaleDateString('ru-RU');
    const formattedTime = clickDate.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `
      <tr>
        <td style="text-align: center; font-weight: bold;">${index + 1}</td>
        <td style="font-weight: bold; color: #2c5aa0;">${clickData.userName}</td>
        <td>${clickData.userEmail}</td>
        <td style="font-weight: bold; color: #1a1a1a;">${getCategoryName(clickData.category)}</td>
        <td style="font-weight: bold; color: #1a1a1a;">${clickData.cardTitle}</td>
        <td style="text-align: center; font-weight: bold; background-color: #e8f4fd;">${clickData.clickCount}</td>
        <td style="text-align: center;">${formattedDate}</td>
        <td style="text-align: center;">${formattedTime}</td>
      </tr>
    `;
  }).join('');

  // Создаем итоговую строку
  const totalClicks = clicksData.reduce((sum, click) => sum + click.clickCount, 0);
  const totalUsers = new Set(clicksData.map(click => click.userId)).size;
  const totalCards = new Set(clicksData.map(click => click.cardId)).size;

  const totalRow = `
    <tr style="background-color: #f8f9fa; font-weight: bold;">
      <td style="text-align: center;">ИТОГО</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td style="text-align: center; background-color: #e8f4fd;">${totalClicks}</td>
      <td></td>
      <td></td>
    </tr>
  `;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Отчет по переходам по карточкам образования</title>
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
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.15;
          color: #000;
          margin: 0;
          padding: 20pt;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30pt;
          border-bottom: 2pt solid #2c5aa0;
          padding-bottom: 15pt;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 8pt;
        }
        .subtitle {
          font-size: 14pt;
          color: #666;
          margin-bottom: 5pt;
        }
        .date {
          font-size: 11pt;
          color: #888;
        }
        .stats {
          margin: 20pt 0;
          padding: 15pt;
          background-color: #f8f9fa;
          border-left: 4pt solid #2c5aa0;
        }
        .stats-title {
          font-size: 14pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 10pt;
        }
        .stats-grid {
          display: table;
          width: 100%;
          border-collapse: collapse;
        }
        .stats-row {
          display: table-row;
        }
        .stats-cell {
          display: table-cell;
          padding: 5pt 10pt;
          border: 1pt solid #ddd;
          background-color: white;
        }
        .stats-label {
          font-weight: bold;
          background-color: #e8f4fd;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20pt 0;
          font-size: 11pt;
        }
        th {
          background-color: #2c5aa0;
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 8pt;
          border: 1pt solid #1e3a5f;
        }
        td {
          padding: 6pt;
          border: 1pt solid #ddd;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30pt;
          text-align: center;
          font-size: 10pt;
          color: #666;
          border-top: 1pt solid #ddd;
          padding-top: 10pt;
        }
        .footer-university {
          font-weight: bold;
          color: #2c5aa0;
        }
        .footer-date {
          margin-top: 5pt;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ОТЧЕТ ПО ПЕРЕХОДАМ ПО КАРТОЧКАМ ОБРАЗОВАНИЯ</div>
        <div class="subtitle">Университет имени Есенова (YU)</div>
        <div class="subtitle">${category ? `Категория: ${getCategoryName(category)}` : 'Все категории'}</div>
        <div class="date">Дата формирования: ${currentDate}</div>
      </div>

      <div class="stats">
        <div class="stats-title">Общая статистика</div>
        <div class="stats-grid">
          <div class="stats-row">
            <div class="stats-cell stats-label">Всего переходов:</div>
            <div class="stats-cell">${totalClicks}</div>
            <div class="stats-cell stats-label">Уникальных пользователей:</div>
            <div class="stats-cell">${totalUsers}</div>
          </div>
          <div class="stats-row">
            <div class="stats-cell stats-label">Карточек задействовано:</div>
            <div class="stats-cell">${totalCards}</div>
            <div class="stats-cell stats-label">Период:</div>
            <div class="stats-cell">${currentDate}</div>
          </div>
        </div>
      </div>

      ${Object.keys(statsByCategory).length > 1 ? `
        <div class="stats">
          <div class="stats-title">Статистика по категориям</div>
          <div class="stats-grid">
            ${Object.entries(statsByCategory).map(([cat, stats]) => `
              <div class="stats-row">
                <div class="stats-cell stats-label">${getCategoryName(cat as EducationCategory)}:</div>
                <div class="stats-cell">${stats.totalClicks} переходов, ${stats.uniqueUsers.size} пользователей, ${stats.cards.size} карточек</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Категория</th>
            <th>Название карточки</th>
            <th>Количество переходов</th>
            <th>Дата перехода</th>
            <th>Время перехода</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          ${totalRow}
        </tbody>
      </table>

      <div class="footer">
        <div class="footer-university">Университет имени Есенова (YU)</div>
        <div class="footer-date">Документ сформирован ${currentDate}</div>
        <div style="margin-top: 8pt; font-size: 9pt;">
          Система управления образованием
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Загружает логотип университета и конвертирует в base64
 */
const loadLogoAsBase64 = async (): Promise<string> => {
  try {
    const response = await fetch('/Yessenov-logo.png');
    if (!response.ok) {
      throw new Error('Failed to load logo');
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Не удалось загрузить логотип:', error);
    return ''; // Возвращаем пустую строку в случае ошибки
  }
};

/**
 * Экспорт инструкции для студента в Word документ
 */
export const exportStudentInstructionToWord = async (
  userLogin: string,
  userPassword: string
): Promise<void> => {
  try {
    // Загружаем логотип и конвертируем в base64
    const logoBase64 = await loadLogoAsBase64();
    
    // Создаем HTML контент для Word документа
    const htmlContent = generateStudentInstructionHTML(userLogin, userPassword, logoBase64);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Инструкция_студента_${userLogin}_${new Date().toISOString().split('T')[0]}.doc`;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте инструкции:', error);
    alert('Произошла ошибка при экспорте документа');
  }
};

const generateStudentInstructionHTML = (userLogin: string, userPassword: string, logoBase64: string): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Определяем, показывать ли логотип
  const logoHtml = logoBase64 
    ? `<img src="${logoBase64}" alt="Yessenov University Logo" class="logo-image" style="max-width: 100px; max-height: 60px;" />`
    : `<div class="logo-text">YU</div>`;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Инструкция для студента</title>
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
          margin: 2cm 1.5cm 2cm 1.5cm;
          mso-header-margin: 1.27cm;
          mso-footer-margin: 1.27cm;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          text-align: left;
        }

        .header {
          text-align: center;
          margin-bottom: 20pt;
        }

        .logo-image {
          max-width: 100px;
          max-height: 60px;
          margin-bottom: 10pt;
        }

        .logo-text {
          font-size: 24pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 10pt;
        }

        .university-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 10pt;
        }

        .greeting {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin: 20pt 0;
        }

        .content {
          font-size: 12pt;
          margin-bottom: 15pt;
        }

        .login-section {
          margin: 15pt 0;
        }

        .login-item {
          margin: 5pt 0;
        }

        .important-note {
          background-color: #fff3cd;
          border: 1pt solid #ffc107;
          padding: 10pt;
          margin: 15pt 0;
          border-radius: 3pt;
        }

        .services-list {
          margin: 15pt 0;
        }

        .service-item {
          margin: 5pt 0;
          padding-left: 15pt;
        }

        strong {
          font-weight: bold;
        }

        .contact-info {
          margin-top: 20pt;
          text-align: center;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoHtml}
        <div class="university-name">YESSENOV UNIVERSITY</div>
      </div>

      <div class="greeting">
        Құрметті Студент!<br>
        Сізді YU студенті болуыңызбен шын жүректен құттықтаймыз!
      </div>

      <div class="content">
        <strong>id.yu.edu.kz</strong> – сіздің негізгі порталыңыз. Осы сайт арқылы барлық сабақтарыңызға және оқу үдерісіне қатысты ақпараттарға қол жеткізе аласыз.
        </div>

      <div class="login-section">
        <strong>Кіру деректері:</strong>
        <div class="login-item"><strong>Логин:</strong> (логин енгізіледі)</div>
        <div class="login-item"><strong>Құпия сөз:</strong> (бір реттік құпия сөз / студент өзі қояды)</div>
        </div>

        <div class="important-note">
        <strong>Маңызды!</strong> id.yu.edu.kz сайты ашылған бойда міндетті түрде қосымша өзіңіздің жеке поштаңызды тіркейсіз! Ол үшін: қосымша өзіңіздің жеке поштаңызды жеке коймыңыздан Главная страница → Настройки → Резервная почта (Добавить резервную почту).
          </div>

      <div class="content">
        <strong>Бұл не үшін қажет?</strong> Егерде құпия сөз (пароль) ұмытқан жағдайда, өзіңіздің жеке поштаңыз арқылы қайтадан жаңарта аласыз.
        </div>

      <div class="content">
        <strong>Бұл портал сізге келесі мүмкіндіктерді ұсынады:</strong>
        </div>

        <div class="services-list">
        <div class="service-item">• <strong>GMail</strong> – корпоративтік пошта;</div>
        <div class="service-item">• <strong>Lessons</strong> – Google Meet арқылы онлайн сабақтарға қатысу.</div>
        <div class="service-item">• <strong>Platonus</strong> – оқу үдерісін автоматтандыру жүйесі (кесте, бағалар, қатысу, материалдар);</div>
        <div class="service-item">• <strong>Yessenov Science Journal</strong> – ғылымға жол ашатын мақалалар мен журналдар;</div>
        <div class="service-item">• <strong>Общежитие</strong> – жатақханаға өтінім беру жүйесі.</div>
        </div>

        <div class="contact-info">
            Егерде берілген ақпарат бойынша сізге бір пункт түсініксіз болған жағдайда, өзіңіздің жеке эдвайзеріңізге хабарласыңыз. Эдвайзерлеріңізді өзіңіздің деканатыңыздан білесіз.
      </div>
    </body>
    </html>
  `;
};

/**
 * Экспорт инструкции для сотрудников и ПОК в Word документ
 */
export const exportEmployeeInstructionToWord = async (
  userLogin: string,
  userPassword: string
): Promise<void> => {
  try {
    // Загружаем логотип и конвертируем в base64
    const logoBase64 = await loadLogoAsBase64();
    
    // Создаем HTML контент для Word документа
    const htmlContent = generateEmployeeInstructionHTML(userLogin, userPassword, logoBase64);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Инструкция_сотрудника_${userLogin}_${new Date().toISOString().split('T')[0]}.doc`;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте инструкции сотрудника:', error);
    alert('Произошла ошибка при экспорте документа');
  }
};

const generateEmployeeInstructionHTML = (userLogin: string, userPassword: string, logoBase64: string): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Определяем, показывать ли логотип
  const logoHtml = logoBase64 
    ? `<img src="${logoBase64}" alt="Yessenov University Logo" class="logo-image" style="max-width: 100px; max-height: 60px;" />`
    : `<div class="logo-text">YU</div>`;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Инструкция для сотрудника</title>
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
          margin: 2cm 1.5cm 2cm 1.5cm;
          mso-header-margin: 1.27cm;
          mso-footer-margin: 1.27cm;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          text-align: left;
        }

        .header {
          text-align: center;
          margin-bottom: 15pt;
        }

        .logo-image {
          max-width: 100px;
          max-height: 60px;
          margin-bottom: 8pt;
        }

        .logo-text {
          font-size: 24pt;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 8pt;
        }

        .university-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 8pt;
        }

        .greeting {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          margin: 15pt 0;
        }

        .content {
          font-size: 11pt;
          margin-bottom: 12pt;
        }

        .login-section {
          margin: 12pt 0;
        }

        .login-item {
          margin: 4pt 0;
        }

        .important-note {
          background-color: #fff3cd;
          border: 1pt solid #ffc107;
          padding: 8pt;
          margin: 12pt 0;
          border-radius: 3pt;
        }

        .services-list {
          margin: 12pt 0;
        }

        .service-item {
          margin: 3pt 0;
          padding-left: 15pt;
        }

        .contact-section {
          margin: 15pt 0;
          page-break-inside: avoid;
        }

        .contact-person {
          margin: 8pt 0;
          padding: 8pt;
          border: 1pt solid #ddd;
          border-radius: 3pt;
        }

        .contact-name {
          font-weight: bold;
          margin-bottom: 3pt;
        }

        .contact-details {
          font-size: 10pt;
          margin: 2pt 0;
        }

        strong {
          font-weight: bold;
        }

        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoHtml}
        <div class="university-name">YESSENOV UNIVERSITY</div>
      </div>

      <div class="greeting">
        Құрметті қызметкер және ПОҚ құрамы!<br>
        Yessenov University қош келдіңіз!
      </div>

      <div class="content">
        <strong>id.yu.edu.kz</strong> – жалпы портал. Осы сайт арқылы сіз барлық сұрақтарыңызға қол жеткізе аласыз.
        </div>

      <div class="login-section">
        <strong>Кіру деректері:</strong>
        <div class="login-item"><strong>Логин:</strong> (логин енгізіледі)</div>
        <div class="login-item"><strong>Құпия сөз:</strong> (бір реттік құпия сөз / студент өзі қояды)</div>
        </div>

        <div class="important-note">
        <strong>Маңызды!</strong> id.yu.edu.kz сайты ашылған бойда сіздер міндетті түрде қосымша өзіңіздің жеке поштаңызды тіркейсіз! Ол үшін: Главная страница → Настройки → Резервная почта (Добавить резервную почту).
          </div>

      <div class="content">
        <strong>Бұл не үшін қажет?</strong> Егерде құпия сөз (пароль) ұмытқан жағдайда, өзіңіздің жеке поштаңыз арқылы қайтадан жаңарта аласыз.
        </div>

      <div class="content">
        <strong>Бұл портал сізге келесі мүмкіндіктерді ұсынады:</strong>
        </div>

        <div class="services-list">
        <div class="service-item">• <strong>Bitrix24</strong> – ішкі құжатайналым;</div>
        <div class="service-item">• <strong>GMail</strong> – университеттің корпоративтік поштасы;</div>
        <div class="service-item">• <strong>KPI</strong> – тиімділік негізгі көрсеткіштері;</div>
        <div class="service-item">• <strong>Platonus</strong> – оқу үдерісін автоматтандыру жүйесі;</div>
        <div class="service-item">• <strong>Service</strong> – ішкі қызметтік жүйелерге қолжетімділік;</div>
        <div class="service-item">• <strong>Lessons</strong> – онлайн сабақ өту порталы;</div>
        <div class="service-item">• <strong>Science Journal</strong> – ғылыми журнал;</div>
        <div class="service-item">• <strong>Yessenov Science Journal</strong> – ғылыми журнал каталогы;</div>
        <div class="service-item">• <strong>DSpace</strong> – электронды кітапхана және деректер қоры;</div>
        <div class="service-item">• <strong>YU Student Clubs</strong> – студенттерге арналған веб-сайт;</div>
        <div class="service-item">• <strong>YU HelpDesk</strong> – техникалық өтініштер қабылдайтын сайт;</div>
        <div class="service-item">• <strong>Админ панель</strong> – әкімшілік басқару құралы;</div>
        <div class="service-item">• <strong>ЭЦП</strong> – құжаттарға электрондық цифрлық қолтаңба қоюға арналған жүйе.</div>
          </div>

      <div class="content">
        <strong>YU ғимаратына кіретін карта</strong> А0503 кабинетінде беріледі.
        </div>

      <div class="page-break"></div>

      <div class="content">
        <strong>Техникалық қолдау:</strong>
        </div>

      <div class="contact-section">
        <div class="content"><strong>Platonus жүйесі бойынша нұсқаулықты</strong></div>
          <div class="contact-person">
            <div class="contact-name">Каламова Гаухар</div>
            <div class="contact-details">Білім беру ресурстарды дамыту орталығының маманы</div>
            <div class="contact-details">Кабинет: B0104</div>
            <div class="contact-details">Email: gaukhar.kalamova@yu.edu.kz</div>
          </div>
        </div>

      <div class="contact-section">
        <div class="content"><strong>Lessons порталына (онлайн сабақ жүргізетін болсаңыз)</strong></div>
          <div class="contact-person">
            <div class="contact-name">Шаманова Венера</div>
            <div class="contact-details">Ақпараттық технологиялар басқармасы маманы</div>
            <div class="contact-details">Кабинет: А0503</div>
            <div class="contact-details">Email: venera1.shamanova@yu.edu.kz</div>
          </div>
        </div>

      <div class="contact-section">
        <div class="content"><strong>Science Journal, Yessenov Science Journal бойынша ақпаратты</strong></div>
          <div class="contact-person">
            <div class="contact-name">Койшина Акмарал</div>
            <div class="contact-details">Ғылыми басқарма маманы</div>
            <div class="contact-details">Кабинет: А1204</div>
            <div class="contact-details">Email: akmaral.koishina@yu.edu.kz</div>
          </div>
        </div>

      <div class="contact-section">
        <div class="content"><strong>YU Student Clubs веб сайты бойынша (эдвайзер болсаңыз)</strong></div>
          <div class="contact-person">
            <div class="contact-name">Мадиев Арслан</div>
            <div class="contact-details">Әлеуметтік қолдау көрсету және жастарды дамыту басқармасы маманы</div>
            <div class="contact-details">Кабинет: А0301</div>
            <div class="contact-details">Email: arslan1.madiyev@yu.edu.kz</div>
          </div>
        </div>

      <div class="contact-section">
        <div class="content"><strong>Жалпы техникалық қолдау</strong></div>
        <div class="content">
            Егерде берілген ақпарат бойынша түсініксіз болған жағдайда Ақпараттық технологиялар басқармасы маманына жүгінесіз
          </div>
          <div class="contact-details">
            <strong>Телефон:</strong> +7 9272 788 788, қосымша 255<br>
            <strong>Email:</strong> itd@yu.edu.kz
        </div>
      </div>
    </body>
    </html>
  `;
};