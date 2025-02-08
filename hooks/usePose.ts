import { useQuery } from '@tanstack/react-query';
import { YogaPose } from '@/types/YogaPose';

async function fetchPose(poseId: string): Promise<YogaPose> {
  const response = await fetch(`/api/poses/${poseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pose');
  }
  return response.json();
}

export function usePose(poseId: string) {
  const { data: pose } = useQuery<YogaPose>({
    queryKey: ['pose', poseId],
    queryFn: () => fetchPose(poseId),
  });

  return pose;
} 