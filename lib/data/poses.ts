export interface YogaPose {
  id: number;
  english_name: string;
  sanskrit_name_adapted: string;
  sanskrit_name: string;
  translation_name: string;
  pose_description: string;
  pose_benefits: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Expert';
  category_name: string;
}

export interface YogaCategory {
  id: number;
  category_name: string;
  category_description: string;
  poses: YogaPose[];
}

// We'll fetch this data from the API and store it here
export const yogaPoses: YogaPose[] = [];
export const yogaCategories: YogaCategory[] = []; 