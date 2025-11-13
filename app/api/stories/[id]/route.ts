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
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    const result = await getStoryById(id);

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

