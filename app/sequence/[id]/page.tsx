import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Metadata, ResolvingMetadata } from 'next';
import SequenceContent from './SequenceContent';

interface Props {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get sequence data from Supabase
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: sequence } = await supabase
    .from('sequences')
    .select('name')
    .eq('id', params.id)
    .eq('is_public', true)
    .single();

  // Get the parent metadata (e.g., the default title template)
  const previousMetadata = await parent;

  // Return modified metadata
  return {
    title: sequence?.name 
      ? `${sequence.name} | Sequence` 
      : 'Sequence - AI Yoga Sequence Generator',
    description: sequence?.name 
      ? `View and practice "${sequence.name}" - a yoga sequence on Sequence`
      : 'Generate personalized yoga sequences with AI',
    openGraph: {
      title: sequence?.name 
        ? `${sequence.name} | Sequence` 
        : 'Sequence - AI Yoga Sequence Generator',
      description: sequence?.name 
        ? `View and practice "${sequence.name}" - a yoga sequence on Sequence`
        : 'Generate personalized yoga sequences with AI',
    },
    twitter: {
      title: sequence?.name 
        ? `${sequence.name} | Sequence` 
        : 'Sequence - AI Yoga Sequence Generator',
      description: sequence?.name 
        ? `View and practice "${sequence.name}" - a yoga sequence on Sequence`
        : 'Generate personalized yoga sequences with AI',
    }
  };
}

export default function SequencePage({ params }: Props) {
  return <SequenceContent params={params} />;
} 