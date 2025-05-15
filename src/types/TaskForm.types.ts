export interface Task {
  task_id?: string;
  content: string;
  project?: string;
  est_time?: number;
  act_time?: number;
  status: string;
  date?: Date;
  intern?: number | null;
}

export interface TaskFormProps {
  task: Task;
  index: number;
  onChange: (index: number, field: keyof Task, value: any) => void;
  onDelete: (index: number) => void;
  label: string;
} 