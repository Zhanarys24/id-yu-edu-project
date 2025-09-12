import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://435ee3adc448.ngrok-free.app';

export async function POST(req: Request) {
  try {
    console.log('=== CREATE MEETING API CALLED ===');
    console.log('Request URL:', req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const externalUrl = `${API_BASE_URL}/auth/calendar/create/meeting/`;
    console.log('Calling external API:', externalUrl);
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`External API error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('External API success response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('=== CREATE MEETING API ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { 
        error: 'Failed to create meeting', 
        details: (error as Error).message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
