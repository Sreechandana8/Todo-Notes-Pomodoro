
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive
                ? 'bg-yellow-400 text-black'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
        >
            {children}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    return (
        <header className="p-4 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-sky-400">Zenith Focus</h1>
                <nav className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg">
                    <NavButton onClick={() => setActiveView('notes')} isActive={activeView === 'notes'}>
                        Notes
                    </NavButton>
                    <NavButton onClick={() => setActiveView('pomodoro')} isActive={activeView === 'pomodoro'}>
                        Pomodoro
                    </NavButton>
                    <NavButton onClick={() => setActiveView('todo')} isActive={activeView === 'todo'}>
                        To-Do List
                    </NavButton>
                </nav>
            </div>
        </header>
    );
};
