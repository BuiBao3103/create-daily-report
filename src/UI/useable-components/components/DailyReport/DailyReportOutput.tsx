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
} from '@mantine/core';
import { AbsenceType, DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { TaskModal } from './components/TaskModal';
import { useDailyReport } from './context/DailyReportContext';

interface DailyReportOutputProps {
  readonly data?: DailyReportData;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTextOutput = (data: DailyReportData) => {
  let output = `${data.intern_name}${data.is_intern ? ' (Thực tập sinh)' : ''}\n`;
  output += `Daily (${formatDate(data.date)})\n\n`;

  output += `# ${formatDate(data.yesterdayDate)}:\n`;
  if (data.yesterdayAbsence) {
    output += `+ Nghỉ ${data.yesterdayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : data.yesterdayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: ${data.yesterdayAbsence.reason}\n`;
  }
  data.yesterdayTasks.forEach((task) => {
    const taskId = task.task_id ? `[${task.task_id}]` : '';
    const project = task.project ? `(${task.project})` : '';
    const estTime = task.est_time ? `dự kiến: ${task.est_time}h` : '';
    const actTime = task.act_time ? `thực tế: ${task.act_time}h` : '';
    const timeInfo = [estTime, actTime].filter(Boolean).join(' - ');
    const status = task.status ? task.status : '';

    const parts = [taskId, project, task.content, timeInfo, status].filter(Boolean);
    output += `+ ${parts.join(' - ')}\n`;
  });

  output += `\n# ${formatDate(data.todayDate)}:\n`;
  if (data.todayAbsence) {
    output += `+ Nghỉ ${data.todayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : data.todayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: ${data.todayAbsence.reason}\n`;
  }
  data.todayTasks.forEach((task) => {
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

export function DailyReportOutput({ data }: DailyReportOutputProps) {
  const [isTableView, setIsTableView] = useState(true);
  const [copied, setCopied] = useState(false);
  const { deleteTask, editTask, deleteAbsence } = useDailyReport();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isTodayTask, setIsTodayTask] = useState(true);

  const handleCopy = async () => {
    if (!data) return;
    try {
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
    setEditModalOpened(true);
  };

  const handleEditSubmit = (updatedTask: Task) => {
    if (currentTask) {
      const index = isTodayTask
        ? (data?.todayTasks.findIndex((t) => t === currentTask) ?? -1)
        : (data?.yesterdayTasks.findIndex((t) => t === currentTask) ?? -1);

      if (index !== -1) {
        editTask(index, isTodayTask, updatedTask);
      }
    }
    setEditModalOpened(false);
    setCurrentTask(null);
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
              {data?.date ? formatDate(data.date) : 'Chưa có dữ liệu'}
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
                      {data.intern_name}
                      {data.is_intern ? ' (Thực tập sinh)' : ''}
                    </Badge>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={500} c="dimmed" size="sm">
                        CÔNG VIỆC HÔM QUA
                      </Text>
                      <Text size="sm" c="blue.7">
                        {formatDate(data.yesterdayDate)}
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
                        {data.yesterdayTasks.map((task, index) => (
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
                                    onClick={() => deleteTask(index, false)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Flex>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {data.yesterdayAbsence && (
                          <Table.Tr>
                            <Table.Td colSpan={7} ta="center" py="md">
                              <Group justify="center" gap="xs">
                                <Badge
                                  variant="light"
                                  color={
                                    data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                                      ? 'blue'
                                      : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                                        ? 'green'
                                        : 'red'
                                  }
                                  size="lg"
                                  radius="md"
                                >
                                  Nghỉ{' '}
                                  {data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                                    ? 'theo lịch'
                                    : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                                      ? 'có phép'
                                      : 'không phép'}
                                  : {data.yesterdayAbsence.reason}
                                </Badge>
                                <Tooltip label="Xóa">
                                  <ActionIcon
                                    variant="light"
                                    color={
                                      data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                                        ? 'blue'
                                        : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                                          ? 'green'
                                          : 'red'
                                    }
                                    size="sm"
                                    radius="xl"
                                    onClick={() => deleteAbsence(false)}
                                  >
                                    <IconX size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        )}
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
                        {formatDate(data.todayDate)}
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
                        {data.todayTasks.map((task, index) => (
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
                                    onClick={() => deleteTask(index, true)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Flex>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {data.todayAbsence && (
                          <Table.Tr>
                            <Table.Td colSpan={7} ta="center" py="md">
                              <Group justify="center" gap="xs">
                                <Badge
                                  variant="light"
                                  color={
                                    data.todayAbsence.type === AbsenceType.SCHEDULED
                                      ? 'blue'
                                      : data.todayAbsence.type === AbsenceType.EXCUSED
                                        ? 'green'
                                        : 'red'
                                  }
                                  size="lg"
                                  radius="md"
                                >
                                  Nghỉ{' '}
                                  {data.todayAbsence.type === AbsenceType.SCHEDULED
                                    ? 'theo lịch'
                                    : data.todayAbsence.type === AbsenceType.EXCUSED
                                      ? 'có phép'
                                      : 'không phép'}
                                  : {data.todayAbsence.reason}
                                </Badge>
                                <Tooltip label="Xóa">
                                  <ActionIcon
                                    variant="light"
                                    color={
                                      data.todayAbsence.type === AbsenceType.SCHEDULED
                                        ? 'blue'
                                        : data.todayAbsence.type === AbsenceType.EXCUSED
                                          ? 'green'
                                          : 'red'
                                    }
                                    size="sm"
                                    radius="xl"
                                    onClick={() => deleteAbsence(true)}
                                  >
                                    <IconX size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        )}
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
          workDate={data.date}
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setCurrentTask(null);
          }}
          onSubmit={handleEditSubmit}
          initialValues={currentTask || undefined}
          isEdit={true}
        />
      )}
    </Paper>
  );
}
