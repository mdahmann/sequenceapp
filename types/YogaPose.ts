export interface YogaPose {
  id: number | string;
  english_name: string;
  sanskrit_name: string;
  sanskrit_name_adapted?: string;
  translation_name?: string;
  pose_description: string;
  pose_benefits?: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Expert';
  category_name: string;
  user_id?: string;
} 