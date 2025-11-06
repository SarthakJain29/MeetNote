import { supabase } from '../../lib/supabaseClient'

export async function POST(req) {
  try {
    const { title, transcript, summary, tasks } = await req.json();

    const { data, error } = await supabase
      .from('meetings')
      .insert([{ 
        title: title || "Untitled Meeting",
        transcript,
        summary,
        tasks: tasks || []
      }])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Error saving meeting:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

