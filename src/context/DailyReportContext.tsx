import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useTask from '@/hooks/use_tasks';
import { Task } from '@/interfaces/task.types';
import { useQueryClient } from '@tanstack/react-query';

interface DailyReportContextType {
  intern: number | null;
  isIntern: boolean;
  name: string;
  waitingForTask: boolean;
  yesterdayDate: string;
  todayDate: string;
  yesterdayTasks: Task[];
  todayTasks: Task[];
  setIntern: (intern: number | null) => void;
  setIsIntern: (isIntern: boolean) => void;
  setName: (name: string) => void;
  setWaitingForTask: (waiting: boolean) => void;
  setYesterdayDate: (date: string) => void;
  setTodayDate: (date: string) => void;
  addTask: (task: Task, isToday: boolean) => void;
  updateTask: (task: Task, isToday: boolean) => void;
  deleteTask: (id: number, isToday: boolean) => void;
}

const DailyReportContext = createContext<DailyReportContextType | undefined>(undefined);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getYesterdayDate = (today: Date): Date => {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // If today is Monday (1), set yesterday to last Friday (5)
  if (today.getDay() === 1) {
    yesterday.setDate(today.getDate() - 3);
  }

  return yesterday;
};

export function DailyReportProvider({ children }: { readonly children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [intern, setIntern] = useState<number | null>(null);
  const [isIntern, setIsIntern] = useState(false);
  const [name, setName] = useState('');
  const [waitingForTask, setWaitingForTask] = useState(false);
  const [yesterdayDate, setYesterdayDate] = useState<string>('');
  const [todayDate, setTodayDate] = useState<string>('');
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  const queryYesterday = useTask({
    params: `?intern=${intern}&date=${yesterdayDate}`,
    options: { enabled: !!intern && !!yesterdayDate },
  });

  const queryToday = useTask({
    params: `?intern=${intern}&date=${todayDate}`,
    options: { enabled: !!intern && !!todayDate },
  });

  useEffect(() => {
    if (queryYesterday.data?.results) {
      setYesterdayTasks(queryYesterday.data.results);
    }
  }, [queryYesterday.data]);

  useEffect(() => {
    if (queryToday.data?.results) {
      setTodayTasks(queryToday.data.results);
    }
  }, [queryToday.data]);

  useEffect(() => {
    const today = new Date();
    const yesterday = getYesterdayDate(today);

    setTodayDate(formatDate(today));
    setYesterdayDate(formatDate(yesterday));
  }, []);

  const addTask = (_task: Task, isToday: boolean) => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/tasks/', `?intern=${intern}&date=${isToday ? todayDate : yesterdayDate}`]
    });
  };

  const updateTask = (_task: Task, isToday: boolean) => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/tasks/', `?intern=${intern}&date=${isToday ? todayDate : yesterdayDate}`]
    });
  };

  const deleteTask = (id: number, isToday: boolean) => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/tasks/', `?intern=${intern}&date=${isToday ? todayDate : yesterdayDate}`]
    });
  };

  // Add effect to refetch tasks when intern or dates change
  useEffect(() => {
    if (intern && yesterdayDate) {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${yesterdayDate}`]
      });
    }
  }, [intern, yesterdayDate, queryClient]);

  useEffect(() => {
    if (intern && todayDate) {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${todayDate}`]
      });
    }
  }, [intern, todayDate, queryClient]);

  const handleSetIntern = (newIntern: number | null) => {
    setIntern(newIntern);
    // Reset name when intern changes
    setName('');
  };

  const value = useMemo(
    () => ({
      intern,
      isIntern,
      name,
      waitingForTask,
      yesterdayDate,
      todayDate,
      yesterdayTasks,
      todayTasks,
      setIntern: handleSetIntern,
      setIsIntern,
      setName,
      setWaitingForTask,
      setYesterdayDate,
      setTodayDate,
      addTask,
      updateTask,
      deleteTask,
    }),
    [intern, isIntern, name, waitingForTask, yesterdayDate, todayDate, yesterdayTasks, todayTasks]
  );

  return <DailyReportContext.Provider value={value}>{children}</DailyReportContext.Provider>;
}

export function useDailyReport() {
  const context = useContext(DailyReportContext);
  if (context === undefined) {
    throw new Error('useDailyReport must be used within a DailyReportProvider');
  }
  return context;
}
