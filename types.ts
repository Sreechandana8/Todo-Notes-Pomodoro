export type View = 'dashboard' | 'notes' | 'pomodoro' | 'todo';

export type Priority = 'High' | 'Medium' | 'Low';

export type Reminder = 'none' | 'at_due_date' | '1h_before' | '24h_before';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: number;
  reminder?: Reminder;
  reminderTriggered?: boolean;
  subtasks?: Subtask[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Folder {
  id:string;
  name: string;
  notes: Note[];
}