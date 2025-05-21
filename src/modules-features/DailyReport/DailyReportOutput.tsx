import { Fragment, useState } from 'react';
import {
  IconCheck,
  IconClock,
  IconCopy,
  IconEdit,
  IconTable,
  IconTextCaption,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Center,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
  Modal,
  Button,
  NumberInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AbsenceType } from '@/interfaces/DailyReportForm.types';
import { Task } from '@/interfaces/task.types';
import { useDailyReport } from '../../context/DailyReportContext';
import { TaskModal } from './TaskModal';
import { useTaskMutations } from '@/hooks/use_tasks';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@mantine/form';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTextOutput = (data: any) => {
  let output = `${data.name}${data.isIntern ? ' (Thực tập sinh)' : ''}\n`;
  output += `Daily (${formatDate(new Date(data.todayDate))})\n\n`;

  output += `# ${formatDate(new Date(data.yesterdayDate))}:\n`;
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
  const [continueModal, setContinueModal] = useState(false);
  const [doneModal, setDoneModal] = useState(false);
  const [continueHours, setContinueHours] = useState<number | undefined>(undefined);
  const [doneHours, setDoneHours] = useState<number | undefined>(undefined);
  const {
    name,
    intern,
    isIntern,
    waitingForTask,
    yesterdayDate,
    todayDate,
    yesterdayTasks,
    todayTasks,
    updateTask,
    deleteTask,
  } = useDailyReport();
  const { deleteTask: deleteTaskMutation } = useTaskMutations();
  const queryClient = useQueryClient();

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
      await navigator.clipboard.writeText(formatTextOutput(data));
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

  const handleEditSubmit = () => {
    if (currentTask) {
      updateTask(currentTask, isTodayTask);
    }
    editModalHandlers.close();
    setCurrentTask(null);
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
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${isTodayTask ? todayDate : yesterdayDate}`]
      });
    }
    deleteModalHandlers.close();
    setCurrentTask(null);
  };

  const handleDoneClick = () => {
    setDoneModal(true);
    setContinueModal(false);
  };

  const handleDoneSubmit = async () => {
    if (currentTask && typeof doneHours === 'number') {
      await updateTask({ ...currentTask, status: 'Done', act_time: doneHours }, false);
      editModalHandlers.close();
      setDoneModal(false);
      setCurrentTask(null);
      setDoneHours(undefined);
    }
  };

  const handleContinueClick = () => {
    setContinueModal(true);
    setDoneModal(false);
  };

  const handleContinueSubmit = async () => {
    if (currentTask && typeof continueHours === 'number') {
      const newTask = {
        ...currentTask,
        id: undefined,
        date: todayDate,
        est_time: continueHours,
        act_time: undefined,
        status: 'To Do',
        content: currentTask.content + ' (làm tiếp)',
      };
      await updateTask(newTask, true);
      editModalHandlers.close();
      setContinueModal(false);
      setCurrentTask(null);
      setContinueHours(undefined);
    }
  };

  // Handler for special actions from TaskModal
  const handleSpecialAction = async (
    action: 'done' | 'continue',
    value: number | { est_time: number; act_time: number }
  ) => {
    if (!currentTask) return;
    if (action === 'done' && typeof value === 'number') {
      await updateTask({ ...currentTask, status: 'Done', act_time: value }, false);
      editModalHandlers.close();
      setCurrentTask(null);
    } else if (action === 'continue' && typeof value === 'object' && value) {
      // Cập nhật act_time hôm qua trước
      await updateTask({ ...currentTask, act_time: value.act_time }, false);
      // Tạo task mới cho hôm nay
      const newTask = {
        ...currentTask,
        id: undefined,
        date: todayDate,
        est_time: value.est_time,
        act_time: undefined,
        status: 'To Do',
        content: currentTask.content + ' (làm tiếp)',
      };
      await updateTask(newTask, true);
      editModalHandlers.close();
      setCurrentTask(null);
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
                  <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
                    <Table
                      striped
                      highlightOnHover
                      withTableBorder
                      withColumnBorders
                      style={{
                        '& thead tr th': {
                          backgroundColor: 'var(--mantine-color-blue-0)',
                          color: 'var(--mantine-color-blue-7)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '0.75rem 1rem',
                        },
                        '& tbody tr td': {
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                        },
                        '& tbody tr:hover': {
                          backgroundColor: 'var(--mantine-color-blue-0)',
                        },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Task ID</Table.Th>
                          <Table.Th>Dự án</Table.Th>
                          <Table.Th>Nội dung</Table.Th>
                          <Table.Th>Dự kiến</Table.Th>
                          <Table.Th>Thực tế</Table.Th>
                          <Table.Th>Trạng thái</Table.Th>
                          <Table.Th>Hành động</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {yesterdayTasks.map((task: Task, index: number) => (
                          <Table.Tr key={index}>
                            <Table.Td>{task.task_id || '-'}</Table.Td>
                            <Table.Td>{task.project || '-'}</Table.Td>
                            <Table.Td>{task.content || '-'}</Table.Td>
                            <Table.Td>{task.est_time ? `${task.est_time}h` : '-'}</Table.Td>
                            <Table.Td>{task.act_time ? `${task.act_time}h` : '-'}</Table.Td>
                            <Table.Td>{task.status || '-'}</Table.Td>
                            <Table.Td>
                              <Flex gap={4} justify="flex-end">
                                <Tooltip label="Chỉnh sửa">
                                  <ActionIcon
                                    variant="light"
                                    color="yellow"
                                    size="sm"
                                    radius="xl"
                                    onClick={() => handleEditClick(task, index, false)}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Xóa">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="sm"
                                    radius="xl"
                                    onClick={() => handleDeleteClick(task, false)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Flex>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
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
                  <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
                    <Table
                      striped
                      highlightOnHover
                      withTableBorder
                      withColumnBorders
                      style={{
                        '& thead tr th': {
                          backgroundColor: 'var(--mantine-color-blue-0)',
                          color: 'var(--mantine-color-blue-7)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '0.75rem 1rem',
                        },
                        '& tbody tr td': {
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                        },
                        '& tbody tr:hover': {
                          backgroundColor: 'var(--mantine-color-blue-0)',
                        },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Task ID</Table.Th>
                          <Table.Th>Dự án</Table.Th>
                          <Table.Th>Nội dung</Table.Th>
                          <Table.Th>Dự kiến</Table.Th>
                          <Table.Th>Thực tế</Table.Th>
                          <Table.Th>Trạng thái</Table.Th>
                          <Table.Th>Hành động</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {todayTasks.map((task: Task, index: number) => (
                          <Table.Tr key={index}>
                            <Table.Td>{task.task_id || '-'}</Table.Td>
                            <Table.Td>{task.project || '-'}</Table.Td>
                            <Table.Td>{task.content || '-'}</Table.Td>
                            <Table.Td>{task.est_time ? `${task.est_time}h` : '-'}</Table.Td>
                            <Table.Td>{task.act_time ? `${task.act_time}h` : '-'}</Table.Td>
                            <Table.Td>{task.status || '-'}</Table.Td>
                            <Table.Td>
                              <Flex gap={4} justify="flex-end">
                                <Tooltip label="Chỉnh sửa">
                                  <ActionIcon
                                    variant="light"
                                    color="yellow"
                                    size="sm"
                                    radius="xl"
                                    onClick={() => handleEditClick(task, index, true)}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Xóa">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="sm"
                                    radius="xl"
                                    onClick={() => handleDeleteClick(task, true)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Flex>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
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
                <Text style={{ whiteSpace: 'pre-wrap' }}>{formatTextOutput(data)}</Text>
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
          onSubmit={handleEditSubmit}
          initialValues={currentTask || undefined}
          isEdit={true}
          isToday={isTodayTask}
          onSpecialAction={handleSpecialAction}
        />
      )}

      <Modal
        opened={deleteModal}
        onClose={deleteModalHandlers.close}
        title="Xác nhận xóa"
        centered
      >
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

      <Modal opened={doneModal} onClose={() => setDoneModal(false)} title="Nhập thời gian thực tế" centered>
        <Stack>
          <Text>Nhập số giờ thực tế đã làm để hoàn thành task:</Text>
          <NumberInput
            label="Thời gian thực tế (giờ)"
            min={0}
            value={doneHours}
            onChange={(val) => setDoneHours(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDoneModal(false)}>Hủy</Button>
            <Button color="green" onClick={handleDoneSubmit} disabled={typeof doneHours !== 'number' || doneHours <= 0}>Cập nhật</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={continueModal} onClose={() => setContinueModal(false)} title="Làm tiếp task cho hôm nay" centered>
        <Stack>
          <Text>Nhập số giờ bạn sẽ tiếp tục làm task này hôm nay:</Text>
          <NumberInput
            label="Thời gian dự kiến (giờ)"
            min={0}
            value={continueHours}
            onChange={(val) => setContinueHours(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setContinueModal(false)}>Hủy</Button>
            <Button color="blue" onClick={handleContinueSubmit} disabled={typeof continueHours !== 'number' || continueHours <= 0}>Tạo task mới</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
