# The AI Who Taught Me - Website Implementation Plan

## Project Overview
A lightweight podcast website for theaiwhotaughtme.com, deployed on Vercel.

## Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **Database** (Phase 2): Supabase

### Phase 1: Core Podcast Site

#### Features
1. **RSS Feed Proxy** (`/feed.xml`) - Proxies to Podbean's feed to maintain subscriber compatibility
2. **Homepage** with three sections:
   - Hero/Intro: Photo + "Why This Podcast Exists"
   - Teacher CTA: Invitation with button (will link to `/contribute` in Phase 2)
   - Podcast Episodes: RSS-powered episode list with HTML5 audio players

---

## Phase 1 TODO List

### Setup & Configuration
- [ ] Initialize Next.js project with TypeScript and Tailwind CSS
- [ ] Install dependencies (xml2js or fast-xml-parser for RSS parsing)
- [ ] Set up environment variables template
- [ ] Configure basic project structure

### RSS Feed Proxy
- [ ] Create `/app/feed.xml/route.ts` API route
- [ ] Implement fetch and passthrough for Podbean RSS feed
- [ ] Test that `/feed.xml` returns valid RSS

### RSS Parsing & Data Fetching
- [ ] Create utility function to fetch and parse RSS feed
- [ ] Extract episode data (title, description, audio URL, pub date, artwork)
- [ ] Test RSS parsing

### Components
- [ ] Create `Hero` component (intro section with placeholder for photo and "why" text)
- [ ] Create `TeacherCTA` component (call-to-action section with button)
- [ ] Create `EpisodeCard` component (individual episode with HTML5 audio player)
- [ ] Create `PodcastEpisodes` component (fetches and displays episode list)

### Homepage Integration
- [ ] Build homepage (`/app/page.tsx`) with all three sections
- [ ] Style with Tailwind CSS
- [ ] Make responsive for mobile/tablet/desktop
- [ ] Add loading states

### Styling & Polish
- [ ] Choose color scheme and typography
- [ ] Style audio players
- [ ] Add podcast branding/logo (if available)
- [ ] Ensure proper spacing and layout
- [ ] Test on different screen sizes

### Deployment
- [ ] Create Vercel project
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test `/feed.xml` endpoint in production
- [ ] Test episode playback
- [ ] Configure custom domain (theaiwhotaughtme.com)

### Documentation
- [ ] Create README with setup instructions
- [ ] Document environment variables
- [ ] Add deployment notes

---

## Phase 2 (Future)

### Teacher Submission Feature
- [ ] Set up Supabase database and schema
- [ ] Create `/contribute` page with form
- [ ] Build API route for form submissions
- [ ] Integrate calendar scheduling (Calendly)
- [ ] Update CTA button to link to `/contribute`
- [ ] Add email notifications
- [ ] Deploy updates

---

## Environment Variables

```bash
# .env.local
PODBEAN_RSS_URL=https://www.theaiwhotaughtme.com/feed.xml
```

---

## File Structure

```
/theaiwhotaughtme
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── feed.xml/
│   │   └── route.ts                # RSS proxy
│   └── api/
│       └── episodes/
│           └── route.ts            # RSS fetch/parse API
├── components/
│   ├── Hero.tsx                    # Intro section
│   ├── TeacherCTA.tsx              # CTA section
│   ├── PodcastEpisodes.tsx         # Episode list
│   └── EpisodeCard.tsx             # Single episode
├── lib/
│   └── rss.ts                      # RSS parsing utilities
├── types/
│   └── episode.ts                  # TypeScript types
├── public/
│   └── images/                     # Assets
├── .env.local
├── TODO.md
└── README.md
```
