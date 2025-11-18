import { NextRequest, NextResponse } from 'next/server';
import { deleteStory } from '@/lib/db';

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
