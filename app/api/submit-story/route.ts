import { NextRequest, NextResponse } from 'next/server';
import { insertStory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { story, name, email, phone, school } = body;

    // Validate required fields
    if (!story || !name) {
      return NextResponse.json(
        { error: 'Story and name are required' },
        { status: 400 }
      );
    }

    // Validate that at least email or phone is provided
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone must be provided' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await insertStory({
      story,
      name,
      email,
      phone,
      school,
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
