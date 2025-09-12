import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://435ee3adc448.ngrok-free.app';

export async function GET() {
  try {
    console.log('Fetching users from:', `${API_BASE_URL}/auth/users/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Users API response status:', response.status);

    if (!response.ok) {
      console.warn('API пользователей недоступен, возвращаем пустой массив');
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log('Users data received:', data);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn('Error fetching users:', error);
    return NextResponse.json([]);
  }
}
