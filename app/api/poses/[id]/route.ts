import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: pose, error } = await supabase
      .from('poses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!pose) {
      return NextResponse.json(
        { error: 'Pose not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pose);
  } catch (error) {
    console.error('Error fetching pose:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pose' },
      { status: 500 }
    );
  }
} 