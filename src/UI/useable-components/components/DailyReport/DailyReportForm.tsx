import { useState } from 'react';
import { IconAlertCircle, IconCalendarOff, IconPlus, IconX } from '@tabler/icons-react';
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
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { interns } from '@/Utils/constants/TaskForm.constants';
import {
  Absence,
  AbsenceType,
  DailyReportData,
  DailyReportFormProps,
} from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { TaskForm } from './TaskForm/TaskForm';

const absenceReasons = ['Nghỉ ốm', 'Nghỉ phép', 'Nghỉ lễ', 'Nghỉ việc riêng', 'Nghỉ không lương'];

export function DailyReportForm({ onSubmit }: DailyReportFormProps) {
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [internName, setInternName] = useState('');
  const [isIntern, setIsIntern] = useState(false);
  const [yesterdayLabel, setYesterdayLabel] = useState('Hôm qua:');
  const [todayLabel, setTodayLabel] = useState('Hôm nay:');
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
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleAddTask = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
    setTasks([
      ...tasks,
      {
        content: '',
        status: 'To Do',
      },
    ]);
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
  };

  const handleSubmit = () => {
    // Validate required fields
    const hasEmptyRequiredFields =
      yesterdayTasks.some((task) => !task.content || !task.est_time || !task.status) ||
      todayTasks.some((task) => !task.content || !task.est_time || !task.status);

    if (hasEmptyRequiredFields) {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc cho tất cả các task');
      return;
    }

    if (!internName) {
      showNotification('Vui lòng nhập họ và tên');
      return;
    }

    if (!date) {
      showNotification('Vui lòng chọn ngày báo cáo');
      return;
    }

    const data: DailyReportData = {
      date: date.toISOString().split('T')[0],
      intern_name: internName,
      is_intern: isIntern,
      yesterdayLabel,
      todayLabel,
      yesterdayTasks,
      todayTasks,
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
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
              data={interns.map((intern) => ({
                value: intern.full_name,
                label: `${intern.full_name} - ${intern.uni_code}`,
              }))}
              value={internName}
              onChange={(value) => {
                setInternName(value || '');
                setTouched((prev) => ({ ...prev, internName: true }));
              }}
              withAsterisk
              error={touched.internName && !internName && 'Vui lòng chọn thực tập sinh'}
            />
          )}

          {/* Nhãn 1 */}
          <Group gap={8} align="center" mb={4} wrap="nowrap">
            <TextInput
              label="Nhãn 1"
              value={yesterdayLabel}
              onChange={(e) => setYesterdayLabel(e.target.value)}
              placeholder="Nhãn..."
              size="sm"
              radius="sm"
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button
              variant="light"
              size="xs"
              radius="sm"
              px={10}
              style={{ fontWeight: 400, minWidth: 0, marginTop: 22 }}
              onClick={() => setYesterdayLabel('Hôm qua:')}
            >
              Mặc định
            </Button>
          </Group>

          <Box>
            <Stack gap="xs">
              {yesterdayTasks.map((task, index) => (
                <TaskForm
                  key={index}
                  task={task}
                  index={index}
                  onChange={(index: number, field: keyof Task, value: any) =>
                    handleTaskChange(yesterdayTasks, setYesterdayTasks, index, field, value)
                  }
                  onDelete={(index: number) =>
                    handleDeleteTask(yesterdayTasks, setYesterdayTasks, index)
                  }
                  label={`Task ${index + 1}`}
                />
              ))}
              <Group justify="space-between">
                <Group>
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => handleAddTask(yesterdayTasks, setYesterdayTasks)}
                  >
                    Thêm dòng
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

          {/* Nhãn 2 */}
          <Group gap={8} align="center" mb={4} wrap="nowrap">
            <TextInput
              label="Nhãn 2"
              value={todayLabel}
              onChange={(e) => setTodayLabel(e.target.value)}
              placeholder="Nhãn..."
              size="sm"
              radius="sm"
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button
              variant="light"
              size="xs"
              radius="sm"
              px={10}
              style={{ fontWeight: 400, minWidth: 0, marginTop: 22 }}
              onClick={() => setTodayLabel('Hôm nay:')}
            >
              Mặc định
            </Button>
          </Group>

          <Box>
            <Stack gap="xs">
              {todayTasks.map((task, index) => (
                <TaskForm
                  key={index}
                  task={task}
                  index={index}
                  onChange={(index: number, field: keyof Task, value: any) =>
                    handleTaskChange(todayTasks, setTodayTasks, index, field, value)
                  }
                  onDelete={(index: number) => handleDeleteTask(todayTasks, setTodayTasks, index)}
                  label={`Task ${index + 1}`}
                />
              ))}
              <Group justify="space-between">
                <Group>
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => handleAddTask(todayTasks, setTodayTasks)}
                  >
                    Thêm dòng
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

          <Button type="submit" fullWidth mt="auto">
            Tạo báo cáo
          </Button>
        </Stack>
      </form>
    </>
  );
}
