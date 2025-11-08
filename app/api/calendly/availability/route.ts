import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const calendlyApiToken = process.env.CALENDLY_API_TOKEN;
    const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

    if (!calendlyApiToken || !eventTypeUri) {
      console.error('❌ Calendly not configured');
      console.log('   Set CALENDLY_API_TOKEN and CALENDLY_EVENT_TYPE_URI in .env.local');
      return NextResponse.json(
        { error: 'Calendly configuration missing. Please contact support.' },
        { status: 500 }
      );
    }

    // Validate event type URI format
    if (!eventTypeUri.startsWith('https://api.calendly.com/event_types/')) {
      console.error('❌ Invalid CALENDLY_EVENT_TYPE_URI format');
      console.log('   Expected: https://api.calendly.com/event_types/YOUR_UUID');
      console.log('   Got:', eventTypeUri);
      return NextResponse.json(
        { error: 'Calendly configuration invalid. Please contact support.' },
        { status: 500 }
      );
    }

    // Calculate start and end times (next 7 days - Calendly max)
    // Start 1 hour from now to ensure it's in the future
    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    console.log('📅 Fetching Calendly availability...');
    console.log('   Event Type:', eventTypeUri);
    console.log('   Date Range:', startTime.split('T')[0], 'to', endTime.split('T')[0]);

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
      const errorText = await response.text();
      console.error('❌ Calendly API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch availability from Calendly. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log(`✅ Found ${data.collection?.length || 0} available time slots`);

    return NextResponse.json({
      success: true,
      slots: data.collection || [],
    });
  } catch (error) {
    console.error('Error fetching Calendly availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability. Please try again later.' },
      { status: 500 }
    );
  }
}
