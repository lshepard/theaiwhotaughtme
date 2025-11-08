import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start_time, end_time, name, email, phone, school, grades, role, aiUsage } = body;

    console.log('📅 Booking request received:');
    console.log('   start_time:', start_time);
    console.log('   end_time:', end_time);
    console.log('   name:', name);
    console.log('   email:', email);
    console.log('   phone:', phone);
    console.log('   school:', school);
    console.log('   grades:', grades);
    console.log('   role:', role);
    console.log('   aiUsage:', aiUsage);

    // Validate required fields
    if (!start_time || !name || !email || !phone || !aiUsage) {
      console.error('❌ Missing required fields:');
      console.error('   start_time:', !!start_time);
      console.error('   name:', !!name);
      console.error('   email:', !!email);
      console.error('   phone:', !!phone);
      console.error('   aiUsage:', !!aiUsage);
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    const calApiKey = process.env.CAL_API_KEY;
    const calUsername = process.env.CAL_USERNAME || 'theaiwhotaughtme';
    const calEventSlug = process.env.CAL_EVENT_SLUG || '30min';

    if (!calApiKey) {
      console.error('❌ Cal.com not configured');
      return NextResponse.json(
        { error: 'Cal.com configuration missing. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('📅 Creating Cal.com booking...');
    console.log('   Name:', name);
    console.log('   Email:', email);
    console.log('   Time:', start_time);

    // Create booking using Cal.com API v2
    const bookingPayload = {
      start: start_time,
      eventTypeSlug: calEventSlug,
      username: calUsername,
      attendee: {
        name: name,
        email: email,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        phoneNumber: phone,
      },
      metadata: {
        school: school || 'N/A',
        role: role || 'N/A',
        grades: grades || 'N/A',
        aiUsage: aiUsage,
      },
    };

    console.log('📤 Sending booking request to Cal.com...');

    const response = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'cal-api-version': '2024-08-13',
        'Authorization': `Bearer ${calApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cal.com booking error:', errorText);
      throw new Error('Failed to book appointment with Cal.com');
    }

    const data = await response.json();

    console.log('✅ Booking created successfully');
    console.log('   Booking ID:', data.data?.id);

    return NextResponse.json({
      success: true,
      booking: data.data,
    });
  } catch (error) {
    console.error('Error booking Cal.com appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
