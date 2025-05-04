import { Task } from './TaskForm/TaskForm.types';

export enum AbsenceType {
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
  SCHEDULED = 'SCHEDULED'
}

export interface Absence {
  type: AbsenceType;
  reason: string;
}

export interface DailyReportData {
  date: string;
  intern_name: string;
  is_intern: boolean;
  yesterdayLabel: string;
  todayLabel: string;
  yesterdayTasks: Task[];
  todayTasks: Task[];
  waitingForTask: boolean;
  yesterdayAbsence?: Absence;
  todayAbsence?: Absence;
}

export interface DailyReportFormProps {
  onSubmit: (data: DailyReportData) => void;
} 