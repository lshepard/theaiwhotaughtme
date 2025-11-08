import { NextResponse } from 'next/server';

// Mock data for development/testing when Calendly is not configured
function generateMockSlots() {
  const slots = [];
  const now = new Date();

  for (let i = 1; i <= 6; i++) {
    const startTime = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    startTime.setHours(14, 0, 0, 0); // 2 PM

    const endTime = new Date(startTime);
    endTime.setMinutes(30); // 30 min meetings

    slots.push({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      invitees_remaining: 1,
    });
  }

  return slots;
}

export async function GET() {
  try {
    const calendlyApiToken = process.env.CALENDLY_API_TOKEN;
    const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

    // Development mode: Return mock data if Calendly is not configured
    if (!calendlyApiToken || !eventTypeUri) {
      console.log('⚠️  Calendly not configured, using mock data');
      return NextResponse.json({
        success: true,
        slots: generateMockSlots(),
        mock: true,
      });
    }

    // Calculate start and end times (next 7 days - Calendly max)
    // Start 1 hour from now to ensure it's in the future
    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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
