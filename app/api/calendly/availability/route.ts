import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const calendlyApiToken = process.env.CALENDLY_API_TOKEN;
    const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

    if (!calendlyApiToken || !eventTypeUri) {
      return NextResponse.json(
        { error: 'Calendly configuration missing' },
        { status: 500 }
      );
    }

    // Calculate start and end times (next 30 days)
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch available times from Calendly API
    const response = await fetch(
      `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${calendlyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Calendly API error:', await response.text());
      throw new Error('Failed to fetch availability from Calendly');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      slots: data.collection || [],
    });
  } catch (error) {
    console.error('Error fetching Calendly availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
