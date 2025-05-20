export interface Task {
  task_id?: string;
  content: string;
  project?: string;
  est_time?: number;
  act_time?: number;
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