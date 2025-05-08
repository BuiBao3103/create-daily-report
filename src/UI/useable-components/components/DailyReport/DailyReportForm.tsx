'use-client';

import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCalendarOff, IconPlus, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Notification,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { internService } from '@/Lib/Services/intern.service';
import {
  Absence,
  AbsenceType,
  DailyReportData,
  DailyReportFormProps,
} from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { Intern, InternsResponse } from '@/Utils/types/intern.types';
import { TaskForm } from './TaskForm/TaskForm';

const absenceReasons = ['Nghỉ ốm', 'Nghỉ phép', 'Nghỉ lễ', 'Nghỉ việc riêng', 'Nghỉ không lương'];

export function DailyReportForm({ onSubmit }: DailyReportFormProps) {
  const { data: internsData, isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: internService.getInterns,
  });

  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [internName, setInternName] = useState('');
  const [isIntern, setIsIntern] = useState(false);
  const [yesterdayDate, setYesterdayDate] = useState<Date>(new Date());
  const [todayDate, setTodayDate] = useState<Date>(new Date());
  const [waitingForTask, setWaitingForTask] = useState(false);
  const [yesterdayAbsence, setYesterdayAbsence] = useState<Absence | undefined>();
  const [todayAbsence, setTodayAbsence] = useState<Absence | undefined>();
  const [showAbsenceModal, setShowAbsenceModal] = useState<'yesterday' | 'today' | null>(null);
  const [absenceType, setAbsenceType] = useState<AbsenceType>(AbsenceType.SCHEDULED);
  const [absenceReason, setAbsenceReason] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState({
    internName: false,
    date: false,
    absenceType: false,
    absenceReason: false,
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    content: '',
    task_id: '',
    project: '',
    est_time: 0,
    act_time: 0,
    status: 'To Do',
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calculate previous date based on current date
  useEffect(() => {
    const today = new Date();
    setTodayDate(today);

    const yesterday = new Date(today);
    // If today is Monday (1), set to last Friday
    if (today.getDay() === 1) {
      yesterday.setDate(today.getDate() - 3); // Go back 3 days to get to Friday
    } else {
      yesterday.setDate(today.getDate() - 1); // Go back 1 day
    }
    setYesterdayDate(yesterday);
  }, []);

  const showNotification = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleTaskChange = (
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    index: number,
    field: keyof Task,
    value: any
  ) => {
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      [field]: value,
      workDate: field === 'workDate' ? value : newTasks[index].workDate,
    };
    setTasks(newTasks);
  };

  const handleAddTask = (
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    date: Date
  ) => {
    setSelectedDate(date);
    setNewTask({
      content: '',
      task_id: '',
      project: '',
      est_time: 0,
      act_time: 0,
      status: 'To Do',
    });
    setShowAddTaskModal(true);
  };

  const handleDeleteTask = (
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    index: number
  ) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleAbsenceSubmit = () => {
    if (showAbsenceModal === 'yesterday') {
      setYesterdayAbsence({ type: absenceType, reason: absenceReason });
    } else {
      setTodayAbsence({ type: absenceType, reason: absenceReason });
    }
    setShowAbsenceModal(null);
    setAbsenceType(AbsenceType.SCHEDULED);
    setAbsenceReason('');

    // Update output immediately
    const data: DailyReportData = {
      date: date.toISOString().split('T')[0],
      intern_name: internName,
      is_intern: isIntern,
      yesterdayLabel: yesterdayDate.toLocaleDateString('vi-VN'),
      todayLabel: todayDate.toLocaleDateString('vi-VN'),
      yesterdayTasks,
      todayTasks,
      waitingForTask,
      yesterdayAbsence: showAbsenceModal === 'yesterday' 
        ? { type: absenceType, reason: absenceReason } 
        : yesterdayAbsence,
      todayAbsence: showAbsenceModal === 'today' 
        ? { type: absenceType, reason: absenceReason } 
        : todayAbsence,
    };
    onSubmit(data);
  };

  const handleConfirmAddTask = () => {
    if (!newTask.content || !newTask.est_time) {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const taskToAdd: Task = {
      ...newTask,
      workDate: selectedDate.toLocaleDateString('vi-VN'),
    };

    if (selectedDate.toDateString() === yesterdayDate.toDateString()) {
      setYesterdayTasks([...yesterdayTasks, taskToAdd]);
    } else {
      setTodayTasks([...todayTasks, taskToAdd]);
    }
    setShowAddTaskModal(false);
    setNewTask({
      content: '',
      task_id: '',
      project: '',
      est_time: 0,
      act_time: 0,
      status: 'To Do',
    });

    // Update output immediately
    const data: DailyReportData = {
      date: date.toISOString().split('T')[0],
      intern_name: internName,
      is_intern: isIntern,
      yesterdayLabel: yesterdayDate.toLocaleDateString('vi-VN'),
      todayLabel: todayDate.toLocaleDateString('vi-VN'),
      yesterdayTasks: selectedDate.toDateString() === yesterdayDate.toDateString() 
        ? [...yesterdayTasks, taskToAdd] 
        : yesterdayTasks,
      todayTasks: selectedDate.toDateString() === todayDate.toDateString() 
        ? [...todayTasks, taskToAdd] 
        : todayTasks,
      waitingForTask,
      yesterdayAbsence,
      todayAbsence,
    };
    onSubmit(data);
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
      <Stack>
        <Group grow align="flex-start">
          <TextInput
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={internName}
            onChange={(e) => {
              setInternName(e.target.value);
              setTouched((prev) => ({ ...prev, internName: true }));
            }}
            disabled={isIntern}
            withAsterisk
            error={touched.internName && !internName && 'Vui lòng nhập họ và tên'}
          />
          <DateInput
            label="Ngày báo cáo"
            placeholder="Chọn ngày"
            value={date}
            onChange={(value: Date | null) => {
              setDate(value || new Date());
              setTouched((prev) => ({ ...prev, date: true }));
            }}
            valueFormat="DD/MM/YYYY"
            maxDate={new Date()}
            withAsterisk
            error={touched.date && !date && 'Vui lòng chọn ngày báo cáo'}
            clearable={false}
            style={{ flex: 1 }}
          />
          <Checkbox
            label="Là thực tập sinh"
            checked={isIntern}
            onChange={(e) => setIsIntern(e.currentTarget.checked)}
            mt={25}
          />
        </Group>

        {isIntern && (
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
            value={internName}
            onChange={(value) => {
              setInternName(value || '');
              setTouched((prev) => ({ ...prev, internName: true }));
            }}
            withAsterisk
            error={touched.internName && !internName && 'Vui lòng chọn thực tập sinh'}
            disabled={isLoading}
          />
        )}

        {/* Ngày trước */}
        <DateInput
          label="Ngày trước"
          value={yesterdayDate}
          onChange={(value: Date | null) => setYesterdayDate(value || new Date())}
          valueFormat="DD/MM/YYYY"
          maxDate={new Date()}
          clearable={false}
          disabled
        />

        <Box>
          <Stack gap="xs">
            <Group justify="space-between">
              <Group>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleAddTask(yesterdayTasks, setYesterdayTasks, yesterdayDate)}
                >
                  Thêm task
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCalendarOff size={14} />}
                  onClick={() => setShowAbsenceModal('yesterday')}
                >
                  Nghỉ
                </Button>
              </Group>
              {yesterdayAbsence && (
                <Group gap="xs">
                  <Badge
                    variant="light"
                    color={
                      yesterdayAbsence.type === AbsenceType.SCHEDULED
                        ? 'blue'
                        : yesterdayAbsence.type === AbsenceType.EXCUSED
                          ? 'green'
                          : 'red'
                    }
                  >
                    Nghỉ{' '}
                    {yesterdayAbsence.type === AbsenceType.SCHEDULED
                      ? 'theo lịch'
                      : yesterdayAbsence.type === AbsenceType.EXCUSED
                        ? 'có phép'
                        : 'không phép'}
                    : {yesterdayAbsence.reason}
                  </Badge>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setYesterdayAbsence(undefined)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Group>
          </Stack>
        </Box>

        {/* Ngày hôm nay */}
        <DateInput
          label="Ngày hôm nay"
          value={todayDate}
          onChange={(value: Date | null) => setTodayDate(value || new Date())}
          valueFormat="DD/MM/YYYY"
          maxDate={new Date()}
          clearable={false}
          disabled
        />

        <Box>
          <Stack gap="xs">
            <Group justify="space-between">
              <Group>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleAddTask(todayTasks, setTodayTasks, todayDate)}
                >
                  Thêm task
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCalendarOff size={14} />}
                  onClick={() => setShowAbsenceModal('today')}
                >
                  Nghỉ
                </Button>
              </Group>
              <Group>
                {todayAbsence && (
                  <Group gap="xs">
                    <Badge
                      variant="light"
                      color={
                        todayAbsence.type === AbsenceType.SCHEDULED
                          ? 'blue'
                          : todayAbsence.type === AbsenceType.EXCUSED
                            ? 'green'
                            : 'red'
                      }
                    >
                      Nghỉ{' '}
                      {todayAbsence.type === AbsenceType.SCHEDULED
                        ? 'theo lịch'
                        : todayAbsence.type === AbsenceType.EXCUSED
                          ? 'có phép'
                          : 'không phép'}
                      : {todayAbsence.reason}
                    </Badge>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => setTodayAbsence(undefined)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                )}
                <Checkbox
                  label="Chờ task"
                  checked={waitingForTask}
                  onChange={(e) => setWaitingForTask(e.currentTarget.checked)}
                />
              </Group>
            </Group>
          </Stack>
        </Box>

        <Modal
          opened={showAbsenceModal !== null}
          onClose={() => setShowAbsenceModal(null)}
          title="Thông tin nghỉ"
          centered
        >
          <Stack>
            <Select
              label="Loại nghỉ"
              allowDeselect={false}
              value={absenceType}
              onChange={(value) => {
                setAbsenceType(value as AbsenceType);
                setTouched((prev) => ({ ...prev, absenceType: true }));
              }}
              data={[
                { value: AbsenceType.SCHEDULED, label: 'Nghỉ theo lịch' },
                { value: AbsenceType.EXCUSED, label: 'Nghỉ có phép' },
                { value: AbsenceType.UNEXCUSED, label: 'Nghỉ không phép' },
              ]}
              withAsterisk
              error={touched.absenceType && !absenceType && 'Vui lòng chọn loại nghỉ'}
            />
            <Autocomplete
              label="Lý do"
              placeholder="Chọn hoặc nhập lý do"
              value={absenceReason}
              onChange={(value) => {
                setAbsenceReason(value);
                setTouched((prev) => ({ ...prev, absenceReason: true }));
              }}
              data={absenceReasons}
              withAsterisk
              error={touched.absenceReason && !absenceReason && 'Vui lòng nhập lý do nghỉ'}
            />
            <Button onClick={handleAbsenceSubmit} disabled={!absenceType || !absenceReason}>
              Xác nhận
            </Button>
          </Stack>
        </Modal>

        <Modal
          opened={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          title="Thêm task mới"
          centered
        >
          <TaskForm
            task={newTask}
            index={0}
            onChange={(_, field, value) => setNewTask({ ...newTask, [field]: value })}
            onDelete={() => setShowAddTaskModal(false)}
            label="Task mới"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setShowAddTaskModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmAddTask}>Thêm</Button>
          </Group>
        </Modal>
      </Stack>
    </>
  );
}
