import { NextRequest, NextResponse } from 'next/server';
import { insertStory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { story, name, email, phone, school, grades } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await insertStory({
      story: story || '', // Story is now optional
      name,
      email,
      phone,
      school,
      grades,
    });

    if (!result.success) {
      throw new Error('Failed to save story');
    }

    return NextResponse.json(
      { success: true, id: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'Failed to submit story' },
      { status: 500 }
    );
  }
}
