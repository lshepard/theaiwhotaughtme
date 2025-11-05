import { XMLParser } from 'fast-xml-parser';
import { Episode } from '@/types/episode';

const PODBEAN_RSS_URL = 'https://www.theaiwhotaughtme.com/feed.xml';

// Use our proxy in production, direct Podbean URL at build time
const RSS_FEED_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`
  : PODBEAN_RSS_URL;

export async function fetchEpisodes(): Promise<Episode[]> {
  try {
    const response = await fetch(RSS_FEED_URL, {
      next: { revalidate: 900 } // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    const result = parser.parse(xmlData);
    const items = result.rss?.channel?.item || [];

    // Ensure items is an array (single item can be returned as object)
    const itemsArray = Array.isArray(items) ? items : [items];

    const episodes: Episode[] = itemsArray.map((item: any) => {
      // Handle enclosure (audio file)
      const enclosure = item.enclosure;
      const audioUrl = enclosure?.['@_url'] || '';

      // Handle iTunes image or channel image
      const itunesImage = item['itunes:image']?.['@_href'];
      const imageUrl = itunesImage || result.rss?.channel?.image?.url || '';

      // Handle iTunes duration
      const duration = item['itunes:duration'] || '';

      return {
        title: item.title || 'Untitled Episode',
        description: item.description || item['itunes:summary'] || '',
        audioUrl,
        pubDate: item.pubDate || '',
        duration,
        imageUrl,
        link: item.link || '',
        guid: item.guid?.['#text'] || item.guid || '',
      };
    });

    return episodes;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}
