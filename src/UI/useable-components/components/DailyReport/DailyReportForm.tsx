'use-client';

import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCalendarOff, IconPlus, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Checkbox,
  Group,
  Notification,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { internService } from '@/Lib/Services/intern.service';
import {
  Absence,
  AbsenceType,
  DailyReportData,
  DailyReportFormProps,
} from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { Intern, InternsResponse } from '@/Utils/types/intern.types';
import { AbsenceModal } from './components/AbsenceModal';
import { DaySection } from './components/DaySection';
import { TaskModal } from './components/TaskModal';

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
  absenceType: AbsenceType;
  absenceReason: string;
  newTask: Task;
}

export function DailyReportForm({ onSubmit }: DailyReportFormProps) {
  const { data: internsData, isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: internService.getInterns,
  });

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
      absenceType: AbsenceType.SCHEDULED,
      absenceReason: '',
      newTask: {
        content: '',
        task_id: '',
        project: '',
        est_time: 0,
        act_time: 0,
        status: 'To Do',
      },
    },
    validate: {
      internName: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập họ và tên'),
      date: (value) => (value ? null : 'Vui lòng chọn ngày báo cáo'),
      newTask: {
        content: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập nội dung công việc'),
        est_time: (value) => (value && value > 0 ? null : 'Vui lòng nhập thời gian dự kiến'),
      },
      absenceReason: (value, values) =>
        (values.yesterdayAbsence || values.todayAbsence) && !value
          ? 'Vui lòng nhập lý do nghỉ'
          : null,
    },
  });

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState<boolean | 'yesterday' | 'today'>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const showNotification = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleTaskChange = (tasks: Task[], index: number, field: keyof Task, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      [field]: value,
      workDate: field === 'workDate' ? value : newTasks[index].workDate,
    };
    return newTasks;
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    form.setFieldValue('newTask', {
      content: '',
      task_id: '',
      project: '',
      est_time: 0,
      act_time: 0,
      status: 'To Do',
    });
    setShowAddTaskModal(true);
  };

  const handleDeleteTask = (tasks: Task[], index: number) => {
    return tasks.filter((_, i) => i !== index);
  };

  const handleAbsenceSubmit = () => {
    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      return;
    }

    if (showAbsenceModal === 'yesterday') {
      form.setFieldValue('yesterdayAbsence', {
        type: form.values.absenceType,
        reason: form.values.absenceReason,
      });
    } else {
      form.setFieldValue('todayAbsence', {
        type: form.values.absenceType,
        reason: form.values.absenceReason,
      });
    }
    setShowAbsenceModal(false);
    form.setFieldValue('absenceType', AbsenceType.SCHEDULED);
    form.setFieldValue('absenceReason', '');

    // Update output immediately
    const data: DailyReportData = {
      date: form.values.date.toISOString().split('T')[0],
      intern_name: form.values.internName,
      is_intern: form.values.isIntern,
      yesterdayLabel: form.values.yesterdayDate.toLocaleDateString('vi-VN'),
      todayLabel: form.values.todayDate.toLocaleDateString('vi-VN'),
      yesterdayTasks: form.values.yesterdayTasks,
      todayTasks: form.values.todayTasks,
      waitingForTask: form.values.waitingForTask,
      yesterdayAbsence: form.values.yesterdayAbsence,
      todayAbsence: form.values.todayAbsence,
    };
    onSubmit(data);
  };

  const handleConfirmAddTask = (task: Task) => {
    const taskToAdd: Task = {
      ...task,
      workDate: selectedDate?.toLocaleDateString('vi-VN'),
    };

    if (selectedDate?.toDateString() === form.values.yesterdayDate.toDateString()) {
      form.setFieldValue('yesterdayTasks', [...form.values.yesterdayTasks, taskToAdd]);
    } else {
      form.setFieldValue('todayTasks', [...form.values.todayTasks, taskToAdd]);
    }
    setShowAddTaskModal(false);

    // Update output immediately
    const data: DailyReportData = {
      date: form.values.date.toISOString().split('T')[0],
      intern_name: form.values.internName,
      is_intern: form.values.isIntern,
      yesterdayLabel: form.values.yesterdayDate.toLocaleDateString('vi-VN'),
      todayLabel: form.values.todayDate.toLocaleDateString('vi-VN'),
      yesterdayTasks:
        selectedDate?.toDateString() === form.values.yesterdayDate.toDateString()
          ? [...form.values.yesterdayTasks, taskToAdd]
          : form.values.yesterdayTasks,
      todayTasks:
        selectedDate?.toDateString() === form.values.todayDate.toDateString()
          ? [...form.values.todayTasks, taskToAdd]
          : form.values.todayTasks,
      waitingForTask: form.values.waitingForTask,
      yesterdayAbsence: form.values.yesterdayAbsence,
      todayAbsence: form.values.todayAbsence,
    };
    onSubmit(data);
  };

  const handleAddAbsence = (date: Date) => {
    setSelectedDate(date);
    setShowAbsenceModal(true);
  };

  const handleWaitingForTaskChange = (date: Date, checked: boolean) => {
    form.setFieldValue('waitingForTask', checked);
    onSubmit({
      date: date.toISOString().split('T')[0],
      intern_name: form.values.internName,
      is_intern: form.values.isIntern,
      yesterdayLabel: form.values.yesterdayDate.toLocaleDateString('vi-VN'),
      todayLabel: form.values.todayDate.toLocaleDateString('vi-VN'),
      yesterdayTasks: form.values.yesterdayTasks,
      todayTasks: form.values.todayTasks,
      waitingForTask: checked,
      yesterdayAbsence: form.values.yesterdayAbsence,
      todayAbsence: form.values.todayAbsence,
    });
  };

  return (
    <>
      {showError && (
        <Notification
          icon={<IconAlertCircle size={18} />}
          color="red"
          title="Lỗi"
          onClose={() => setShowError(false)}
          style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}
        >
          {errorMessage}
        </Notification>
      )}
      <Stack gap="md">
        <Paper shadow="xs" p="md">
          <Stack gap="md">
            <Title order={3}>Báo cáo công việc</Title>
            <Group grow align="flex-start">
              <TextInput
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                disabled={form.values.isIntern}
                withAsterisk
                {...form.getInputProps('internName')}
              />
              <DateInput
                label="Ngày báo cáo"
                placeholder="Chọn ngày"
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                withAsterisk
                clearable={false}
                style={{ flex: 1 }}
                {...form.getInputProps('date')}
              />
              <Checkbox
                label="Là thực tập sinh"
                mt={25}
                {...form.getInputProps('isIntern', { type: 'checkbox' })}
              />
            </Group>

            {form.values.isIntern && (
              <Select
                allowDeselect={false}
                label="Chọn thực tập sinh"
                placeholder="Chọn thực tập sinh"
                data={
                  internsData?.results.map((intern) => ({
                    value: intern.full_name,
                    label: `${intern.full_name} - ${intern.uni_code}`,
                  })) || []
                }
                withAsterisk
                disabled={isLoading}
                {...form.getInputProps('internName')}
              />
            )}

            <Stack gap="md">
              <Stack gap="xs">
                <DateInput
                  label="Ngày trước"
                  value={form.values.yesterdayDate}
                  onChange={(date: Date | null) =>
                    date && form.setFieldValue('yesterdayDate', date)
                  }
                  disabled
                  valueFormat="DD/MM/YYYY"
                  maxDate={new Date()}
                />
                <DaySection
                  date={form.values.yesterdayDate}
                  tasks={form.values.yesterdayTasks}
                  absence={form.values.yesterdayAbsence}
                  waitingForTask={form.values.waitingForTask}
                  onAddTask={() => handleAddTask(form.values.yesterdayDate)}
                  onAddAbsence={() => handleAddAbsence(form.values.yesterdayDate)}
                  onRemoveAbsence={() => form.setFieldValue('yesterdayAbsence', undefined)}
                  onWaitingForTaskChange={(checked) =>
                    handleWaitingForTaskChange(form.values.yesterdayDate, checked)
                  }
                  label="Hôm qua"
                />
              </Stack>

              <Stack gap="xs">
                <DateInput
                  label="Ngày hôm nay"
                  value={form.values.todayDate}
                  onChange={(date: Date | null) => date && form.setFieldValue('todayDate', date)}
                  disabled
                  valueFormat="DD/MM/YYYY"
                  maxDate={new Date()}
                />
                <DaySection
                  date={form.values.todayDate}
                  tasks={form.values.todayTasks}
                  absence={form.values.todayAbsence}
                  waitingForTask={form.values.waitingForTask}
                  onAddTask={() => handleAddTask(form.values.todayDate)}
                  onAddAbsence={() => handleAddAbsence(form.values.todayDate)}
                  onRemoveAbsence={() => form.setFieldValue('todayAbsence', undefined)}
                  onWaitingForTaskChange={(checked) =>
                    handleWaitingForTaskChange(form.values.todayDate, checked)
                  }
                  label="Hôm nay"
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <TaskModal
          opened={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleConfirmAddTask}
        />

        <AbsenceModal
          opened={Boolean(showAbsenceModal)}
          onClose={() => setShowAbsenceModal(false)}
          absenceType={form.values.absenceType}
          setAbsenceType={(type) => form.setFieldValue('absenceType', type)}
          absenceReason={form.values.absenceReason}
          setAbsenceReason={(reason) => form.setFieldValue('absenceReason', reason)}
          onSubmit={handleAbsenceSubmit}
        />
      </Stack>
    </>
  );
}
