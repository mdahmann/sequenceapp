import { YogaPose } from './data/poses';

export interface SavedSequence {
  id: string;
  name: string;
  description?: string;
  created: string;
  duration: number;
  difficulty_level: string;
  focus_areas: string[];
  poses: YogaPose[];
}

export async function getSavedSequences(): Promise<SavedSequence[]> {
  try {
    const response = await fetch('/api/sequence');
    if (!response.ok) throw new Error('Failed to fetch sequences');
    const { sequences } = await response.json();
    return sequences || [];
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return [];
  }
}

export async function saveSequence(sequence: Omit<SavedSequence, 'id' | 'created'>): Promise<SavedSequence | null> {
  try {
    const response = await fetch('/api/sequence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sequence),
    });
    
    if (!response.ok) throw new Error('Failed to save sequence');
    const { sequence: savedSequence } = await response.json();
    return savedSequence || null;
  } catch (error) {
    console.error('Error saving sequence:', error);
    return null;
  }
}

export async function deleteSequence(id: string): Promise<boolean> {
  try {
    const response = await fetch('/api/sequence', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    if (!response.ok) throw new Error('Failed to delete sequence');
    const { success } = await response.json();
    return success || false;
  } catch (error) {
    console.error('Error deleting sequence:', error);
    return false;
  }
} 