import React, { useState, useEffect, useMemo } from 'react';
import type { Folder, Note } from '../types';
import { PlusIcon, TrashIcon, ArrowLeftIcon, DocumentTextIcon, CodeBracketIcon, FolderIcon } from './Icons';
import { FocusOrbIcon, AnimatedFolderIcon } from './AnimatedIcons';

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes title-fade-in-up {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-title-fade-in-up-1 { animation: title-fade-in-up 0.4s ease-out 0.1s forwards; }
.animate-title-fade-in-up-2 { animation: title-fade-in-up 0.4s ease-out 0.2s forwards; }
.animate-title-fade-in-up-3 { animation: title-fade-in-up 0.4s ease-out 0.3s forwards; }
`;

// Helper function to determine the note icon
const getNoteIcon = (note: Note) => {
    const content = note.content || '';
    const title = note.title || '';

    // Check for common code file extensions in the title
    const codeExtensions = /\.(js|ts|jsx|tsx|html|css|scss|py|java|sql|md|json|yaml|yml|sh|bash|ps1)$/i;
    if (codeExtensions.test(title)) {
        return <CodeBracketIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
    }

    // Check for markdown code fences or common HTML/XML tags
    if (content.includes('```') || /<([a-z][a-z0-9]*)\b[^>]*>.*?<\/\1>/.test(content)) {
        return <CodeBracketIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
    }

    // Check for common programming keywords
    const codeKeywords = ['function', 'const ', 'let ', 'import ', 'export ', 'class ', 'public static', 'private void'];
    if (codeKeywords.some(keyword => content.includes(keyword))) {
        return <CodeBracketIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
    }
    
    // Default icon
    return <DocumentTextIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />;
};

interface NotesProps {
    folders: Folder[];
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
    selectedFolderId: string | null;
    setSelectedFolderId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedNoteId: string | null;
    setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Notes: React.FC<NotesProps> = ({ folders, setFolders, selectedFolderId, setSelectedFolderId, selectedNoteId, setSelectedNoteId }) => {
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [mobileView, setMobileView] = useState<'folders' | 'notes' | 'editor'>('folders');
    const [editorState, setEditorState] = useState<{ title: string; content: string } | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

    // Drag & Drop State
    const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
    const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);
    const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
    const [dropTargetNoteId, setDropTargetNoteId] = useState<string | null>(null);


    // Reset search, filter, and note selection when folder changes
    useEffect(() => {
        setSearchQuery('');
        setTimeFilter('all');
        setSelectedNoteId(null); 
    }, [selectedFolderId, setSelectedNoteId]);

    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    
    // Sync local editor state when selected note changes
    useEffect(() => {
        const note = selectedFolder?.notes.find(n => n.id === selectedNoteId);
        if (note) {
            setEditorState({ title: note.title, content: note.content });
            setSaveStatus('idle');
        } else {
            setEditorState(null);
        }
    }, [selectedNoteId, selectedFolder]);

    // Debounced auto-save effect
    useEffect(() => {
        if (saveStatus !== 'unsaved' || !editorState || !selectedNoteId) {
            return;
        }

        const handler = setTimeout(() => {
            setSaveStatus('saving');
            setFolders(prevFolders => prevFolders.map(f => {
                if (f.id === selectedFolderId) {
                    return {
                        ...f,
                        notes: f.notes.map(n => 
                            n.id === selectedNoteId 
                            ? { ...n, title: editorState.title, content: editorState.content, createdAt: Date.now() } // Update timestamp on edit
                            : n
                        )
                    };
                }
                return f;
            }));
        }, 1500);

        return () => clearTimeout(handler);
    }, [editorState, selectedFolderId, selectedNoteId, setFolders, saveStatus]);
    
    // Effect to update save status from 'saving' to 'saved'
    useEffect(() => {
        if (saveStatus === 'saving') {
            const note = selectedFolder?.notes.find(n => n.id === selectedNoteId);
            if (note && editorState && note.title === editorState.title && note.content === editorState.content) {
                setSaveStatus('saved');
                const timer = setTimeout(() => setSaveStatus('idle'), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [folders, selectedFolder, selectedNoteId, editorState, saveStatus]);


    const filteredNotes = useMemo(() => {
        if (!selectedFolder) return [];

        let notes = selectedFolder.notes;

        if (searchQuery.trim() !== '') {
            notes = notes.filter(note =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const now = Date.now();
        if (timeFilter === '24h') {
            const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
            notes = notes.filter(note => note.createdAt >= twentyFourHoursAgo);
        } else if (timeFilter === '7d') {
            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
            notes = notes.filter(note => note.createdAt >= sevenDaysAgo);
        }

        return notes;
    }, [selectedFolder, searchQuery, timeFilter]);

    const isFiltered = searchQuery.trim() !== '' || timeFilter !== 'all';

    const handleAddFolder = () => {
        const newFolder: Folder = { id: crypto.randomUUID(), name: 'New Folder', notes: [] };
        setFolders([...folders, newFolder]);
        setSelectedFolderId(newFolder.id);
        setSelectedNoteId(null);
        setEditingFolderId(newFolder.id);
        setEditingFolderName(newFolder.name);
        setMobileView('notes');
    };
    
    const handleRenameFolder = (folderId: string) => {
        const trimmedName = editingFolderName.trim();
        if (trimmedName) {
            setFolders(folders.map(f => f.id === folderId ? { ...f, name: trimmedName } : f));
        }
        setEditingFolderId(null);
    };

    const handleDeleteFolder = (folderId: string) => {
        if (window.confirm("Are you sure you want to delete this folder and all its notes?")) {
            const newFolders = folders.filter(f => f.id !== folderId);
            setFolders(newFolders);
            if (selectedFolderId === folderId) {
                setSelectedFolderId(newFolders.length > 0 ? newFolders[0].id : null);
                setSelectedNoteId(null);
                setMobileView('folders');
            }
        }
    };

    const handleAddNote = () => {
        if (!selectedFolderId) return;
        const newNote: Note = { id: crypto.randomUUID(), title: 'New Note', content: '', createdAt: Date.now() };
        setFolders(folders.map(f => f.id === selectedFolderId ? { ...f, notes: [newNote, ...f.notes] } : f));
        setSelectedNoteId(newNote.id);
        setMobileView('editor');
    };

    const handleDeleteNote = (noteId: string) => {
         if (!selectedFolderId) return;
         setFolders(folders.map(f => f.id === selectedFolderId ? { ...f, notes: f.notes.filter(n => n.id !== noteId) } : f));
        if (selectedNoteId === noteId) {
            setSelectedNoteId(null);
            setMobileView('notes');
        }
    };

    const handleEditorChange = (field: 'title' | 'content', value: string) => {
        if (!editorState) return;
        setEditorState({ ...editorState, [field]: value });
        setSaveStatus('unsaved');
    };
    
    // --- FOLDER D&D HANDLERS ---
    const handleFolderDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedFolderId(id);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleFolderDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedFolderId) setDropTargetFolderId(id);
    }
    const handleFolderDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleFolderDragLeave = () => setDropTargetFolderId(null);
    const handleFolderDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
        e.preventDefault();
        if (!draggedFolderId || draggedFolderId === dropId) return;
        const dragIndex = folders.findIndex(f => f.id === draggedFolderId);
        const dropIndex = folders.findIndex(f => f.id === dropId);
        const newFolders = [...folders];
        const [draggedItem] = newFolders.splice(dragIndex, 1);
        newFolders.splice(dropIndex, 0, draggedItem);
        setFolders(newFolders);
        handleFolderDragEnd();
    };
    const handleFolderDragEnd = () => {
        setDraggedFolderId(null);
        setDropTargetFolderId(null);
    };

    // --- NOTE D&D HANDLERS ---
    const handleNoteDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        if (isFiltered) return;
        setDraggedNoteId(id);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleNoteDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedNoteId) setDropTargetNoteId(id);
    };
    const handleNoteDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleNoteDragLeave = () => setDropTargetNoteId(null);
    const handleNoteDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
        e.preventDefault();
        if (!draggedNoteId || !selectedFolderId || isFiltered) return;
        setFolders(prevFolders => prevFolders.map(f => {
            if (f.id === selectedFolderId) {
                const notes = [...f.notes];
                const dragIndex = notes.findIndex(n => n.id === draggedNoteId);
                const dropIndex = notes.findIndex(n => n.id === dropId);
                if (dragIndex === -1 || dropIndex === -1) return f;
                const [draggedItem] = notes.splice(dragIndex, 1);
                notes.splice(dropIndex, 0, draggedItem);
                return { ...f, notes };
            }
            return f;
        }));
        handleNoteDragEnd();
    };
    const handleNoteDragEnd = () => {
        setDraggedNoteId(null);
        setDropTargetNoteId(null);
    };
    
    return (
        <div className="flex h-[calc(100vh-69px)] text-slate-300">
            <style>{animationStyles}</style>
            
            <aside className={`${mobileView !== 'folders' && 'hidden'} md:flex w-full md:w-1/4 md:max-w-xs bg-slate-900 border-r border-slate-800 flex-col animate-fade-in`}>
                <div className="p-4 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <FolderIcon className="w-6 h-6 text-sky-400 opacity-0 animate-title-fade-in-up-1" />
                        <h2 className="text-lg font-semibold flex items-center gap-1">
                            <span className="opacity-0 animate-title-fade-in-up-2 text-slate-200">My</span>
                            <span className="opacity-0 animate-title-fade-in-up-3 text-sky-400">Folders</span>
                        </h2>
                    </div>
                    <button onClick={handleAddFolder} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {folders.map(folder => (
                        <div key={folder.id} 
                            draggable
                            onDragStart={e => handleFolderDragStart(e, folder.id)}
                            onDragEnter={e => handleFolderDragEnter(e, folder.id)}
                            onDragLeave={handleFolderDragLeave}
                            onDragOver={handleFolderDragOver}
                            onDrop={e => handleFolderDrop(e, folder.id)}
                            onDragEnd={handleFolderDragEnd}
                            onClick={() => { if (editingFolderId !== folder.id) { setSelectedFolderId(folder.id); setMobileView('notes'); } }}
                            onDoubleClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}
                            className={`p-3 m-2 flex items-center justify-between rounded-md group transition-all duration-200 cursor-grab
                                ${selectedFolderId === folder.id ? 'bg-sky-900/50' : 'hover:bg-slate-800'}
                                ${draggedFolderId === folder.id ? 'opacity-40' : ''}
                                ${dropTargetFolderId === folder.id ? 'border-t-2 border-yellow-400' : ''}
                            `}>
                            <div className="flex items-center gap-2 truncate w-full">
                                <AnimatedFolderIcon />
                                { editingFolderId === folder.id ? (
                                    <input type="text" value={editingFolderName} onChange={(e) => setEditingFolderName(e.target.value)} onBlur={() => handleRenameFolder(folder.id)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameFolder(folder.id); if (e.key === 'Escape') setEditingFolderId(null); }} autoFocus onFocus={(e) => e.target.select()} className="bg-slate-700 text-white rounded px-1 w-full outline-none" />
                                ) : ( <span className="truncate">{folder.name}</span> )}
                            </div>
                            {folders.length > 1 && editingFolderId !== folder.id && <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="p-1 text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><TrashIcon className="w-4 h-4" /></button> }
                        </div>
                    ))}
                </div>
            </aside>

            <section className={`${mobileView !== 'notes' && 'hidden'} md:flex w-full md:w-1/4 md:max-w-xs bg-slate-900/50 border-r border-slate-800 flex-col animate-fade-in`}>
                 <div className="p-4 flex justify-between items-center border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <button onClick={() => setMobileView('folders')} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors md:hidden"> <ArrowLeftIcon className="w-5 h-5"/> </button>
                        <div key={selectedFolder?.id || 'no-folder'} className="flex items-center gap-2 overflow-hidden">
                            <FolderIcon className="w-6 h-6 text-sky-400 opacity-0 animate-title-fade-in-up-1 flex-shrink-0" />
                            <h2 className="text-lg font-semibold text-sky-400 truncate opacity-0 animate-title-fade-in-up-2"> {selectedFolder?.name || 'Notes'} </h2>
                        </div>
                    </div>
                    {selectedFolder && <button onClick={handleAddNote} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors flex-shrink-0"><PlusIcon className="w-5 h-5"/></button>}
                </div>
                {selectedFolder && (
                    <div className="p-2 border-b border-slate-800 flex-shrink-0">
                        <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400 mb-2" />
                        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400">
                            <option value="all">All time</option>
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                        </select>
                        {isFiltered && <p className="text-xs text-slate-500 text-center mt-2">Clear search and filters to reorder notes.</p>}
                    </div>
                )}
                <div className="flex-grow overflow-y-auto">
                    {filteredNotes.map(note => (
                         <div key={note.id} 
                            draggable={!isFiltered}
                            onDragStart={e => handleNoteDragStart(e, note.id)}
                            onDragEnter={e => handleNoteDragEnter(e, note.id)}
                            onDragLeave={handleNoteDragLeave}
                            onDragOver={handleNoteDragOver}
                            onDrop={e => handleNoteDrop(e, note.id)}
                            onDragEnd={handleNoteDragEnd}
                            onClick={() => { setSelectedNoteId(note.id); setMobileView('editor'); }}
                            className={`p-3 m-2 block rounded-md group transition-all duration-200
                                ${!isFiltered ? 'cursor-grab' : 'cursor-pointer'}
                                ${selectedNoteId === note.id ? 'bg-sky-900' : 'hover:bg-slate-800'}
                                ${draggedNoteId === note.id ? 'opacity-40' : ''}
                                ${dropTargetNoteId === note.id ? 'border-t-2 border-yellow-400' : ''}
                            `}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {getNoteIcon(note)}
                                    <h3 className="font-semibold truncate text-slate-200">{note.title || 'Untitled Note'}</h3>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-1 text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 truncate ml-8">{note.content || 'No content'}</p>
                         </div>
                    ))}
                    {selectedFolder && filteredNotes.length === 0 && (
                        <div className="p-4 text-center text-slate-500">
                           {isFiltered ? 'No matching notes.' : 'No notes in this folder.'}
                        </div>
                    )}
                     {!selectedFolder && ( <div className="p-4 text-center text-slate-500"> Select or create a folder. </div> )}
                </div>
            </section>

            <main className={`${mobileView !== 'editor' && 'hidden'} md:flex flex-grow flex-col bg-black animate-fade-in`}>
                {selectedNoteId && editorState ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setMobileView('notes')} className="p-1 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-800 transition-colors md:hidden"> <ArrowLeftIcon className="w-5 h-5"/> </button>
                            <input type="text" value={editorState.title} onChange={(e) => handleEditorChange('title', e.target.value)} placeholder="Note Title" className="w-full bg-transparent text-xl md:text-2xl font-bold text-slate-100 focus:outline-none" />
                            <div className="text-sm text-slate-500 w-24 text-right flex-shrink-0 transition-opacity duration-300">
                                {saveStatus === 'unsaved' && 'Unsaved'}
                                {saveStatus === 'saving' && 'Saving...'}
                                {saveStatus === 'saved' && 'Saved!'}
                            </div>
                        </div>
                        <textarea value={editorState.content} onChange={(e) => handleEditorChange('content', e.target.value)} placeholder="Start writing..." className="flex-grow w-full p-4 bg-transparent text-slate-300 focus:outline-none resize-none" ></textarea>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <FocusOrbIcon className="w-24 h-24 mx-auto text-slate-700"/>
                            <p className="mt-4 text-lg">{selectedFolder ? 'Select a note to view or create a new one.' : 'Select a folder to begin.'}</p>
                            <p className="text-sm text-slate-600">Your space for brilliant ideas.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};