import { Task } from "./task.types";

export interface TaskFormProps {
  task: Task;
  index: number;
  onChange: (index: number, field: keyof Task, value: any) => void;
  onDelete: (index: number) => void;
  label: string;
} 