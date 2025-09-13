
import React, { useState } from 'react';
import type { Todo } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlusIcon, TrashIcon } from './Icons';

export const TodoList: React.FC = () => {
    const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
    const [newTodoText, setNewTodoText] = useState('');

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() === '') return;
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: newTodoText.trim(),
            completed: false,
        };
        setTodos([...todos, newTodo]);
        setNewTodoText('');
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 text-slate-200">
            <h2 className="text-3xl font-bold text-sky-400 mb-6 text-center">To-Do List</h2>

            <form onSubmit={handleAddTodo} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add
                </button>
            </form>

            <div className="space-y-3">
                {todos.length > 0 ? (
                    todos.map(todo => (
                        <div
                            key={todo.id}
                            className="flex items-center bg-slate-900 p-4 rounded-lg border border-slate-800 group"
                        >
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 cursor-pointer"
                            />
                            <span
                                className={`ml-4 flex-grow ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}
                            >
                                {todo.text}
                            </span>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500">No tasks yet. Add one to get started!</p>
                )}
            </div>
        </div>
    );
};
