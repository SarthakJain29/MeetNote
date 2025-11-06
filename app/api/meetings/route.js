import { supabase } from '../../lib/supabaseClient'

export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, summary, tasks, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

