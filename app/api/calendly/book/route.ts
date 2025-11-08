import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const calendlyApiToken = process.env.CALENDLY_API_TOKEN;
    const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

    if (!calendlyApiToken || !eventTypeUri) {
      return NextResponse.json(
        { error: 'Calendly configuration missing' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { start_time, end_time, name, phone, school, grades } = body;

    // Validate required fields
    if (!start_time || !end_time || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Parse name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create scheduled event using Calendly Scheduling API
    const bookingPayload = {
      event_type: eventTypeUri,
      start_time: start_time,
      end_time: end_time,
      invitee: {
        name: name,
        email: `${phone.replace(/\D/g, '')}@temp.calendly.com`, // Temporary email if not provided
        first_name: firstName,
        last_name: lastName || 'N/A',
        phone_number: phone,
        questions_and_answers: [
          {
            question: 'School',
            answer: school || 'N/A',
          },
          {
            question: 'Grades Taught',
            answer: grades || 'N/A',
          },
        ],
      },
    };

    const response = await fetch('https://api.calendly.com/scheduled_events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${calendlyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendly booking error:', errorText);
      throw new Error('Failed to book appointment with Calendly');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      booking: data.resource,
    });
  } catch (error) {
    console.error('Error booking Calendly appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
