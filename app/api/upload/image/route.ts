import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Проверяем, является ли запрос multipart/form-data (загрузка файла)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ message: 'No file provided' }, { status: 400 });
      }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'File must be an image' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'File size must be less than 1MB' }, { status: 400 });
    }

    // Получаем токен и режим авторизации
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Получаем буфер файла
    const fileBuffer = await file.arrayBuffer();
    
    // Получаем метаданные изображения
    const image = sharp(Buffer.from(fileBuffer));
    const metadata = await image.metadata();
    
    // Проверяем разрешение изображения
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        // Изменяем размер изображения до максимального разрешения
        const resizedImage = await image
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        
        // Проверяем размер после изменения
        if (resizedImage.length > maxSize) {
          return NextResponse.json({ 
            message: 'Image size exceeds 1MB limit even after resizing' 
          }, { status: 400 });
        }
        
        // Создаем новый файл с измененным размером
        const resizedFile = new File([resizedImage], file.name, { type: 'image/jpeg' });
        
        // Обновляем FormData с измененным файлом
        const backendFormData = new FormData();
        backendFormData.append('image', resizedFile);
        
        // Отправляем измененный файл на бэкенд
        const uploadUrl = process.env.API_BASE_URL + '/api/users/change_image/';
        
        // Получаем все cookies от клиента
        const clientCookies = req.headers.get('cookie') || '';
        
        // Проверяем, есть ли backend_session cookie
        const backendSessionCookie = req.cookies.get('backend_session')?.value;
        if (backendSessionCookie) {
          console.log('Found backend_session cookie (resize):', backendSessionCookie);
        }
        
        // Отправляем только backend_session cookie
        const cookieHeader = backendSessionCookie ? `backend_session=${backendSessionCookie}` : '';
        
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            ...(authMode === 'cookie'
              ? { 'Cookie': cookieHeader }
              : { 'Authorization': `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}` }),
          },
          body: backendFormData,
          cache: 'no-store',
        });

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return NextResponse.json({ message: 'Upload service invalid response' }, { status: 502 });
        }

        const data = await res.json();
        
        if (!res.ok) {
          return NextResponse.json(data, { status: res.status });
        }

        // Нормализуем URL изображения
        const imageUrl = data.image || data.avatar || data.profile_image;
        let normalizedImageUrl: string | null = null;
        if (imageUrl) {
          if (imageUrl.startsWith('http')) {
            normalizedImageUrl = imageUrl;
          } else {
            normalizedImageUrl = process.env.API_BASE_URL 
              ? process.env.API_BASE_URL + imageUrl 
              : imageUrl;
          }
        }

        return NextResponse.json({ 
          success: true,
          imageUrl: normalizedImageUrl,
          message: 'Image uploaded and resized successfully',
          originalSize: { width: metadata.width, height: metadata.height },
          resized: true
        }, { status: 200 });
      }
    }

    // Если изображение не требует изменения размера, обрабатываем как обычно
    console.log('Upload image - Token:', token ? 'Present' : 'Missing');
    console.log('Upload image - Auth mode:', authMode);

    // Создаем FormData для отправки на бэкенд
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Отправляем файл на бэкенд API
    const uploadUrl = process.env.API_BASE_URL + '/api/users/change_image/';
    
    // Получаем все cookies от клиента
    const clientCookies = req.headers.get('cookie') || '';
    
    // Проверяем, есть ли backend_session cookie
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    if (backendSessionCookie) {
      console.log('Found backend_session cookie:', backendSessionCookie);
    }
    
    // Отправляем только backend_session cookie
    const cookieHeader = backendSessionCookie ? `backend_session=${backendSessionCookie}` : '';
    
    console.log('Upload image - Sending cookie:', cookieHeader);
    
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...(authMode === 'cookie'
          ? { 'Cookie': cookieHeader }
          : { 'Authorization': `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}` }),
      },
      body: backendFormData,
      cache: 'no-store',
    });

    console.log('Upload image - Backend response status:', res.status);
    console.log('Upload image - Backend response headers:', Object.fromEntries(res.headers.entries()));

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const responseText = await res.text();
      console.log('Upload image - Backend response text (non-JSON):', responseText);
      return NextResponse.json({ message: 'Upload service invalid response' }, { status: 502 });
    }

    const data = await res.json();
    console.log('Upload image - Backend response data:', data);
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Нормализуем URL изображения
    const imageUrl = data.image || data.avatar || data.profile_image;
    let normalizedImageUrl: string | null = null;
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        normalizedImageUrl = imageUrl;
      } else {
        normalizedImageUrl = process.env.API_BASE_URL 
          ? process.env.API_BASE_URL + imageUrl 
          : imageUrl;
      }
    }

    return NextResponse.json({ 
      success: true,
      imageUrl: normalizedImageUrl,
      message: 'Image uploaded successfully' 
    }, { status: 200 });
    
    } else {
      // Обработка JSON запроса с URL аватарки
      const body = await req.json();
      const avatar = body.avatar;
      
      if (!avatar) {
        return NextResponse.json({ message: 'Avatar URL is required' }, { status: 400 });
      }

      const token = req.cookies.get('auth')?.value;
      const authMode = req.cookies.get('auth_mode')?.value;
      
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      // Отправляем URL на бэкенд API
      const uploadUrl = process.env.API_BASE_URL + '/api/users/change_image/';
      const backendSessionCookie = req.cookies.get('backend_session')?.value;
      const cookieHeader = backendSessionCookie ? `backend_session=${backendSessionCookie}` : '';
      
      console.log('Upload image URL - Sending cookie:', cookieHeader);
      
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authMode === 'cookie'
            ? { 'Cookie': cookieHeader }
            : { 'Authorization': `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}` }),
        },
        body: JSON.stringify({ image: avatar }),
        cache: 'no-store',
      });

      console.log('Upload image URL - Backend response status:', res.status);

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const responseText = await res.text();
        console.log('Upload image URL - Backend response text (non-JSON):', responseText);
        return NextResponse.json({ message: 'Upload service invalid response' }, { status: 502 });
      }

      const data = await res.json();
      console.log('Upload image URL - Backend response data:', data);
      
      if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
      }

      // Нормализуем URL изображения
      const imageUrl = data.image || data.avatar || data.profile_image || avatar;
      let normalizedImageUrl: string | null = null;
      if (imageUrl) {
        if (imageUrl.startsWith('http')) {
          normalizedImageUrl = imageUrl;
        } else {
          normalizedImageUrl = process.env.API_BASE_URL 
            ? process.env.API_BASE_URL + imageUrl 
            : imageUrl;
        }
      }

      return NextResponse.json({ 
        success: true,
        imageUrl: normalizedImageUrl,
        message: 'Image URL updated successfully' 
      }, { status: 200 });
    }
    
  } catch (e) {
    const err = e as Error
    console.error('Image upload error:', err);
    return NextResponse.json({ message: err.message || 'Image upload error' }, { status: 500 });
  }
}
