import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');

    if (!input || input.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('❌ Google Maps API key not configured');
      return NextResponse.json(
        { error: 'Maps API not configured' },
        { status: 500 }
      );
    }

    // Use Places API Autocomplete (REST API)
    // This is the working REST endpoint, not the JavaScript SDK
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', 'school');
    url.searchParams.set('key', apiKey);

    console.log('🔍 Autocompleting schools for:', input);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Google Places Autocomplete API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places API status:', data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || 'API error' },
        { status: 500 }
      );
    }

    // Extract school names from predictions
    const suggestions = (data.predictions || []).map((prediction: any) => ({
      name: prediction.structured_formatting?.main_text || prediction.description,
      fullAddress: prediction.description,
    }));

    console.log(`✅ Found ${suggestions.length} school autocomplete suggestions`);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
