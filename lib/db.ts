import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export type StoryStatus = 'initial' | 'sent_for_interview' | 'scheduled' | 'completed';

export interface Story {
  id: number;
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
    const { data: result, error } = await supabase
      .from('stories')
      .insert([
        {
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
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return { success: true, id: result.id };
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

export async function getStoryById(id: number) {
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

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
