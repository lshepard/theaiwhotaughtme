import { NextResponse } from 'next/server';

const PODBEAN_RSS_URL = 'https://www.theaiwhotaughtme.com/feed.xml';

export async function GET() {
  try {
    // Fetch the RSS feed from Podbean
    const response = await fetch(PODBEAN_RSS_URL, {
      // Cache for 15 minutes to reduce load on Podbean
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const rssContent = await response.text();

    // Return the RSS content with appropriate headers
    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error proxying RSS feed:', error);
    return new NextResponse('Error fetching RSS feed', { status: 500 });
  }
}
