import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlowBlock } from '@/lib/types/flow-blocks';
import { supabase } from '@/lib/supabase';
import FlowBlockManager from './FlowBlockManager';

interface NestedFlowBlockProps {
  parentBlockId: number;
  onSelect?: (flowBlock: FlowBlock) => void;
}

export default function NestedFlowBlock({
  parentBlockId,
  onSelect
}: NestedFlowBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [childBlocks, setChildBlocks] = useState<FlowBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded) {
      loadChildBlocks();
    }
  }, [isExpanded, parentBlockId]);

  const loadChildBlocks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('flow_blocks')
        .select('*')
        .eq('parent_block_id', parentBlockId)
        .order('nested_position', { ascending: true });

      if (error) throw error;

      setChildBlocks(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading child blocks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockSelect = (block: FlowBlock) => {
    onSelect?.(block);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>Nested Flows</span>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pl-6 border-l border-white/10"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-400 py-2">{error}</div>
          ) : childBlocks.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No nested flows found
            </div>
          ) : (
            <div className="space-y-2">
              {childBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleBlockSelect(block)}
                >
                  <h4 className="font-medium">{block.name}</h4>
                  {block.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {block.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary-foreground">
                      {block.difficulty_level}
                    </span>
                    {block.is_bilateral && (
                      <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent-foreground">
                        Bilateral
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <FlowBlockManager
              mode="manage"
              parentBlockId={parentBlockId}
              onSelectFlowBlock={handleBlockSelect}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
} 