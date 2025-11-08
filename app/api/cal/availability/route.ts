import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const calApiKey = process.env.CAL_API_KEY;
    const calUsername = process.env.CAL_USERNAME || 'theaiwhotaughtme';
    const calEventSlug = process.env.CAL_EVENT_SLUG || '30min';

    if (!calApiKey) {
      console.error('❌ Cal.com not configured');
      console.log('   Set CAL_API_KEY in .env.local');
      return NextResponse.json(
        { error: 'Cal.com configuration missing. Please contact support.' },
        { status: 500 }
      );
    }

    // Calculate start and end times (next 30 days to find available slots)
    const startTime = new Date(Date.now()).toISOString().split('T')[0]; // Today's date
    const endTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now

    console.log('📅 Fetching Cal.com availability...');
    console.log('   Username:', calUsername);
    console.log('   Event Slug:', calEventSlug);
    console.log('   Date Range:', startTime, 'to', endTime);

    // Fetch available times from Cal.com API v2
    const apiUrl = `https://api.cal.com/v2/slots?eventTypeSlug=${calEventSlug}&username=${calUsername}&start=${startTime}&end=${endTime}&format=range`;

    const response = await fetch(apiUrl, {
      headers: {
        'cal-api-version': '2024-09-04',
        'Authorization': `Bearer ${calApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cal.com API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch availability from Cal.com. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log('📦 Cal.com response:', JSON.stringify(data, null, 2));

    // Transform Cal.com response to match our expected format
    // Cal.com returns: { status: "success", data: { "2024-11-07": [{ start, end }] } }
    const slots: any[] = [];

    if (data.status === 'success' && data.data) {
      // Get all dates sorted chronologically
      const sortedDates = Object.keys(data.data).sort();

      // Take only the first 5 days that have availability
      const daysToShow = sortedDates.slice(0, 5);

      daysToShow.forEach((date) => {
        const dateSlots = data.data[date];
        dateSlots.forEach((slot: any) => {
          slots.push({
            start_time: slot.start,
            end_time: slot.end,
            invitees_remaining: 1, // Cal.com doesn't provide this, assume 1
          });
        });
      });
    }

    console.log(`✅ Found ${slots.length} available time slots across ${Object.keys(data.data || {}).length} days`);

    return NextResponse.json({
      success: true,
      slots: slots, // Return slots for first 5 available days
    });
  } catch (error) {
    console.error('Error fetching Cal.com availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability. Please try again later.' },
      { status: 500 }
    );
  }
}
