import { Task } from './TaskForm.types';

export enum AbsenceType {
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
  SCHEDULED = 'SCHEDULED',
}

export interface Absence {
  type: AbsenceType;
  reason: string;
}

export interface DailyReportData {
  date: Date;
  intern_name: string;
  is_intern: boolean;
  yesterdayDate: Date;
  todayDate: Date;
  yesterdayTasks: Task[];
  todayTasks: Task[];
  waitingForTask: boolean;
  yesterdayAbsence?: Absence;
  todayAbsence?: Absence;
}

export interface DailyReportFormProps {
  onSubmit: (data: DailyReportData) => void;
}
