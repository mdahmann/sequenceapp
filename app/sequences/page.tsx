'use client';

import { useState } from 'react';

export default function SequencesPage() {
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Beginner');
  const [focus, setFocus] = useState('');
  const [style, setStyle] = useState('');
  const [sequence, setSequence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          difficulty,
          focus: focus || undefined,
          style: style || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sequence');
      }

      const data = await response.json();
      setSequence(data.sequence);
    } catch (err) {
      setError('Failed to generate sequence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Generate Yoga Sequence</h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={5}
            max={120}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        {/* Focus Area */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Focus Area (optional)
          </label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g., hip opening, back bending, strength"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Style (optional)
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g., vinyasa flow, gentle, power"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Sequence'}
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </form>

      {/* Generated Sequence */}
      {sequence && (
        <div className="mt-8 p-6 rounded-lg bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Your Yoga Sequence</h2>
          <div className="whitespace-pre-wrap">{sequence}</div>
        </div>
      )}
    </div>
  );
} 