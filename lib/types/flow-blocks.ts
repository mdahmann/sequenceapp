import { YogaPose } from '@/lib/data/poses';

export interface FlowBlockTiming {
  pose_id: number;
  duration: string;
  transition_in?: string;
  transition_out?: string;
  bilateral_note?: string;
}

export interface TimingPattern {
  default_round: {
    duration_type: 'breath' | 'seconds';
    count: number;
  };
  subsequent_rounds?: {
    duration_type: 'breath' | 'seconds';
    count: number;
  };
  final_round?: {
    duration_type: 'breath' | 'seconds';
    count: number;
  };
  rest_between?: {
    duration_type: 'breath' | 'seconds';
    count: number;
  };
}

export interface FlowBlockRepetition {
  count: number;
  timing_per_round?: FlowBlockTiming[];
  bilateral: boolean;
  build_up?: boolean;
  rest_between_rounds?: string;
}

export interface FlowBlock {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  poses: YogaPose[];
  timing?: Record<number, FlowBlockTiming>;
  timing_pattern?: TimingPattern;
  transitions?: Record<string, any>;
  repetitions?: FlowBlockRepetition;
  is_bilateral: boolean;
  is_public: boolean;
  category?: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Expert';
  parent_block_id?: number;
  nested_position?: number;
  created_at: string;
  updated_at: string;
}

export interface FlowBlockReference {
  id: number;
  sequence_id: number;
  flow_block_id: number;
  position: number;
  repetitions: number;
  created_at: string;
}

export const FLOW_BLOCK_CATEGORIES = [
  'Sun Salutation',
  'Moon Salutation',
  'Standing Flow',
  'Balancing Flow',
  'Core Flow',
  'Hip Opening Flow',
  'Backbend Flow',
  'Forward Fold Flow',
  'Twisting Flow',
  'Custom Flow'
] as const;

export type FlowBlockCategory = typeof FLOW_BLOCK_CATEGORIES[number];

export const DEFAULT_TIMING_PATTERN: TimingPattern = {
  default_round: {
    duration_type: 'breath',
    count: 5
  },
  subsequent_rounds: {
    duration_type: 'breath',
    count: 3
  },
  final_round: {
    duration_type: 'breath',
    count: 5
  },
  rest_between: {
    duration_type: 'breath',
    count: 2
  }
}; 