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

    // Use NEW Places API (Text Search) for autocomplete
    // This is the modern API with better pricing and features
    const url = 'https://places.googleapis.com/v1/places:searchText';

    console.log('🔍 Searching for schools:', input);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: input,
        includedType: 'school',
        maxResultCount: 5,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Google Places API (New) error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Extract school names from new API format
    const suggestions = (data.places || []).map((place: any) => ({
      name: place.displayName?.text || 'Unknown School',
      fullAddress: place.formattedAddress || '',
    }));

    console.log(`✅ Found ${suggestions.length} school suggestions`);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
