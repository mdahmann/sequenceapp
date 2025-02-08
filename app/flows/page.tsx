'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FlowBlockManager from '@/components/FlowBlockManager';

export default function FlowsPage() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  return (
    <div className="container py-8">
      <FlowBlockManager />
    </div>
  );
} 