import { motion } from 'framer-motion';

interface LoadingSequenceProps {
  duration: number;
  level: string;
  focus: string[];
}

export default function LoadingSequence({ duration, level, focus }: LoadingSequenceProps) {
  // Calculate approximate number of poses based on duration
  const estimatedPoses = Math.ceil(duration / 2); // Rough estimate of 2 minutes per pose

  // Create sections based on a typical class structure
  const sections = [
    { name: 'Warm-up', percentage: 0.2 },
    { name: 'Standing Poses', percentage: 0.4 },
    { name: 'Peak Work', percentage: 0.2 },
    { name: 'Cool Down', percentage: 0.2 }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Sequence Header */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-white/5 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-white/5 animate-pulse rounded" />
          <div className="h-6 w-24 bg-white/5 animate-pulse rounded" />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={section.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-muted-foreground">{section.name}</h3>
          <div className="space-y-2">
            {Array.from({ length: Math.ceil(estimatedPoses * section.percentage) }).map((_, index) => (
              <motion.div
                key={`${section.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (sectionIndex * 0.2) + (index * 0.1) }}
                className="brutalist-card bg-white/5 h-16 animate-pulse"
              />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-4 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Generating your sequence...</span>
      </div>
    </div>
  );
} 