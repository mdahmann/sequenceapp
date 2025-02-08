import { YogaPose } from '@/lib/data/poses';
import { FlowBlockTiming } from '@/lib/types/flow-blocks';
import { motion } from 'framer-motion';

interface BilateralPoseProps {
  pose: YogaPose;
  side: 'left' | 'right' | 'both';
  timing: FlowBlockTiming;
  showTransitions?: boolean;
  onSideChange?: (side: 'left' | 'right' | 'both') => void;
  className?: string;
}

export default function BilateralPoseCard({
  pose,
  side,
  timing,
  showTransitions = true,
  onSideChange,
  className = ''
}: BilateralPoseProps) {
  const sideIndicator = side === 'both' ? 
    '(Both Sides)' : 
    `(${side.charAt(0).toUpperCase() + side.slice(1)} Side)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 ${className}`}
    >
      {/* Side indicator badge */}
      <div 
        className="absolute top-2 right-2 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {onSideChange && (
          <div className="flex gap-1">
            <button
              onClick={() => onSideChange('left')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                side === 'left' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              L
            </button>
            <button
              onClick={() => onSideChange('right')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                side === 'right' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              R
            </button>
            <button
              onClick={() => onSideChange('both')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                side === 'both' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Both
            </button>
          </div>
        )}
        {!onSideChange && (
          <div className="px-2 py-1 text-xs rounded bg-primary/20 text-primary-foreground">
            {sideIndicator}
          </div>
        )}
      </div>
      
      {/* Pose details */}
      <div className="flex-1 pt-6">
        <h4 className="font-medium">{pose.english_name}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          {pose.sanskrit_name && (
            <span className="block text-xs text-muted-foreground/70">
              {pose.sanskrit_name}
            </span>
          )}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-accent-foreground">
            {timing.duration}
          </p>
          {showTransitions && (
            <>
              {timing.transition_in && (
                <p className="text-sm text-muted-foreground">
                  <span className="text-xs text-muted-foreground/70">Entry: </span>
                  {timing.transition_in}
                </p>
              )}
              {timing.transition_out && (
                <p className="text-sm text-muted-foreground">
                  <span className="text-xs text-muted-foreground/70">Exit: </span>
                  {timing.transition_out}
                </p>
              )}
            </>
          )}
          {timing.bilateral_note && (
            <p className="text-sm italic text-muted-foreground">
              {timing.bilateral_note}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 