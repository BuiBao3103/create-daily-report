import { Fragment, useState } from 'react';
import { IconCheck, IconClock, IconCopy, IconTable, IconTextCaption, IconTrash } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Modal,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTaskMutations } from '@/hooks/use_tasks';
import { Task } from '@/interfaces/task.types';
import { TaskTable } from './components/TaskTable';
import { TaskModal } from './TaskModal';
import { AbsenceModal } from './AbsenceModal';
import { AbsenceType } from '@/interfaces/DailyReportForm.types';
import { useDailyReport } from '@/context/DailyReportContext';
import useAbsences from '@/hooks/use_absences';
import { Absence } from '@/interfaces/absence.types';
import { useAbsenceMutations } from '@/hooks/use_absences';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTextOutput = (data: any, yesterdayAbsences: any, todayAbsences: any) => {
  let output = `${data.name}${data.isIntern ? ' (Thực tập sinh)' : ''}\n`;
  output += `Daily (${formatDate(new Date(data.todayDate))})\n\n`;

  output += `# ${formatDate(new Date(data.yesterdayDate))}:\n`;
  yesterdayAbsences?.results?.forEach((absence: any) => {
    output += `+ [Nghỉ ${absence.type}] ${absence.reason}\n`;
  });
  data.yesterdayTasks?.forEach((task: Task) => {
    const taskId = task.task_id ? `[${task.task_id}]` : '';
    const project = task.project ? `(${task.project})` : '';
    const estTime = task.est_time ? `dự kiến: ${task.est_time}h` : '';
    const actTime = task.act_time ? `thực tế: ${task.act_time}h` : '';
    const timeInfo = [estTime, actTime].filter(Boolean).join(' - ');
    const status = task.status ? task.status : '';

    const parts = [taskId, project, task.content, timeInfo, status].filter(Boolean);
    output += `+ ${parts.join(' - ')}\n`;
  });

  output += `\n# ${formatDate(new Date(data.todayDate))}:\n`;
  todayAbsences?.results?.forEach((absence: any) => {
    output += `+ [Nghỉ ${absence.type}] ${absence.reason}\n`;
  });
  data.todayTasks?.forEach((task: Task) => {
    const taskId = task.task_id ? `[${task.task_id}]` : '';
    const project = task.project ? `(${task.project})` : '';
    const estTime = task.est_time ? `dự kiến: ${task.est_time}h` : '';
    const actTime = task.act_time ? `thực tế: ${task.act_time}h` : '';
    const timeInfo = [estTime, actTime].filter(Boolean).join(' - ');
    const status = task.status ? task.status : '';

    const parts = [taskId, project, task.content, timeInfo, status].filter(Boolean);
    output += `+ ${parts.join(' - ')}\n`;
  });

  if (data.waitingForTask) {
    output += '+ Chờ task\n';
  }

  return output;
};

export function DailyReportOutput() {
  const [isTableView, setIsTableView] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editModal, editModalHandlers] = useDisclosure(false);
  const [deleteModal, deleteModalHandlers] = useDisclosure(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isTodayTask, setIsTodayTask] = useState(true);
  const [doneModal, setDoneModal] = useState(false);
  const [doneHours, setDoneHours] = useState<number | undefined>(undefined);
  const [absenceModalOpened, setAbsenceModalOpened] = useState(false);
  const [absenceType, setAbsenceType] = useState<AbsenceType>(AbsenceType.SCHEDULED);
  const [absenceReason, setAbsenceReason] = useState('');
  const {
    name,
    intern,
    isIntern,
    waitingForTask,
    yesterdayDate,
    todayDate,
    yesterdayTasks,
    todayTasks,
    selectedIntern,
    workDate,
  } = useDailyReport();
  const { deleteTask: deleteTaskMutation, updateTask: taskMutationsUpdateTask, addTask: addTaskMutation } =
    useTaskMutations();
  const queryClient = useQueryClient();
  const { data: yesterdayAbsences } = useAbsences({
    params: `?intern=${intern}&date=${yesterdayDate}`
  });
  const { data: todayAbsences } = useAbsences({
    params: `?intern=${intern}&date=${todayDate}`
  });
  const { deleteAbsence } = useAbsenceMutations();

  const handleCopy = async () => {
    try {
      const data = {
        name,
        isIntern,
        waitingForTask,
        yesterdayDate,
        todayDate,
        yesterdayTasks,
        todayTasks,
      };
      await navigator.clipboard.writeText(formatTextOutput(data, yesterdayAbsences, todayAbsences));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Không thể sao chép: ', error);
    }
  };

  const handleEditClick = (task: Task, index: number, isToday: boolean) => {
    setCurrentTask(task);
    setIsTodayTask(isToday);
    editModalHandlers.open();
  };

  const handleDeleteClick = (task: Task, isToday: boolean) => {
    setCurrentTask(task);
    setIsTodayTask(isToday);
    deleteModalHandlers.open();
  };

  const handleDeleteConfirm = async () => {
    if (currentTask?.id) {
      await deleteTaskMutation.mutateAsync(currentTask.id);
      await queryClient.refetchQueries({
        queryKey: [
          '/api/tasks/',
          `?intern=${intern}&date=${isTodayTask ? todayDate : yesterdayDate}`,
        ],
      });
    }
    deleteModalHandlers.close();
    setCurrentTask(null);
  };

  const handleSpecialAction = async (
    action: 'done' | 'continue',
    value: number | { est_time: number; act_time: number }
  ) => {
    if (!currentTask) return;
    if (action === 'done' && typeof value === 'number') {
      await taskMutationsUpdateTask.mutateAsync({
        ...currentTask,
        status: 'Done',
        act_time: value,
      });
      await queryClient.refetchQueries({
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${yesterdayDate}`],
      });
      editModalHandlers.close();
      setCurrentTask(null);
    } else if (action === 'continue' && typeof value === 'object' && value) {
      await taskMutationsUpdateTask.mutateAsync({
        ...currentTask,
        est_time: value.act_time,
        act_time: value.act_time,
        status: 'Done',
      });
      await queryClient.refetchQueries({
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${yesterdayDate}`],
      });
      const newTask = {
        ...currentTask,
        id: undefined,
        date: todayDate,
        est_time: value.est_time,
        act_time: undefined,
        status: 'To Do',
        content: currentTask.content + ' (làm tiếp)',
      };
      await addTaskMutation.mutateAsync(newTask);
      await queryClient.refetchQueries({
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${todayDate}`],
      });
      editModalHandlers.close();
      setCurrentTask(null);
    }
  };

  const handleAbsenceSubmit = () => {
    // Implementation of handleAbsenceSubmit
  };

  const handleDeleteAbsence = async (id: number) => {
    try {
      await deleteAbsence.mutateAsync(id);
      await queryClient.invalidateQueries({ queryKey: ['/api/absences/'] });
    } catch (error) {
      console.error('Error deleting absence:', error);
    }
  };

  const data = {
    name,
    isIntern,
    waitingForTask,
    yesterdayDate,
    todayDate,
    yesterdayTasks,
    todayTasks,
  };

  return (
    <Paper p="xl" withBorder radius="md" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text size="xl" fw={600} c="blue.7">
              Báo cáo công việc
            </Text>
            <Text size="sm" c="dimmed">
              {data.todayDate ? formatDate(new Date(data.todayDate)) : 'Chưa có dữ liệu'}
            </Text>
          </Stack>
          <Group gap="xs" align="center">
            <SegmentedControl
              value={isTableView ? 'table' : 'text'}
              onChange={(value) => setIsTableView(value === 'table')}
              data={[
                {
                  label: (
                    <Tooltip label="Chế độ bảng">
                      <Center h={24}>
                        <IconTable size={18} />
                      </Center>
                    </Tooltip>
                  ),
                  value: 'table',
                },
                {
                  label: (
                    <Tooltip label="Chế độ văn bản">
                      <Center h={24}>
                        <IconTextCaption size={18} />
                      </Center>
                    </Tooltip>
                  ),
                  value: 'text',
                },
              ]}
              size="sm"
              radius="md"
              color="blue"
              transitionDuration={200}
              transitionTimingFunction="ease"
            />
            {data && (
              <Tooltip
                label={copied ? 'Đã sao chép!' : 'Sao chép báo cáo'}
                position="bottom"
                withArrow
                transitionProps={{ transition: 'fade', duration: 200 }}
              >
                <ActionIcon
                  variant="light"
                  color={copied ? 'green' : 'blue'}
                  onClick={handleCopy}
                  size="lg"
                  radius="md"
                  style={{ transitionDuration: '200ms' }}
                >
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {data && (
          <Stack gap="md">
            {isTableView ? (
              <Stack gap="xl">
                <Stack gap="md">
                  <Group>
                    <Badge size="lg" variant="light" color="blue" radius="md">
                      {data.name}
                      {data.isIntern ? ' (Thực tập sinh)' : ''}
                    </Badge>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={500} c="dimmed" size="sm">
                        CÔNG VIỆC HÔM QUA
                      </Text>
                      <Text size="sm" c="blue.7">
                        {formatDate(new Date(data.yesterdayDate))}
                      </Text>
                    </Stack>
                    <Badge variant="light" color="blue" radius="md">
                      {data.yesterdayTasks.length} công việc
                    </Badge>
                  </Group>
                  {yesterdayAbsences?.results && yesterdayAbsences.results.length > 0 && (
                    <Stack gap="xs">
                      <Text fw={500} c="dimmed" size="sm">Nghỉ phép</Text>
                      {yesterdayAbsences.results.map((absence: Absence) => (
                        <Group key={absence.id} gap="xs" justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon size="sm" radius="xl" variant="light" color="red">
                              <IconClock size={14} />
                            </ThemeIcon>
                            <Text size="sm">
                              {absence.type} - {absence.reason}
                            </Text>
                          </Group>
                          <ActionIcon 
                            variant="light" 
                            color="red" 
                            size="sm"
                            onClick={() => handleDeleteAbsence(absence.id)}
                            loading={deleteAbsence.isPending}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  )}
                  <TaskTable
                    tasks={yesterdayTasks}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isToday={false}
                  />
                </Stack>

                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={500} c="dimmed" size="sm">
                        CÔNG VIỆC HÔM NAY
                      </Text>
                      <Text size="sm" c="blue.7">
                        {formatDate(new Date(data.todayDate))}
                      </Text>
                    </Stack>
                    <Badge variant="light" color="blue" radius="md">
                      {data.todayTasks.length} công việc
                    </Badge>
                  </Group>
                  {todayAbsences?.results && todayAbsences.results.length > 0 && (
                    <Stack gap="xs">
                      <Text fw={500} c="dimmed" size="sm">Nghỉ phép</Text>
                      {todayAbsences.results.map((absence: Absence) => (
                        <Group key={absence.id} gap="xs" justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon size="sm" radius="xl" variant="light" color="red">
                              <IconClock size={14} />
                            </ThemeIcon>
                            <Text size="sm">
                              {absence.type} - {absence.reason}
                            </Text>
                          </Group>
                          <ActionIcon 
                            variant="light" 
                            color="red" 
                            size="sm"
                            onClick={() => handleDeleteAbsence(absence.id)}
                            loading={deleteAbsence.isPending}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  )}
                  <TaskTable
                    tasks={todayTasks}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isToday={true}
                  />
                  {data.waitingForTask && (
                    <Group gap="xs">
                      <ThemeIcon size="sm" radius="xl" variant="light" color="yellow">
                        <IconClock size={14} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed">
                        Đang chờ task mới
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Paper p="md" withBorder radius="md" bg="var(--mantine-color-body)">
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {formatTextOutput(data, yesterdayAbsences, todayAbsences)}
                </Text>
              </Paper>
            )}
          </Stack>
        )}
      </Stack>

      {data && (
        <TaskModal
          workDate={currentTask?.date ?? ''}
          opened={editModal}
          onClose={editModalHandlers.close}
          onSubmit={() => {
            editModalHandlers.close();
            setCurrentTask(null);
          }}
          initialValues={currentTask || undefined}
          isEdit={true}
          isToday={isTodayTask}
          onSpecialAction={handleSpecialAction}
        />
      )}

      <Modal opened={deleteModal} onClose={deleteModalHandlers.close} title="Xác nhận xóa" centered>
        <Stack>
          <Text>Bạn có chắc chắn muốn xóa task này?</Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={deleteModalHandlers.close}>
              Hủy
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </Group>
        </Stack>
      </Modal>

      <AbsenceModal
        opened={absenceModalOpened}
        onClose={() => setAbsenceModalOpened(false)}
        absenceType={absenceType}
        setAbsenceType={setAbsenceType}
        absenceReason={absenceReason}
        setAbsenceReason={setAbsenceReason}
        onSubmit={handleAbsenceSubmit}
        date={workDate}
        intern={selectedIntern}
      />
    </Paper>
  );
}
