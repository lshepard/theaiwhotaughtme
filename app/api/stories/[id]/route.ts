import { NextRequest, NextResponse } from 'next/server';
import { getStoryById } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Accept either numeric ID or public_id (alphanumeric code)
    const result = await getStoryById(params.id);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story: result.story,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

