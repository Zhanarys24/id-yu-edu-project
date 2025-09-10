import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Environment validation
    if (!process.env.API_BASE_URL) {
      return NextResponse.json({ message: 'API configuration error' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value;
    const backendSession = req.cookies.get('backend_session')?.value;

    // Authentication check
    if (!token && !backendSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Content type validation
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ message: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Enhanced file validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Only JPEG, PNG, WebP, and GIF images are allowed' 
      }, { status: 400 });
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Create FormData for backend request
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Prepare headers based on auth mode
    const headers: HeadersInit = authMode === 'cookie'
      ? { 'Cookie': `backend_session=${backendSession}` }
      : { 'Authorization': `Token ${token}` };

    // Upload to backend
    const uploadRes = await fetch(`${process.env.API_BASE_URL}/api/users/change_image/`, {
      method: 'POST',
      headers,
      body: backendFormData,
      cache: 'no-store',
    });

    if (!uploadRes.ok) {
      let errorData;
      try {
        errorData = await uploadRes.json();
      } catch {
        errorData = { message: 'Upload failed' };
      }
      
      return NextResponse.json(errorData, { status: uploadRes.status });
    }

    const userData = await uploadRes.json();
    const avatarUrl = userData.image;
    
    if (!avatarUrl) {
      return NextResponse.json({ message: 'No image URL returned from server' }, { status: 500 });
    }

    // Normalize avatar URL
    const normalizedAvatar = avatarUrl.startsWith('http')
      ? avatarUrl
      : `${process.env.API_BASE_URL}${avatarUrl}`;

    return NextResponse.json({
      success: true,
      avatar: normalizedAvatar,
      user: userData,
      message: 'Avatar updated successfully',
    });

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json({ message: 'Request timeout' }, { status: 408 });
    }
    
    return NextResponse.json({ 
      message: error?.message || 'Internal server error' 
    }, { status: 500 });
  }
}