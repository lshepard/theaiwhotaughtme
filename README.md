# The AI Who Taught Me

A podcast website showcasing episodes about how teachers are using AI in education.

## Features

- **RSS Feed Proxy**: Maintains subscriber compatibility by proxying the Podbean RSS feed at `/feed.xml`
- **Episode Display**: Auto-fetches and displays podcast episodes with in-page HTML5 audio players
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Server-Side Rendering**: Fast page loads with Next.js 14 App Router

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Deployment to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
5. Add environment variable (optional):
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g., `https://theaiwhotaughtme.com`)
6. Click **Deploy**

### Custom Domain Setup

1. After deployment, go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain: `theaiwhotaughtme.com`
4. Follow Vercel's instructions to update your DNS records
5. Vercel will automatically provision SSL certificate

### RSS Feed Testing

After deployment, verify the RSS feed works:

```bash
# Should return XML RSS feed
curl https://theaiwhotaughtme.com/feed.xml
```

Test with podcast apps:
- Add `https://theaiwhotaughtme.com/feed.xml` to your podcast app
- Episodes should load correctly

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Homepage with 3 sections
│   ├── globals.css             # Global styles
│   └── feed.xml/
│       └── route.ts            # RSS proxy endpoint
├── components/
│   ├── Hero.tsx                # Intro section
│   ├── TeacherCTA.tsx          # Call-to-action section
│   ├── EpisodeCard.tsx         # Individual episode display
│   └── PodcastEpisodes.tsx     # Episode list fetcher
├── lib/
│   └── rss.ts                  # RSS parsing utility
├── types/
│   └── episode.ts              # Episode TypeScript interface
└── public/
    └── images/                 # Static assets
```

## Environment Variables

### Optional

- `NEXT_PUBLIC_SITE_URL` - Your production domain
  - Used to determine RSS feed URL (proxy vs direct)
  - Defaults to Podbean direct URL if not set

## RSS Feed Behavior

- **Development/Build**: Fetches directly from Podbean
- **Production**: Uses your domain's `/feed.xml` proxy
- **Caching**: 15-minute cache to reduce load

## Future Enhancements (Phase 2)

- Teacher story submission form at `/contribute`
- Supabase database for storing submissions
- Calendar integration for interview scheduling
- Gift card tracking system
- Admin panel for reviewing submissions

## License

Private project - All rights reserved
