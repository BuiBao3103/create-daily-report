import axios from './baseAxios';
import { DailyReportData } from '../components/DailyReport/DailyReportForm.types';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAQgb6_8o_c8RVX7PIakQQcix-q5i7d3_W1Gd0phlI3ksEievD-xc6M2PleW4CO807/exec';

interface SyncStatus {
  isSynced: boolean;
  lastSyncDate?: string;
}

export const checkDailyReportStatus = async (memberId: string, workDate: string): Promise<boolean> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      redirect: "follow",
      method: "POST",
      body: JSON.stringify({
        action: "check",
        memberId,
        workDate
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check daily report status');
    }

    const data = await response.json();
    console.log(data)
    return data.hasReported;
  } catch (error) {
    console.error('Error checking daily report status:', error);
    return false;
  }
};

export const insertToGoogleSheet = async (data: DailyReportData): Promise<boolean> => {
  try {
    // Format data for Google Sheets
    const rows = [
      // Yesterday tasks
      ...data.yesterdayTasks.map(task => ({
        workDate: data.date,
        memberId: data.intern_name,
        taskId: task.task_id || '',
        project: task.project || '',
        taskDescription: task.content,
        difficulty: '',
        estMentor: '',
        estRemaining: '',
        estTime: task.est_time,
        actTime: task.act_time || 0,
        taskStatus: task.status,
        extraHours: ''
      })),
      // Today tasks
      ...data.todayTasks.map(task => ({
        workDate: data.date,
        memberId: data.intern_name,
        taskId: task.task_id || '',
        project: task.project || '',
        taskDescription: task.content,
        difficulty: '',
        estMentor: '',
        estRemaining: '',
        estTime: task.est_time,
        actTime: task.act_time,
        taskStatus: task.status,
        extraHours: task.act_time ? task.act_time - task.est_time! : '0'
      }))
    ];

    const body = {
      action: "insert",
      rows,
      memberId: data.intern_name,
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      redirect: "follow",
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });

    if (!response.ok) {
      throw new Error('Failed to insert data to Google Sheet');
    }

    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return false;
  }
};