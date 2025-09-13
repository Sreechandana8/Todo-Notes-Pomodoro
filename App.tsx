
import React from 'react';
import type { View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { Notes } from './components/Notes';
import { Pomodoro } from './components/Pomodoro';
import { TodoList } from './components/TodoList';

const App: React.FC = () => {
    const [activeView, setActiveView] = useLocalStorage<View>('active_view', 'notes');

    const renderActiveView = () => {
        switch (activeView) {
            case 'notes':
                return <Notes />;
            case 'pomodoro':
                return <Pomodoro />;
            case 'todo':
                return <TodoList />;
            default:
                return <Notes />;
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main>
                {renderActiveView()}
            </main>
        </div>
    );
};

export default App;
