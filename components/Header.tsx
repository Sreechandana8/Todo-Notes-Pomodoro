import React from 'react';
import type { View } from '../types';
import { Logo } from './Logo';

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
            className={`px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
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
            <div className="container mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
                <Logo />
                <nav className="flex w-full justify-around sm:w-auto sm:space-x-2 bg-slate-900 p-1 rounded-lg">
                    <NavButton onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'}>
                        Dashboard
                    </NavButton>
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