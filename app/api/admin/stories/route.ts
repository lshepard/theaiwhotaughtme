import { NextRequest, NextResponse } from 'next/server';
import { getAllStories } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    console.log('Authentication failed');
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  console.log('Authenticated successfully, fetching stories...');

  try {
    const result = await getAllStories();

    if (!result.success) {
      console.error('getAllStories returned unsuccessful result:', result.error);
      throw new Error(result.error instanceof Error ? result.error.message : 'Failed to fetch stories from database');
    }

    console.log(`Successfully fetched ${result.stories?.length || 0} stories`);

    return NextResponse.json({
      success: true,
      stories: result.stories,
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stories';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
