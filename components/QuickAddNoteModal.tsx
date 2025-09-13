import React, { useState, useEffect } from 'react';
import type { Folder } from '../types';
import { XMarkIcon } from './Icons';

interface QuickAddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, folderId: string) => void;
  folders: Folder[];
  currentFolderId: string | null;
}

const animationStyles = `
@keyframes backdrop-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modal-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-backdrop-fade-in { animation: backdrop-fade-in 0.2s ease-out forwards; }
.animate-modal-scale-in { animation: modal-scale-in 0.2s ease-out forwards; }
`;

export const QuickAddNoteModal: React.FC<QuickAddNoteModalProps> = ({ isOpen, onClose, onSave, folders, currentFolderId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
        // When modal opens, determine the default folder
        const defaultFolder = currentFolderId && folders.some(f => f.id === currentFolderId)
            ? currentFolderId
            : (folders.length > 0 ? folders[0].id : '');
        setTargetFolderId(defaultFolder);
        
        // Reset fields
        setTitle('');
        setContent('');

    }
  }, [isOpen, currentFolderId, folders]);

  if (!isOpen) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (folders.length === 0) {
        alert("Please create a folder first.");
        return;
    }
    onSave(title, content, targetFolderId);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 animate-backdrop-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-note-title"
    >
      <style>{animationStyles}</style>
      <div 
        className="bg-slate-900 rounded-lg shadow-xl w-full max-w-lg border border-slate-800 animate-modal-scale-in"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <form onSubmit={handleSave}>
            <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 id="quick-add-note-title" className="text-lg font-semibold text-sky-400">Quick Add Note</h2>
                <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors">
                    <XMarkIcon className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Start writing..."
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                ></textarea>
                <select
                    value={targetFolderId}
                    onChange={e => setTargetFolderId(e.target.value)}
                    disabled={folders.length === 0}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                >
                    {folders.length > 0 ? (
                        folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)
                    ) : (
                        <option>No folders available</option>
                    )}
                </select>
            </div>

            <div className="p-4 sm:p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3 rounded-b-lg">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="bg-yellow-400 text-black font-bold px-4 py-2 text-sm rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={folders.length === 0}
                >
                    Save Note
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};