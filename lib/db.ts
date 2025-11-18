import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export type StoryStatus = 'initial' | 'sent_for_interview' | 'scheduled' | 'completed';

// Generate a random 6-character alphanumeric code
function generatePublicId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a unique public ID by checking against existing ones
async function generateUniquePublicId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const publicId = generatePublicId();

    // Check if it exists
    const { data, error } = await supabase
      .from('stories')
      .select('id')
      .eq('public_id', publicId)
      .single();

    // If no match found, this ID is unique
    if (error && error.code === 'PGRST116') {
      return publicId;
    }

    attempts++;
  }

  // Fallback to longer ID if we have collisions
  return generatePublicId() + Math.random().toString(36).substring(2, 4);
}

export interface Story {
  id: number;
  public_id: string;
  story: string;
  name: string;
  email: string | null;
  phone: string | null;
  school: string | null;
  grades: string | null;
  role: string | null;
  verification_link: string | null;
  status: StoryStatus;
  created_at: string;
}

export async function insertStory(data: {
  story: string;
  name: string;
  email?: string;
  phone?: string;
  school?: string;
  grades?: string;
  role?: string;
  verificationLink?: string;
}) {
  try {
    // Generate unique public ID
    const publicId = await generateUniquePublicId();

    const { data: result, error } = await supabase
      .from('stories')
      .insert([
        {
          public_id: publicId,
          story: data.story,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          school: data.school || null,
          grades: data.grades || null,
          role: data.role || null,
          verification_link: data.verificationLink || null,
        },
      ])
      .select('id, public_id')
      .single();

    if (error) {
      throw error;
    }

    return { success: true, id: result.id, publicId: result.public_id };
  } catch (error) {
    console.error('Error inserting story:', error);
    return { success: false, error };
  }
}

export async function getAllStories() {
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, stories: stories as Story[] };
  } catch (error) {
    console.error('Error fetching stories:', error);
    return { success: false, error };
  }
}

export async function getStoryById(id: number | string) {
  try {
    // If it's a number or numeric string, use id. Otherwise use public_id
    const isNumericId = typeof id === 'number' || /^\d+$/.test(id);

    const query = supabase
      .from('stories')
      .select('*');

    const { data: story, error } = isNumericId
      ? await query.eq('id', typeof id === 'string' ? parseInt(id, 10) : id).single()
      : await query.eq('public_id', id).single();

    if (error) {
      throw error;
    }

    return { success: true, story: story as Story };
  } catch (error) {
    console.error('Error fetching story:', error);
    return { success: false, error };
  }
}

export async function deleteStory(id: number) {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting story:', error);
    return { success: false, error };
  }
}

export async function updateStoryStatus(id: number, status: StoryStatus) {
  try {
    const { error } = await supabase
      .from('stories')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating story status:', error);
    return { success: false, error };
  }
}
