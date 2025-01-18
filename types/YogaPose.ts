export interface YogaPose {
  id: string | number;
  english_name: string;
  sanskrit_name_adapted: string;
  sanskrit_name: string;
  translation_name: string;
  pose_description: string;
  pose_benefits: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Expert';
  category_name: string;
} 