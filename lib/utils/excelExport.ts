import { RegisteredUser } from '@/lib/types/user';
import { UserNewsClickData, NewsCategory } from '@/lib/types/news';

/**
 * Экспорт данных портфолио пользователей в Excel файл
 */
export const exportPortfolioAnalyticsToExcel = (
  usersData: Array<{
    user: RegisteredUser;
    itemCount: number;
    itemsByType: Record<string, number>;
    lastActivity?: string;
  }>
): void => {
  try {
    // Создаем HTML контент для Excel (более совместимый формат)
    const htmlContent = generatePortfolioAnalyticsHTML(usersData);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Portfolio_Analytics_${new Date().toISOString().split('T')[0]}.xls`;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    alert('Произошла ошибка при экспорте данных');
  }
};

const generatePortfolioAnalyticsHTML = (
  usersData: Array<{
    user: RegisteredUser;
    itemCount: number;
    itemsByType: Record<string, number>;
    lastActivity?: string;
  }>
): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  // Создаем строки данных
  const rows = usersData.map((userData, index) => {
    const { user, itemCount, itemsByType, lastActivity } = userData;
    
    return `
      <tr>
        <td style="text-align: center; font-weight: bold;">${index + 1}</td>
        <td style="font-weight: bold; color: #2c5aa0;">${user.name}</td>
        <td>${user.email}</td>
        <td style="text-align: center;">${user.role}</td>
        <td style="text-align: center; font-weight: bold; background-color: #e8f4fd;">${itemCount}</td>
        <td style="text-align: center;">${itemsByType.general || 0}</td>
        <td style="text-align: center;">${itemsByType.publications || 0}</td>
        <td style="text-align: center;">${itemsByType.teaching || 0}</td>
        <td style="text-align: center;">${itemsByType.achievements || 0}</td>
        <td style="text-align: center;">${itemsByType.additional || 0}</td>
        <td style="text-align: center;">${new Date(user.registeredAt).toLocaleDateString('ru-RU')}</td>
        <td style="text-align: center;">${lastActivity ? new Date(lastActivity).toLocaleDateString('ru-RU') : 'Нет активности'}</td>
        <td style="text-align: center; color: ${user.isActive ? '#28a745' : '#dc3545'}; font-weight: bold;">
          ${user.isActive ? 'Активен' : 'Неактивен'}
        </td>
      </tr>
    `;
  }).join('');

  // Создаем итоговую строку
  const totalRow = `
    <tr style="background-color: #f8f9fa; font-weight: bold;">
      <td style="text-align: center;">ИТОГО</td>
      <td></td>
      <td></td>
      <td></td>
      <td style="text-align: center; background-color: #e8f4fd;">${usersData.reduce((sum, user) => sum + user.itemCount, 0)}</td>
      <td style="text-align: center;">${usersData.reduce((sum, user) => sum + (user.itemsByType.general || 0), 0)}</td>
      <td style="text-align: center;">${usersData.reduce((sum, user) => sum + (user.itemsByType.publications || 0), 0)}</td>
      <td style="text-align: center;">${usersData.reduce((sum, user) => sum + (user.itemsByType.teaching || 0), 0)}</td>
      <td style="text-align: center;">${usersData.reduce((sum, user) => sum + (user.itemsByType.achievements || 0), 0)}</td>
      <td style="text-align: center;">${usersData.reduce((sum, user) => sum + (user.itemsByType.additional || 0), 0)}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  `;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Отчет по портфолио пользователей</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Портфолио пользователей</x:Name>
              <x:WorksheetOptions>
                <x:DefaultRowHeight>285</x:DefaultRowHeight>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          color: #333;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th {
          background-color: #2c5aa0;
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 12px 8px;
          border: 1px solid #1e3a5f;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .date {
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ОТЧЕТ ПО ПОРТФОЛИО ПОЛЬЗОВАТЕЛЕЙ</div>
        <div class="subtitle">Университет имени Есенова (YU)</div>
        <div class="date">Дата формирования: ${currentDate}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Общее количество записей</th>
            <th>Общая информация</th>
            <th>Публикации</th>
            <th>Преподавание</th>
            <th>Достижения</th>
            <th>Дополнительная деятельность</th>
            <th>Дата регистрации</th>
            <th>Последняя активность</th>
            <th>Статус аккаунта</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          ${totalRow}
        </tbody>
      </table>
    </body>
    </html>
  `;
};

/**
 * Экспорт данных о переходах по новостям в Excel файл
 */
export const exportNewsClicksToExcel = (
  clicksData: UserNewsClickData[],
  category?: NewsCategory
): void => {
  try {
    // Создаем HTML контент для Excel (более совместимый формат)
    const htmlContent = generateNewsClicksHTML(clicksData, category);
    
    // Создаем Blob с HTML контентом
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `News_Clicks_${category ? category : 'All'}_${new Date().toISOString().split('T')[0]}.xls`;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    alert('Произошла ошибка при экспорте данных');
  }
};

const getCategoryName = (category: NewsCategory): string => {
  const categoryNames: Record<NewsCategory, string> = {
    rating: 'Рейтинги',
    international: 'Международное сотрудничество',
    science: 'Наука',
    management: 'Управление',
    cooperation: 'Сотрудничество',
    opening: 'Открытие',
    achievements: 'Достижения',
    olympiad: 'Олимпиада'
  };
  return categoryNames[category] || category;
};

const generateNewsClicksHTML = (
  clicksData: UserNewsClickData[],
  category?: NewsCategory
): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  // Создаем строки данных
  const rows = clicksData.map((clickData, index) => {
    return `
      <tr>
        <td style="text-align: center; font-weight: bold;">${index + 1}</td>
        <td style="font-weight: bold; color: #2c5aa0;">${clickData.userName}</td>
        <td>${clickData.userEmail}</td>
        <td style="font-weight: bold; color: #1a1a1a;">${clickData.newsTitle}</td>
        <td style="text-align: center; background-color: #e8f4fd;">${getCategoryName(clickData.category)}</td>
        <td style="text-align: center; font-weight: bold; background-color: #e8f4fd;">${clickData.clickCount}</td>
        <td style="text-align: center;">${new Date(clickData.clickedAt).toLocaleDateString('ru-RU')}</td>
        <td style="text-align: center;">${new Date(clickData.clickedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
    `;
  }).join('');

  // Создаем итоговую строку
  const totalRow = `
    <tr style="background-color: #f8f9fa; font-weight: bold;">
      <td style="text-align: center;">ИТОГО</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td style="text-align: center; background-color: #e8f4fd;">${clicksData.reduce((sum, click) => sum + click.clickCount, 0)}</td>
      <td></td>
      <td></td>
    </tr>
  `;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Отчет по переходам по новостям</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Переходы по новостям</x:Name>
              <x:WorksheetOptions>
                <x:DefaultRowHeight>285</x:DefaultRowHeight>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          color: #333;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th {
          background-color: #2c5aa0;
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 12px 8px;
          border: 1px solid #1e3a5f;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .date {
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ОТЧЕТ ПО ПЕРЕХОДАМ ПО НОВОСТЯМ</div>
        <div class="subtitle">Университет имени Есенова (YU)</div>
        <div class="subtitle">${category ? `Категория: ${getCategoryName(category)}` : 'Все категории'}</div>
        <div class="date">Дата формирования: ${currentDate}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Название новости</th>
            <th>Категория</th>
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
    </body>
    </html>
  `;
};
