// Script to fetch your Calendly Event Type URI
// Run with: node scripts/get-calendly-event-type.js

const fs = require('fs');
const path = require('path');

// Try to load from .env or .env.local
let CALENDLY_API_TOKEN = process.env.CALENDLY_API_TOKEN;

if (!CALENDLY_API_TOKEN) {
  const envFiles = ['.env', '.env.local'];

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/CALENDLY_API_TOKEN=(.+)/);
      if (match) {
        CALENDLY_API_TOKEN = match[1].trim();
        console.log(`📁 Loaded CALENDLY_API_TOKEN from ${envFile}\n`);
        break;
      }
    }
  }
}

if (!CALENDLY_API_TOKEN) {
  console.error('❌ CALENDLY_API_TOKEN not found in .env or .env.local');
  process.exit(1);
}

async function getEventTypes() {
  try {
    // First, get the current user to get their organization
    console.log('🔍 Fetching your Calendly user info...\n');
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      throw new Error(`Failed to fetch user: ${error}`);
    }

    const userData = await userResponse.json();
    const userUri = userData.resource.uri;

    console.log('✅ User found:', userData.resource.name);
    console.log('   Email:', userData.resource.email);
    console.log('   URI:', userUri);
    console.log('');

    // Now fetch event types for this user
    console.log('🔍 Fetching your event types...\n');
    const eventTypesResponse = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`,
      {
        headers: {
          'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!eventTypesResponse.ok) {
      const error = await eventTypesResponse.text();
      throw new Error(`Failed to fetch event types: ${error}`);
    }

    const eventTypesData = await eventTypesResponse.json();

    if (!eventTypesData.collection || eventTypesData.collection.length === 0) {
      console.log('⚠️  No event types found');
      return;
    }

    console.log('📅 Found', eventTypesData.collection.length, 'event type(s):\n');

    eventTypesData.collection.forEach((eventType, index) => {
      console.log(`${index + 1}. ${eventType.name}`);
      console.log(`   Slug: ${eventType.slug}`);
      console.log(`   Duration: ${eventType.duration} minutes`);
      console.log(`   📍 API URI: ${eventType.uri}`);
      console.log(`   🔗 Scheduling URL: ${eventType.scheduling_url}`);
      console.log('');
    });

    // Find the teacher-interview event type
    const teacherInterview = eventTypesData.collection.find(
      et => et.slug === 'teacher-interview' || et.scheduling_url?.includes('teacher-interview')
    );

    if (teacherInterview) {
      console.log('✅ Found "teacher-interview" event type!');
      console.log('');
      console.log('Add this to your .env.local:');
      console.log('');
      console.log(`CALENDLY_EVENT_TYPE_URI=${teacherInterview.uri}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getEventTypes();
