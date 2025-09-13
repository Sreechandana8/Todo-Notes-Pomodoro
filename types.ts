
export type View = 'notes' | 'pomodoro' | 'todo';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
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
