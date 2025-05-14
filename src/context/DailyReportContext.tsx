import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { Absence, DailyReportData } from '@/types/DailyReportForm.types';
import { Task } from '@/types/TaskForm.types';

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
  deleteTask: (taskIndex: number, isToday: boolean) => void;
  editTask: (taskIndex: number, isToday: boolean, updatedTask: Task) => void;
  deleteAbsence: (isToday: boolean) => void;
}

const DailyReportContext = createContext<DailyReportContextType | null>(null);

interface DailyReportProviderProps {
  readonly children: ReactNode;
  readonly onSubmit: (data: DailyReportData) => void;
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

  const deleteTask = (taskIndex: number, isToday: boolean) => {
    if (isToday) {
      const newTasks = form.values.todayTasks.filter((_, index) => index !== taskIndex);
      form.setFieldValue('todayTasks', newTasks);
    } else {
      const newTasks = form.values.yesterdayTasks.filter((_, index) => index !== taskIndex);
      form.setFieldValue('yesterdayTasks', newTasks);
    }
    updateOutput();
  };

  const editTask = (taskIndex: number, isToday: boolean, updatedTask: Task) => {
    if (isToday) {
      const newTasks = [...form.values.todayTasks];
      newTasks[taskIndex] = updatedTask;
      form.setFieldValue('todayTasks', newTasks);
    } else {
      const newTasks = [...form.values.yesterdayTasks];
      newTasks[taskIndex] = updatedTask;
      form.setFieldValue('yesterdayTasks', newTasks);
    }
    updateOutput();
  };

  const deleteAbsence = (isToday: boolean) => {
    if (isToday) {
      form.setFieldValue('todayAbsence', undefined);
    } else {
      form.setFieldValue('yesterdayAbsence', undefined);
    }
    updateOutput();
  };

  // Update output when form values change
  useEffect(() => {
    updateOutput();
  }, [form.values]);

  const contextValue = useMemo(
    () => ({ form, updateOutput, deleteTask, editTask, deleteAbsence }),
    [form, updateOutput, deleteTask, editTask, deleteAbsence]
  );

  return (
    <DailyReportContext.Provider value={contextValue}>
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
