import React, { useState, useMemo, useEffect } from 'react';
import type { Todo, Priority, Reminder, Subtask } from '../types';
import { PlusIcon, TrashIcon, BellIcon, ChevronDownIcon, PlusCircleIcon, CheckBadgeIcon } from './Icons';
import { FocusOrbIcon } from './AnimatedIcons';
import { Notification } from './Notification';

type NotificationMessage = {
    id: string;
    message: string;
}

const animationStyles = `
@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-right {
  animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
@keyframes title-fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-title-fade-in-up-1 { animation: title-fade-in-up 0.4s ease-out 0.1s forwards; }
.animate-title-fade-in-up-2 { animation: title-fade-in-up 0.4s ease-out 0.2s forwards; }
.animate-title-fade-in-up-3 { animation: title-fade-in-up 0.4s ease-out 0.3s forwards; }
`;

const reminderOptions: { value: Reminder, label: string }[] = [
    { value: 'none', label: 'No reminder' },
    { value: 'at_due_date', label: 'At time of due date' },
    { value: '1h_before', label: '1 hour before' },
    { value: '24h_before', label: '24 hours before' },
];

interface TodoListProps {
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, setTodos }) => {
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState<Priority>('Medium');
    const [newTodoDueDate, setNewTodoDueDate] = useState('');
    const [newTodoReminder, setNewTodoReminder] = useState<Reminder>('none');
    const [sortBy, setSortBy] = useState<'default' | 'priority'>('default');
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
    const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() === '') return;
        
        const dueDateTimestamp = newTodoDueDate ? new Date(newTodoDueDate).getTime() : undefined;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: newTodoText.trim(),
            completed: false,
            priority: newTodoPriority,
            dueDate: dueDateTimestamp,
            reminder: newTodoDueDate ? newTodoReminder : 'none',
            reminderTriggered: false,
            subtasks: []
        };
        setTodos([...todos, newTodo]);
        setNewTodoText('');
        setNewTodoPriority('Medium');
        setNewTodoDueDate('');
        setNewTodoReminder('none');
    };

     const addNotification = (message: string) => {
        const id = crypto.randomUUID();
        setNotifications(prev => [...prev, { id, message }]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        const checkReminders = () => {
            const now = Date.now();
            let changed = false;
            const updatedTodos = todos.map(todo => {
                if (todo.completed || !todo.dueDate || todo.reminder === 'none' || todo.reminderTriggered) {
                    return todo;
                }

                let reminderTime: number | null = null;
                switch (todo.reminder) {
                    case 'at_due_date':
                        reminderTime = todo.dueDate;
                        break;
                    case '1h_before':
                        reminderTime = todo.dueDate - 3600 * 1000;
                        break;
                    case '24h_before':
                        reminderTime = todo.dueDate - 24 * 3600 * 1000;
                        break;
                }
                
                if (reminderTime && now >= reminderTime) {
                    addNotification(`Reminder: Your task "${todo.text}" is due soon!`);
                    changed = true;
                    return { ...todo, reminderTriggered: true };
                }
                return todo;
            });

            if (changed) {
                setTodos(updatedTodos);
            }
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [todos, setTodos]);

    const toggleTodo = (id: string) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const updateTodoPriority = (id: string, priority: Priority) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, priority } : todo
        ));
    };

    const handleAddSubtask = (parentId: string) => {
        if (newSubtaskText.trim() === '') return;
        const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            text: newSubtaskText.trim(),
            completed: false,
        };
        setTodos(todos.map(todo => {
            if (todo.id === parentId) {
                return { ...todo, subtasks: [...(todo.subtasks || []), newSubtask] };
            }
            return todo;
        }));
        setNewSubtaskText('');
        setAddingSubtaskTo(null);
        setExpandedTasks(prev => ({...prev, [parentId]: true}));
    };

    const toggleSubtask = (parentId: string, subtaskId: string) => {
        setTodos(todos.map(todo => {
            if (todo.id === parentId) {
                return {
                    ...todo,
                    subtasks: (todo.subtasks || []).map(subtask =>
                        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                    )
                };
            }
            return todo;
        }));
    };

    const deleteSubtask = (parentId: string, subtaskId: string) => {
         setTodos(todos.map(todo => {
            if (todo.id === parentId) {
                return {
                    ...todo,
                    subtasks: (todo.subtasks || []).filter(subtask => subtask.id !== subtaskId)
                };
            }
            return todo;
        }));
    };

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => ({...prev, [taskId]: !prev[taskId]}));
    }

    const priorityOrder: { [key in Priority]: number } = {
        'High': 1,
        'Medium': 2,
        'Low': 3
    };

    const sortedTodos = useMemo(() => {
        const todosCopy = [...todos];
        if (sortBy === 'priority') {
            todosCopy.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
            });
        }
        return todosCopy;
    }, [todos, sortBy]);
    
    const priorityColorMap: { [key in Priority]: string } = {
        High: 'border-red-500',
        Medium: 'border-yellow-500',
        Low: 'border-sky-500',
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        if (sortBy !== 'default') return;
        setDraggedTodoId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedTodoId) {
            setDropTargetId(id);
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDragLeave = () => {
        setDropTargetId(null);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
        e.preventDefault();
        if (!draggedTodoId || draggedTodoId === dropId) return;

        const draggedIndex = todos.findIndex(t => t.id === draggedTodoId);
        const dropIndex = todos.findIndex(t => t.id === dropId);

        if (draggedIndex === -1 || dropIndex === -1) return;

        const newTodos = [...todos];
        const [draggedItem] = newTodos.splice(draggedIndex, 1);
        newTodos.splice(dropIndex, 0, draggedItem);
        
        setTodos(newTodos);
        setDraggedTodoId(null);
        setDropTargetId(null);
    };

    const handleDragEnd = () => {
        setDraggedTodoId(null);
        setDropTargetId(null);
    };


    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 text-slate-200">
            <style>{animationStyles}</style>

            <div className="flex items-center justify-center gap-2 mb-6">
                <CheckBadgeIcon className="w-8 h-8 text-sky-400 opacity-0 animate-title-fade-in-up-1" />
                <h2 className="text-3xl font-bold flex items-center gap-1.5">
                    <span className="opacity-0 animate-title-fade-in-up-2 text-slate-200">To-Do</span>
                    <span className="opacity-0 animate-title-fade-in-up-3 text-sky-400">List</span>
                </h2>
            </div>

            <form onSubmit={handleAddTodo} className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <input
                        type="datetime-local"
                        value={newTodoDueDate}
                        onChange={(e) => setNewTodoDueDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                     <select
                        value={newTodoReminder}
                        onChange={(e) => setNewTodoReminder(e.target.value as Reminder)}
                        disabled={!newTodoDueDate}
                        className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value as Priority)}
                        className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="mt-4 w-full bg-yellow-400 text-black font-bold px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Task
                </button>
            </form>

            <div className="flex justify-end items-center mb-4">
                {sortBy !== 'default' && (
                    <p className="text-xs text-slate-500 mr-auto">
                        Switch to "Default" sort to reorder tasks.
                    </p>
                )}
                <label htmlFor="sort-by" className="text-sm text-slate-400 mr-2 self-center">Sort by:</label>
                <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'default' | 'priority')}
                    className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                >
                    <option value="default">Default</option>
                    <option value="priority">Priority</option>
                </select>
            </div>

            <div className="space-y-1">
                {sortedTodos.length > 0 ? (
                    sortedTodos.map(todo => {
                        const hasSubtasks = (todo.subtasks?.length || 0) > 0;
                        const isExpanded = !!expandedTasks[todo.id];
                        const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;

                        return (
                        <div 
                            key={todo.id} 
                            draggable={sortBy === 'default'}
                            onDragStart={(e) => handleDragStart(e, todo.id)}
                            onDragEnter={(e) => handleDragEnter(e, todo.id)}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, todo.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-slate-900 rounded-lg border border-slate-800 transition-all duration-300 ease-in-out
                                ${todo.completed ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'}
                                ${sortBy === 'default' ? 'cursor-grab' : ''}
                                ${draggedTodoId === todo.id ? 'opacity-40' : ''}
                                ${dropTargetId === todo.id ? 'border-t-2 border-yellow-400' : ''}
                            `}
                        >
                            <div className={`flex items-start pr-4 pl-3 py-3 group border-l-4 ${priorityColorMap[todo.priority || 'Medium']}`}>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo.id)}
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 cursor-pointer ml-2 mt-1 flex-shrink-0"
                                />
                                <div className="ml-4 flex-grow">
                                    <div className="flex items-center">
                                        {hasSubtasks && (
                                            <button onClick={() => toggleExpand(todo.id)} className="mr-2 text-slate-500 hover:text-slate-300">
                                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                        <span className={`${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                            {todo.text}
                                        </span>
                                    </div>
                                    {hasSubtasks && <span className="text-xs text-slate-500 ml-1">{completedSubtasks} / {todo.subtasks?.length} completed</span>}

                                    {todo.dueDate && (
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                            <span>Due: {new Date(todo.dueDate).toLocaleString()}</span>
                                            {todo.reminder !== 'none' && <BellIcon className="w-3.5 h-3.5 text-sky-500" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center flex-shrink-0 self-center">
                                    <button onClick={() => setAddingSubtaskTo(todo.id)} className="text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                        <PlusCircleIcon className="w-5 h-5" />
                                    </button>
                                    <select
                                        value={todo.priority || 'Medium'}
                                        onChange={(e) => updateTodoPriority(todo.id, e.target.value as Priority)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs bg-slate-800 border border-slate-700 rounded-md px-2 py-1 mx-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            {isExpanded && hasSubtasks && (
                                <div className="pl-12 pr-4 pb-3 space-y-2">
                                    {todo.subtasks?.map(subtask => (
                                        <div key={subtask.id} className="flex items-center group">
                                            <input type="checkbox" checked={subtask.completed} onChange={() => toggleSubtask(todo.id, subtask.id)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 cursor-pointer flex-shrink-0" />
                                            <span className={`ml-3 flex-grow ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{subtask.text}</span>
                                            <button onClick={() => deleteSubtask(todo.id, subtask.id)} className="text-slate-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                             {addingSubtaskTo === todo.id && (
                                <div className="pl-12 pr-4 pb-3">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAddSubtask(todo.id); }} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSubtaskText}
                                            onChange={(e) => setNewSubtaskText(e.target.value)}
                                            placeholder="New subtask..."
                                            autoFocus
                                            className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                        />
                                        <button type="submit" className="bg-sky-500 text-white px-3 py-1 text-sm rounded-md hover:bg-sky-600">Add</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )})
                ) : (
                    <div className="text-center text-slate-500 py-16">
                      <FocusOrbIcon className="w-24 h-24 mx-auto text-slate-700 mb-4" />
                      <p className="text-lg">All clear!</p>
                      <p className="text-sm text-slate-600">Add a new task to get started.</p>
                    </div>
                )}
            </div>
            <div aria-live="assertive" className="fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end">
                {notifications.map(({ id, message }) => (
                    <Notification key={id} message={message} onClose={() => removeNotification(id)} />
                ))}
            </div>
        </div>
    );
};