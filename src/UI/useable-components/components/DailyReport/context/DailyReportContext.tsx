import { createContext, useContext, ReactNode } from 'react';
import { useForm } from '@mantine/form';
import { DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { Absence, AbsenceType } from '@/Utils/enums/DailyEnum/DailyReportForm.types';

interface FormValues {
  internName: string;
  date: Date;
  isIntern: boolean;
  yesterdayTasks: Task[];
  todayTasks: Task[];
  waitingForTask: boolean;
  yesterdayDate: Date;
  todayDate: Date;
  yesterdayAbsence?: Absence;
  todayAbsence?: Absence;
}

interface DailyReportContextType {
  form: ReturnType<typeof useForm<FormValues>>;
  updateOutput: () => void;
}

const DailyReportContext = createContext<DailyReportContextType | null>(null);

interface DailyReportProviderProps {
  children: ReactNode;
  onSubmit: (data: DailyReportData) => void;
}

export function DailyReportProvider({ children, onSubmit }: DailyReportProviderProps) {
  const form = useForm<FormValues>({
    initialValues: {
      internName: '',
      date: new Date(),
      isIntern: false,
      yesterdayTasks: [],
      todayTasks: [],
      waitingForTask: false,
      yesterdayDate: (() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (today.getDay() === 1) {
          yesterday.setDate(today.getDate() - 3);
        }
        return yesterday;
      })(),
      todayDate: new Date(),
    },
    validate: {
      internName: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập họ và tên'),
      date: (value) => (value ? null : 'Vui lòng chọn ngày báo cáo'),
    },
  });

  const updateOutput = () => {
    const data: DailyReportData = {
      date: form.values.date,
      intern_name: form.values.internName,
      is_intern: form.values.isIntern,
      yesterdayDate: form.values.yesterdayDate,
      todayDate: form.values.todayDate,
      yesterdayTasks: form.values.yesterdayTasks,
      todayTasks: form.values.todayTasks,
      waitingForTask: form.values.waitingForTask,
      yesterdayAbsence: form.values.yesterdayAbsence,
      todayAbsence: form.values.todayAbsence,
    };
    onSubmit(data);
  };

  return (
    <DailyReportContext.Provider value={{ form, updateOutput }}>
      {children}
    </DailyReportContext.Provider>
  );
}

export function useDailyReport() {
  const context = useContext(DailyReportContext);
  if (!context) {
    throw new Error('useDailyReport must be used within a DailyReportProvider');
  }
  return context;
} 