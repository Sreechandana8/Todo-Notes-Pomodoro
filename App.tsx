import React, { useState, useEffect } from 'react';
import type { View, Folder, Note, Todo } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { Notes } from './components/Notes';
import { Pomodoro } from './components/Pomodoro';
import { TodoList } from './components/TodoList';
import { QuickAddNoteModal } from './components/QuickAddNoteModal';
import { Dashboard } from './components/Dashboard';
import { PlusIcon } from './components/Icons';

const App: React.FC = () => {
    const [activeView, setActiveView] = useLocalStorage<View>('active_view', 'dashboard');
    const [folders, setFolders] = useLocalStorage<Folder[]>('notes_folders', [{ id: 'default', name: 'My First Folder', notes: [] }]);
    const [selectedFolderId, setSelectedFolderId] = useLocalStorage<string | null>('selected_folder_id', null);
    const [selectedNoteId, setSelectedNoteId] = useLocalStorage<string | null>('selected_note_id', null);
    const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    useEffect(() => {
        // This effect ensures a folder is always selected if one exists,
        // and handles cases where the selected folder might have been deleted.
        if (folders.length > 0) {
            const folderExists = folders.some(f => f.id === selectedFolderId);
            if (!selectedFolderId || !folderExists) {
                setSelectedFolderId(folders[0].id);
            }
        } else {
            setSelectedFolderId(null);
        }
    }, [folders, selectedFolderId, setSelectedFolderId]);


    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard 
                            folders={folders}
                            todos={todos}
                            setActiveView={setActiveView}
                            setSelectedFolderId={setSelectedFolderId}
                            setSelectedNoteId={setSelectedNoteId}
                        />;
            case 'notes':
                return <Notes 
                            folders={folders} 
                            setFolders={setFolders}
                            selectedFolderId={selectedFolderId}
                            setSelectedFolderId={setSelectedFolderId} 
                            selectedNoteId={selectedNoteId}
                            setSelectedNoteId={setSelectedNoteId}
                        />;
            case 'pomodoro':
                return <Pomodoro />;
            case 'todo':
                return <TodoList todos={todos} setTodos={setTodos} />;
            default:
                return <Dashboard 
                            folders={folders}
                            todos={todos}
                            setActiveView={setActiveView}
                            setSelectedFolderId={setSelectedFolderId}
                            setSelectedNoteId={setSelectedNoteId}
                        />;
        }
    };

    const handleSaveQuickNote = (title: string, content: string, folderId: string) => {
        if (!folderId || folders.length === 0) {
            alert("Could not save note. Please create a folder first.");
            return;
        }

        const newNote: Note = {
            id: crypto.randomUUID(),
            title: title.trim() || 'Untitled Note',
            content: content,
            createdAt: Date.now(),
        };

        setFolders(prevFolders =>
            prevFolders.map(f => {
              if (f.id === folderId) {
                return { ...f, notes: [newNote, ...f.notes] };
              }
              return f;
            })
        );
        setIsQuickAddOpen(false);
    };

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main>
                {renderActiveView()}
            </main>

            <button
                onClick={() => setIsQuickAddOpen(true)}
                className="fixed bottom-6 right-6 bg-yellow-400 text-black rounded-full p-4 shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-110 z-20"
                aria-label="Quick Add Note"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            <QuickAddNoteModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                onSave={handleSaveQuickNote}
                folders={folders}
                currentFolderId={activeView === 'notes' ? selectedFolderId : null}
            />
        </div>
    );
};

export default App;