import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  date: string;
  image?: string;
  [key: string]: unknown;
}

interface NewsResponse {
  results?: NewsItem[];
  count?: number;
  cached?: boolean;
  [key: string]: unknown;
}

interface ProcessedNewsItem {
  id: string;
  title: string;
  link: string;
  date: string;
  image?: string;
  description: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log('Starting news parsing from API...');
    
    // Получаем данные с готового API
    const response = await fetch('https://id.yu.edu.kz/api/news/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    console.log('API response data:', data);
    
    // Преобразуем данные в наш формат
    const newsItems: ProcessedNewsItem[] = data.results ? data.results.slice(0, 8).map((item: NewsItem, index: number) => ({
      id: `yu-news-${index + 1}`,
      title: item.title,
      link: item.link,
      date: item.date,
      image: item.image,
      description: item.title
    })) : [];
    
    console.log('Processed news items:', newsItems.length);
    
    return NextResponse.json({
      success: true,
      news: newsItems,
      count: newsItems.length,
      debug: {
        apiCount: data.count,
        cached: data.cached,
        totalResults: data.results ? data.results.length : 0
      }
    });

  } catch (error) {
    console.error('Error fetching news from API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news from API',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}