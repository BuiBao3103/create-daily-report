export interface Task {
  task_id?: string;
  content: string;
  project?: string;
  est_time?: number;
  act_time?: number;
  status: string;
  workDate?: string;
}

export interface TaskFormProps {
  task: Task;
  index: number;
  onChange: (index: number, field: keyof Task, value: any) => void;
  onDelete: (index: number) => void;
  label: string;
} 