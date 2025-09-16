import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://6673d47c36db.ngrok-free.app';

export async function GET() {
  try {
    console.log('Fetching meetings from:', `${API_BASE_URL}/auth/calendar/all_meetings/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/all_meetings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Meetings API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meetings API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Meetings data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: (error as Error).message },
      { status: 500 }
    );
  }
}
