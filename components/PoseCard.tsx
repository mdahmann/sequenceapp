import React from 'react';
import { Card } from './ui/card';
import { usePose } from '@/hooks/usePose';

interface PoseCardProps {
  poseId: string;
}

export function PoseCard({ poseId }: PoseCardProps) {
  const pose = usePose(poseId);

  if (!pose) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded mt-2" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="font-medium">{pose.english_name}</h4>
      <p className="text-sm text-muted-foreground">{pose.sanskrit_name}</p>
    </Card>
  );
} 