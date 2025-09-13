import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon } from './Icons';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export const Pomodoro: React.FC = () => {
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [timeRemaining, setTimeRemaining] = useState(WORK_MINUTES * 60);
    const [isActive, setIsActive] = useState(false);

    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');

    const totalDuration = useMemo(() => (mode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60), [mode]);
    const progress = (totalDuration - timeRemaining) / totalDuration * 100;

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setMode('work');
        setTimeRemaining(WORK_MINUTES * 60);
    }, []);

    useEffect(() => {
        // Fix: Use ReturnType<typeof setInterval> for the interval type to ensure compatibility with browser environments.
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (isActive && timeRemaining === 0) {
            const newMode = mode === 'work' ? 'break' : 'work';
            setMode(newMode);
            setTimeRemaining(newMode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
            setIsActive(false); 
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, timeRemaining, mode]);

    useEffect(() => {
        document.title = `${minutes}:${seconds} - ${mode === 'work' ? 'Work' : 'Break'} | Zenith Focus`;
    }, [minutes, seconds, mode]);


    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const switchMode = (newMode: 'work' | 'break') => {
        setIsActive(false);
        setMode(newMode);
        setTimeRemaining(newMode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
    }
    
    return (
        <div className="max-w-md mx-auto p-4 md:p-8 flex flex-col items-center justify-center text-white min-h-[calc(100vh-100px)]">
            <div className="w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl shadow-sky-900/20">
                <div className="flex justify-center gap-2 mb-8">
                    <button onClick={() => switchMode('work')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'work' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Work</button>
                    <button onClick={() => switchMode('break')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'break' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Break</button>
                </div>

                <div className="relative w-64 h-64 mx-auto mb-8">
                     <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-slate-800"
                            strokeWidth="7"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-yellow-400"
                            strokeWidth="7"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold tracking-tighter">{minutes}:{seconds}</span>
                        <span className="text-slate-400 uppercase text-sm tracking-widest">{mode}</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={toggleTimer} className="w-24 bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                        {isActive ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6" />}
                        <span>{isActive ? 'Pause' : 'Start'}</span>
                    </button>
                    <button onClick={resetTimer} className="bg-slate-800 text-slate-300 font-bold p-3 rounded-lg hover:bg-slate-700 transition-colors">
                        <ArrowPathIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};