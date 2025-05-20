import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface DailyReportContextType {
  intern: number | null;
  isIntern: boolean;
  name: string;
  waitingForTask: boolean;
  yesterdayDate: string;
  todayDate: string;
  setIntern: (intern: number | null) => void;
  setIsIntern: (isIntern: boolean) => void;
  setName: (name: string) => void;
  setWaitingForTask: (waiting: boolean) => void;
  setYesterdayDate: (date: string) => void;
  setTodayDate: (date: string) => void;
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
  const [intern, setIntern] = useState<number | null>(null);
  const [isIntern, setIsIntern] = useState(false);
  const [name, setName] = useState('');
  const [waitingForTask, setWaitingForTask] = useState(false);
  const [yesterdayDate, setYesterdayDate] = useState<string>('');
  const [todayDate, setTodayDate] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const yesterday = getYesterdayDate(today);

    setTodayDate(formatDate(today));
    setYesterdayDate(formatDate(yesterday));
  }, []);

  const value = useMemo(
    () => ({
      intern,
      isIntern,
      name,
      waitingForTask,
      yesterdayDate,
      todayDate,
      setIntern,
      setIsIntern,
      setName,
      setWaitingForTask,
      setYesterdayDate,
      setTodayDate,
    }),
    [intern, isIntern, name, waitingForTask, yesterdayDate, todayDate]
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
