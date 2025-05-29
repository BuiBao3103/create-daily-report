import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { Absence, DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';

interface StoredData {
  tasks: Array<{
    internId: number;
    date: string;
    tasks: Task[];
  }>;
  absences: Array<{
    internId: number;
    date: string;
    absence: Absence;
  }>;
}

interface FormValues {
  internName: string;
  internId?: number;
  date: Date;
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

const STORAGE_KEY = 'daily_report_data';
const MAX_DAYS = 10;

export function DailyReportProvider({ children, onSubmit }: DailyReportProviderProps) {
  const form = useForm<FormValues>({
    initialValues: {
      internName: '',
      internId: undefined,
      date: new Date(),
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
      internName: (value) => (value.trim().length > 0 ? null : 'Vui lòng chọn thực tập sinh'),
      date: (value) => (value ? null : 'Vui lòng chọn ngày báo cáo'),
    },
  });

  // Load data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const data: StoredData = JSON.parse(storedData);
        // Clean up old data (older than MAX_DAYS)
        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - MAX_DAYS);

        data.tasks = data.tasks.filter((item) => new Date(item.date) >= cutoffDate);
        data.absences = data.absences.filter((item) => new Date(item.date) >= cutoffDate);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);

  // Load tasks and absences when intern or date changes
  useEffect(() => {
    if (!form.values.internId) return;

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const data: StoredData = JSON.parse(storedData);

        // Load yesterday's data
        const yesterdayTasks =
          data.tasks.find(
            (item) =>
              item.internId === form.values.internId &&
              new Date(item.date).toDateString() === form.values.yesterdayDate.toDateString()
          )?.tasks || [];

        const yesterdayAbsence = data.absences.find(
          (item) =>
            item.internId === form.values.internId &&
            new Date(item.date).toDateString() === form.values.yesterdayDate.toDateString()
        )?.absence;

        // Load today's data
        const todayTasks =
          data.tasks.find(
            (item) =>
              item.internId === form.values.internId &&
              new Date(item.date).toDateString() === form.values.todayDate.toDateString()
          )?.tasks || [];

        const todayAbsence = data.absences.find(
          (item) =>
            item.internId === form.values.internId &&
            new Date(item.date).toDateString() === form.values.todayDate.toDateString()
        )?.absence;

        form.setValues({
          ...form.values,
          yesterdayTasks,
          todayTasks,
          yesterdayAbsence,
          todayAbsence,
        });
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    }
  }, [form.values.internId, form.values.yesterdayDate, form.values.todayDate]);

  const updateOutput = () => {
    const data: DailyReportData = {
      date: form.values.date,
      intern_name: form.values.internName,
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

  // Save data to localStorage
  const saveToStorage = () => {
    if (!form.values.internId) return;

    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    // Update yesterday's data
    const yesterdayTaskIndex = data.tasks.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === form.values.yesterdayDate.toDateString()
    );
    if (yesterdayTaskIndex >= 0) {
      data.tasks[yesterdayTaskIndex].tasks = form.values.yesterdayTasks;
    } else {
      data.tasks.push({
        internId: form.values.internId,
        date: form.values.yesterdayDate.toISOString(),
        tasks: form.values.yesterdayTasks,
      });
    }

    const yesterdayAbsenceIndex = data.absences.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === form.values.yesterdayDate.toDateString()
    );
    if (yesterdayAbsenceIndex >= 0) {
      if (form.values.yesterdayAbsence) {
        data.absences[yesterdayAbsenceIndex].absence = form.values.yesterdayAbsence;
      } else {
        data.absences.splice(yesterdayAbsenceIndex, 1);
      }
    } else if (form.values.yesterdayAbsence) {
      data.absences.push({
        internId: form.values.internId,
        date: form.values.yesterdayDate.toISOString(),
        absence: form.values.yesterdayAbsence,
      });
    }

    // Update today's data
    const todayTaskIndex = data.tasks.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === form.values.todayDate.toDateString()
    );
    if (todayTaskIndex >= 0) {
      data.tasks[todayTaskIndex].tasks = form.values.todayTasks;
    } else {
      data.tasks.push({
        internId: form.values.internId,
        date: form.values.todayDate.toISOString(),
        tasks: form.values.todayTasks,
      });
    }

    const todayAbsenceIndex = data.absences.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === form.values.todayDate.toDateString()
    );
    if (todayAbsenceIndex >= 0) {
      if (form.values.todayAbsence) {
        data.absences[todayAbsenceIndex].absence = form.values.todayAbsence;
      } else {
        data.absences.splice(todayAbsenceIndex, 1);
      }
    } else if (form.values.todayAbsence) {
      data.absences.push({
        internId: form.values.internId,
        date: form.values.todayDate.toISOString(),
        absence: form.values.todayAbsence,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // Task management functions
  const addTask = (task: Task, isToday: boolean) => {
    if (!form.values.internId) return;

    const newTask = {
      ...task,
      workDate: isToday ? form.values.todayDate : form.values.yesterdayDate,
    };

    if (isToday) {
      form.setFieldValue('todayTasks', [...form.values.todayTasks, newTask]);
    } else {
      form.setFieldValue('yesterdayTasks', [...form.values.yesterdayTasks, newTask]);
    }

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const taskIndex = data.tasks.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (taskIndex >= 0) {
      data.tasks[taskIndex].tasks.push(newTask);
    } else {
      data.tasks.push({
        internId: form.values.internId,
        date: date.toISOString(),
        tasks: [newTask],
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateOutput();
  };

  const editTask = (taskIndex: number, isToday: boolean, updatedTask: Task) => {
    if (!form.values.internId) return;

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

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const taskListIndex = data.tasks.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (taskListIndex >= 0) {
      data.tasks[taskListIndex].tasks[taskIndex] = {
        ...updatedTask,
        workDate: date,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    updateOutput();
  };

  const deleteTask = (taskIndex: number, isToday: boolean) => {
    if (!form.values.internId) return;

    if (isToday) {
      const newTasks = form.values.todayTasks.filter((_, index) => index !== taskIndex);
      form.setFieldValue('todayTasks', newTasks);
    } else {
      const newTasks = form.values.yesterdayTasks.filter((_, index) => index !== taskIndex);
      form.setFieldValue('yesterdayTasks', newTasks);
    }

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const taskListIndex = data.tasks.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (taskListIndex >= 0) {
      data.tasks[taskListIndex].tasks = data.tasks[taskListIndex].tasks.filter(
        (_, index) => index !== taskIndex
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    updateOutput();
  };

  // Absence management functions
  const addAbsence = (absence: Absence, isToday: boolean) => {
    if (!form.values.internId) return;

    if (isToday) {
      form.setFieldValue('todayAbsence', absence);
    } else {
      form.setFieldValue('yesterdayAbsence', absence);
    }

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const absenceIndex = data.absences.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (absenceIndex >= 0) {
      data.absences[absenceIndex].absence = absence;
    } else {
      data.absences.push({
        internId: form.values.internId,
        date: date.toISOString(),
        absence,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateOutput();
  };

  const editAbsence = (absence: Absence, isToday: boolean) => {
    if (!form.values.internId) return;

    if (isToday) {
      form.setFieldValue('todayAbsence', absence);
    } else {
      form.setFieldValue('yesterdayAbsence', absence);
    }

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const absenceIndex = data.absences.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (absenceIndex >= 0) {
      data.absences[absenceIndex].absence = absence;
    } else {
      data.absences.push({
        internId: form.values.internId,
        date: date.toISOString(),
        absence,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateOutput();
  };

  const deleteAbsence = (isToday: boolean) => {
    if (!form.values.internId) return;

    if (isToday) {
      form.setFieldValue('todayAbsence', undefined);
    } else {
      form.setFieldValue('yesterdayAbsence', undefined);
    }

    // Save to localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data: StoredData = storedData ? JSON.parse(storedData) : { tasks: [], absences: [] };

    const date = isToday ? form.values.todayDate : form.values.yesterdayDate;
    const absenceIndex = data.absences.findIndex(
      (item) =>
        item.internId === form.values.internId &&
        new Date(item.date).toDateString() === date.toDateString()
    );

    if (absenceIndex >= 0) {
      data.absences.splice(absenceIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  return <DailyReportContext.Provider value={contextValue}>{children}</DailyReportContext.Provider>;
}

export function useDailyReport() {
  const context = useContext(DailyReportContext);
  if (!context) {
    throw new Error('useDailyReport must be used within a DailyReportProvider');
  }
  return context;
}
