export interface Task {
  id?: number;
  task_id?: string;
  content: string;
  project?: string;
  estimate_time?: number;
  actual_time?: number;
  status: string;
  date: string;
  intern?: number | null;
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}