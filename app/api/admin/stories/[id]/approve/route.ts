import { NextRequest, NextResponse } from 'next/server';
import { getStoryById, updateStoryStatus } from '@/lib/db';

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Check credentials against environment variables
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'changeme';

  return username === validUsername && password === validPassword;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid story ID' },
      { status: 400 }
    );
  }

  try {
    // Get the story from the database
    const result = await getStoryById(id);

    if (!result.success || !result.story) {
      throw new Error('Story not found');
    }

    const story = result.story;

    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const scheduleUrl = `${baseUrl}/schedule?id=${story.public_id}`;

    // Send data to approval webhook if configured
    const webhookUrl = process.env.APPROVE_TEACHER_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Approval webhook not configured' },
        { status: 500 }
      );
    }

    console.log('📧 Sending approval webhook for story:', story.id);
    console.log('   Webhook URL:', webhookUrl);
    console.log('   Schedule URL:', scheduleUrl);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: story.id,
        publicId: story.public_id,
        name: story.name,
        email: story.email,
        school: story.school,
        grades: story.grades,
        role: story.role,
        phone: story.phone,
        verificationLink: story.verification_link,
        aiUsage: story.story,
        schedule_url: scheduleUrl,
        approvedAt: new Date().toISOString(),
      }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ Webhook error:', errorText);
      throw new Error('Failed to send approval notification');
    }

    console.log('✅ Approval webhook sent successfully');

    // Update story status to 'sent_for_interview'
    const updateResult = await updateStoryStatus(id, 'sent_for_interview');
    if (!updateResult.success) {
      console.error('⚠️ Failed to update story status, but approval was sent');
    }

    return NextResponse.json({
      success: true,
      message: 'Approval notification sent successfully',
      scheduleUrl,
    });
  } catch (error) {
    console.error('Error approving story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve story';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
