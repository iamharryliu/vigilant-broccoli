export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  updated?: string;
  status: 'needsAction' | 'completed';
  position?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

export interface TaskPatch {
  title?: string;
  notes?: string;
  due?: string;
  status?: 'needsAction' | 'completed';
}
