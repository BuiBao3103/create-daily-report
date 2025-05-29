import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { Absence, AbsenceType, DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';

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
  // Task management
  addTask: (task: Task, isToday: boolean) => void;
  editTask: (taskIndex: number, isToday: boolean, updatedTask: Task) => void;
  deleteTask: (taskIndex: number, isToday: boolean) => void;
  // Absence management
  addAbsence: (absence: Absence, isToday: boolean) => void;
  editAbsence: (absence: Absence, isToday: boolean) => void;
  deleteAbsence: (isToday: boolean) => void;
  // Waiting for task
  setWaitingForTask: (value: boolean) => void;
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

  // Task management functions
  const addTask = (task: Task, isToday: boolean) => {
    if (isToday) {
      form.setFieldValue('todayTasks', [...form.values.todayTasks, task]);
    } else {
      form.setFieldValue('yesterdayTasks', [...form.values.yesterdayTasks, task]);
    }
    updateOutput();
  };

  const editTask = (taskIndex: number, isToday: boolean, updatedTask: Task) => {
    if (isToday) {
      const newTasks = [...form.values.todayTasks];
      if (taskIndex >= 0 && taskIndex < newTasks.length) {
        newTasks[taskIndex] = { ...updatedTask, workDate: form.values.todayDate };
        form.setFieldValue('todayTasks', newTasks);
      }
    } else {
      const newTasks = [...form.values.yesterdayTasks];
      if (taskIndex >= 0 && taskIndex < newTasks.length) {
        newTasks[taskIndex] = { ...updatedTask, workDate: form.values.yesterdayDate };
        form.setFieldValue('yesterdayTasks', newTasks);
      }
    }
    updateOutput();
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

  // Absence management functions
  const addAbsence = (absence: Absence, isToday: boolean) => {
    if (isToday) {
      form.setFieldValue('todayAbsence', absence);
    } else {
      form.setFieldValue('yesterdayAbsence', absence);
    }
    updateOutput();
  };

  const editAbsence = (absence: Absence, isToday: boolean) => {
    if (isToday) {
      form.setFieldValue('todayAbsence', absence);
    } else {
      form.setFieldValue('yesterdayAbsence', absence);
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

  // Waiting for task
  const setWaitingForTask = (value: boolean) => {
    form.setFieldValue('waitingForTask', value);
    updateOutput();
  };

  // Update output when form values change
  useEffect(() => {
    updateOutput();
  }, [form.values]);

  const contextValue = useMemo(
    () => ({
      form,
      updateOutput,
      addTask,
      editTask,
      deleteTask,
      addAbsence,
      editAbsence,
      deleteAbsence,
      setWaitingForTask,
    }),
    [form, updateOutput]
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
