import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://435ee3adc448.ngrok-free.app';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Creating meeting with data:', body);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/create/meeting/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
    });

    console.log('Create meeting API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create meeting API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Meeting created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting', details: (error as Error).message },
      { status: 500 }
    );
  }
}
