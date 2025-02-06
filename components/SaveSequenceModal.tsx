'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface SaveSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isPublic: boolean) => void;
  isSaving: boolean;
}

export default function SaveSequenceModal({
  isOpen,
  onClose,
  onSave,
  isSaving
}: SaveSequenceModalProps) {
  const [sequenceName, setSequenceName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!sequenceName.trim()) {
      setError('Please enter a name for your sequence');
      return;
    }
    onSave(sequenceName.trim(), isPublic);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="brutalist-card"
          >
            <Dialog.Title className="text-2xl font-bold mb-4">
              Save Your Sequence
            </Dialog.Title>

            <div className="space-y-6">
              {/* Sequence Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sequence Name
                </label>
                <input
                  type="text"
                  value={sequenceName}
                  onChange={(e) => {
                    setSequenceName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter a name for your sequence"
                  className="brutalist-input"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Visibility Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">
                  Visibility
                </label>
                
                {/* Private Option */}
                <button
                  onClick={() => setIsPublic(false)}
                  className={`w-full p-4 flex items-center gap-4 border-2 rounded-lg transition-colors ${
                    !isPublic 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/30 hover:border-primary/30'
                  }`}
                >
                  <LockClosedIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-muted-foreground">
                      Only you can see this sequence
                    </div>
                  </div>
                </button>

                {/* Public Option */}
                <button
                  onClick={() => setIsPublic(true)}
                  className={`w-full p-4 flex items-center gap-4 border-2 rounded-lg transition-colors ${
                    isPublic 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/30 hover:border-primary/30'
                  }`}
                >
                  <GlobeAltIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-muted-foreground">
                      Share with the Sequence community
                    </div>
                  </div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="brutalist-button-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="brutalist-button-primary"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Sequence'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 