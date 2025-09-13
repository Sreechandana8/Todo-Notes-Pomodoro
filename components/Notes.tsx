
import React, { useState, useEffect } from 'react';
import type { Folder, Note } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlusIcon, TrashIcon, FolderIcon, DocumentIcon } from './Icons';

export const Notes: React.FC = () => {
    const [folders, setFolders] = useLocalStorage<Folder[]>('notes_folders', [{ id: 'default', name: 'My First Folder', notes: [] }]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders.length > 0 ? folders[0].id : null);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedFolderId && folders.length > 0) {
            setSelectedFolderId(folders[0].id);
        }
        if (folders.length === 0) {
            setSelectedFolderId(null);
            setSelectedNoteId(null);
        }
    }, [folders, selectedFolderId]);

    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    const selectedNote = selectedFolder?.notes.find(n => n.id === selectedNoteId);

    const handleAddFolder = () => {
        const folderName = prompt("Enter folder name:");
        if (folderName) {
            const newFolder: Folder = {
                id: crypto.randomUUID(),
                name: folderName,
                notes: []
            };
            setFolders([...folders, newFolder]);
            setSelectedFolderId(newFolder.id);
            setSelectedNoteId(null);
        }
    };

    const handleDeleteFolder = (folderId: string) => {
        if (window.confirm("Are you sure you want to delete this folder and all its notes?")) {
            const newFolders = folders.filter(f => f.id !== folderId);
            setFolders(newFolders);
            if (selectedFolderId === folderId) {
                setSelectedFolderId(newFolders.length > 0 ? newFolders[0].id : null);
                setSelectedNoteId(null);
            }
        }
    };

    const handleAddNote = () => {
        if (!selectedFolderId) return;
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '',
            createdAt: Date.now()
        };
        const newFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return { ...f, notes: [newNote, ...f.notes] };
            }
            return f;
        });
        setFolders(newFolders);
        setSelectedNoteId(newNote.id);
    };

    const handleDeleteNote = (noteId: string) => {
         if (!selectedFolderId) return;
         const newFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return { ...f, notes: f.notes.filter(n => n.id !== noteId) };
            }
            return f;
        });
        setFolders(newFolders);
        if (selectedNoteId === noteId) {
            setSelectedNoteId(null);
        }
    };

    const handleNoteChange = (field: 'title' | 'content', value: string) => {
        if (!selectedFolderId || !selectedNoteId) return;
        const newFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return {
                    ...f,
                    notes: f.notes.map(n => n.id === selectedNoteId ? { ...n, [field]: value } : n)
                };
            }
            return f;
        });
        setFolders(newFolders);
    };
    
    return (
        <div className="flex h-[calc(100vh-69px)] text-slate-300">
            <aside className="w-1/4 max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-sky-400">Folders</h2>
                    <button onClick={handleAddFolder} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {folders.map(folder => (
                        <div key={folder.id} onClick={() => {setSelectedFolderId(folder.id); setSelectedNoteId(null);}}
                            className={`p-3 m-2 flex items-center justify-between cursor-pointer rounded-md group ${selectedFolderId === folder.id ? 'bg-sky-900/50' : 'hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-2 truncate">
                                <FolderIcon className="w-5 h-5 text-sky-500 flex-shrink-0"/>
                                <span className="truncate">{folder.name}</span>
                            </div>
                            {folders.length > 1 &&
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="p-1 text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                            }
                        </div>
                    ))}
                </div>
            </aside>

            <section className="w-1/4 max-w-xs bg-slate-900/50 border-r border-slate-800 flex flex-col">
                 <div className="p-4 flex justify-between items-center border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-sky-400 truncate">{selectedFolder?.name || 'Notes'}</h2>
                    {selectedFolder && 
                        <button onClick={handleAddNote} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors">
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    }
                </div>
                <div className="flex-grow overflow-y-auto">
                    {selectedFolder?.notes.sort((a,b) => b.createdAt - a.createdAt).map(note => (
                         <div key={note.id} onClick={() => setSelectedNoteId(note.id)}
                            className={`p-3 m-2 block cursor-pointer rounded-md group ${selectedNoteId === note.id ? 'bg-sky-900' : 'hover:bg-slate-800'}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold truncate text-slate-200">{note.title || 'Untitled Note'}</h3>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-1 text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 truncate">{note.content || 'No content'}</p>
                         </div>
                    ))}
                     {selectedFolder && selectedFolder.notes.length === 0 && (
                        <div className="p-4 text-center text-slate-500">
                           No notes in this folder.
                        </div>
                    )}
                     {!selectedFolder && (
                        <div className="p-4 text-center text-slate-500">
                           Select or create a folder.
                        </div>
                    )}
                </div>
            </section>

            <main className="flex-grow flex flex-col bg-black">
                {selectedNote ? (
                    <>
                        <div className="p-4 border-b border-slate-800">
                            <input 
                                type="text" 
                                value={selectedNote.title}
                                onChange={(e) => handleNoteChange('title', e.target.value)}
                                placeholder="Note Title"
                                className="w-full bg-transparent text-2xl font-bold text-slate-100 focus:outline-none"
                            />
                        </div>
                        <textarea
                            value={selectedNote.content}
                            onChange={(e) => handleNoteChange('content', e.target.value)}
                            placeholder="Start writing..."
                            className="flex-grow w-full p-4 bg-transparent text-slate-300 focus:outline-none resize-none"
                        ></textarea>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <DocumentIcon className="w-16 h-16 mx-auto text-slate-700"/>
                            <p className="mt-2">{selectedFolder ? 'Select a note to view or create a new one.' : 'Select a folder to begin.'}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
