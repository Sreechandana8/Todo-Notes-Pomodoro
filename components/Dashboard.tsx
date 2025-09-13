import React, { useMemo } from 'react';
import type { Folder, Todo, View } from '../types';
import { CalendarDaysIcon, DocumentTextIcon, PlayIcon } from './Icons';

const animationStyles = `
@keyframes card-fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-card-fade-in-up-1 { animation: card-fade-in-up 0.5s ease-out 0.1s forwards; }
.animate-card-fade-in-up-2 { animation: card-fade-in-up 0.5s ease-out 0.2s forwards; }
.animate-card-fade-in-up-3 { animation: card-fade-in-up 0.5s ease-out 0.3s forwards; }
`;

interface DashboardProps {
    folders: Folder[];
    todos: Todo[];
    setActiveView: (view: View) => void;
    setSelectedFolderId: (id: string | null) => void;
    setSelectedNoteId: (id: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ folders, todos, setActiveView, setSelectedFolderId, setSelectedNoteId }) => {
    
    const tasksDueToday = useMemo(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        
        return todos.filter(todo => 
            todo.dueDate && 
            !todo.completed &&
            todo.dueDate >= startOfToday.getTime() && 
            todo.dueDate <= endOfToday.getTime()
        );
    }, [todos]);

    const recentNotes = useMemo(() => {
        return folders
            .flatMap(folder => folder.notes.map(note => ({ ...note, folderName: folder.name, folderId: folder.id })))
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3);
    }, [folders]);

    const handleNoteClick = (folderId: string, noteId: string) => {
        setSelectedFolderId(folderId);
        setSelectedNoteId(noteId);
        setActiveView('notes');
    };

    const handleTaskClick = () => {
        setActiveView('todo');
    };

    const handlePomodoroClick = () => {
        setActiveView('pomodoro');
    };

    return (
        <div className="p-4 md:p-8 text-slate-200 max-w-7xl mx-auto">
            <style>{animationStyles}</style>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-slate-300">Welcome to your </span>
                <span className="text-sky-400">Dashboard</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks Due Today */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6 opacity-0 animate-card-fade-in-up-1">
                    <div className="flex items-center gap-3 mb-4">
                        <CalendarDaysIcon className="w-6 h-6 text-sky-400"/>
                        <h2 className="text-xl font-semibold">Tasks Due Today</h2>
                    </div>
                    {tasksDueToday.length > 0 ? (
                        <ul className="space-y-3">
                           {tasksDueToday.map(task => (
                               <li key={task.id} onClick={handleTaskClick} className="bg-slate-800/50 p-3 rounded-md cursor-pointer hover:bg-slate-800 transition-colors">
                                   <p className="font-medium truncate">{task.text}</p>
                                   <p className="text-xs text-slate-400">Priority: {task.priority}</p>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No tasks due today. Enjoy your day!</p>
                    )}
                </div>

                {/* Recent Notes */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6 opacity-0 animate-card-fade-in-up-2">
                    <div className="flex items-center gap-3 mb-4">
                        <DocumentTextIcon className="w-6 h-6 text-sky-400"/>
                        <h2 className="text-xl font-semibold">Recent Notes</h2>
                    </div>
                     {recentNotes.length > 0 ? (
                        <ul className="space-y-3">
                           {recentNotes.map(note => (
                               <li key={note.id} onClick={() => handleNoteClick(note.folderId, note.id)} className="bg-slate-800/50 p-3 rounded-md cursor-pointer hover:bg-slate-800 transition-colors">
                                   <p className="font-medium truncate">{note.title || 'Untitled Note'}</p>
                                   <p className="text-xs text-slate-400">In folder: {note.folderName}</p>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No recent notes. Time to create!</p>
                    )}
                </div>
                
                {/* Pomodoro */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center opacity-0 animate-card-fade-in-up-3">
                    <h2 className="text-xl font-semibold mb-4">Ready to Focus?</h2>
                    <p className="text-slate-400 mb-6">Start a Pomodoro session to get into deep work mode.</p>
                    <button 
                        onClick={handlePomodoroClick} 
                        className="w-full font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                        <PlayIcon className="w-6 h-6"/>
                        <span>Start Focus Session</span>
                    </button>
                </div>
            </div>
        </div>
    );
};