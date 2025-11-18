import { NextRequest, NextResponse } from 'next/server';
import { updateStoryStatus } from '@/lib/db';
import crypto from 'crypto';

// Verify the webhook signature from Cal.com
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    console.log('📨 Webhook received from Cal.com');
    console.log('   Event type:', body.triggerEvent);

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.CAL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-cal-signature-256');
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️  Webhook secret not configured - skipping signature verification');
    }

    // Handle booking created event
    if (body.triggerEvent === 'BOOKING_CREATED') {
      console.log('📅 Processing BOOKING_CREATED event');

      // Extract story ID from metadata
      const metadata = body.payload?.metadata;
      const storyId = metadata?.storyId;

      if (!storyId) {
        console.log('ℹ️  No story ID found in booking metadata - skipping status update');
        return NextResponse.json({
          success: true,
          message: 'Booking received but no story ID found'
        });
      }

      console.log('   Story ID:', storyId);
      console.log('   Booking ID:', body.payload?.id);
      console.log('   Attendee:', body.payload?.attendees?.[0]?.name);

      // Update story status to 'scheduled'
      const result = await updateStoryStatus(parseInt(storyId, 10), 'scheduled');

      if (!result.success) {
        console.error('❌ Failed to update story status:', result.error);
        return NextResponse.json(
          { error: 'Failed to update story status' },
          { status: 500 }
        );
      }

      console.log('✅ Story status updated to "scheduled"');

      return NextResponse.json({
        success: true,
        message: 'Story status updated to scheduled',
        storyId,
      });
    }

    // Handle other events (for logging/future expansion)
    console.log('ℹ️  Event type not handled:', body.triggerEvent);

    return NextResponse.json({
      success: true,
      message: 'Event received',
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
