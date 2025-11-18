import { NextRequest, NextResponse } from 'next/server';
import { deleteStory, updateStoryStatus, type StoryStatus } from '@/lib/db';

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

export async function DELETE(
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
    const result = await deleteStory(id);

    if (!result.success) {
      throw new Error(result.error instanceof Error ? result.error.message : 'Failed to delete story');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete story';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses: StoryStatus[] = ['initial', 'sent_for_interview', 'scheduled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: initial, sent_for_interview, scheduled, completed' },
        { status: 400 }
      );
    }

    const result = await updateStoryStatus(id, status);

    if (!result.success) {
      throw new Error(result.error instanceof Error ? result.error.message : 'Failed to update story status');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating story status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update story status';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
