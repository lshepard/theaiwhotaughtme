import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Story {
  id: number;
  story: string;
  name: string;
  email: string | null;
  phone: string | null;
  school: string | null;
  created_at: string;
}

export async function insertStory(data: {
  story: string;
  name: string;
  email?: string;
  phone?: string;
  school?: string;
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
