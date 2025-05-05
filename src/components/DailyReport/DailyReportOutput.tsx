import { useState } from 'react';
import { IconCopy, IconFileText, IconPrinter, IconTable } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { AbsenceType, DailyReportData } from './DailyReportForm.types';

interface DailyReportOutputProps {
  readonly data?: DailyReportData;
}

export function DailyReportOutput({ data }: DailyReportOutputProps) {
  console.log('data', data);
  const [copied, setCopied] = useState(false);
  const [isTableView, setIsTableView] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTasks = (tasks: DailyReportData['yesterdayTasks']) => {
    if (tasks.length === 0) return '    + Không có';
    return tasks
      .map((task) => {
        if (!task.content) return null;
        const taskId = task.task_id ? `${task.task_id} - ` : '';
        const project = task.project ? `(${task.project})` : '';
        const actTime = task.act_time ? `, thực tế: ${task.act_time}h` : '';
        return `    + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h${actTime} - ${task.status}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const formatAbsence = (absence: { type: string; reason: string } | undefined) => {
    if (!absence) return '';
    const typeMap: { [key: string]: string } = {
      SCHEDULED: 'theo lịch',
      EXCUSED: 'có phép',
      UNEXCUSED: 'không phép',
    };
    return `\n   + Nghỉ ${typeMap[absence.type]}: ${absence.reason}`;
  };

  const formatTextOutput = () => {
    if (!data) return '';

    let output = '';

    // Header
    output += `${data.intern_name}${data.is_intern ? ' (Thực tập sinh)' : ''}\n`;
    output += `Daily (${formatDate(data.date)})\n\n`;

    // Yesterday section
    output += `# ${data.yesterdayLabel}\n`;
    const isPartialOff = (reason: string) => {
      return /off\s*(sáng|chiều)/i.test(reason);
    };
    if (data.yesterdayAbsence) {
      const typeMap: { [key: string]: string } = {
        SCHEDULED: 'theo lịch',
        EXCUSED: 'có phép',
        UNEXCUSED: 'không phép',
      };

      const { type, reason } = data.yesterdayAbsence;
      const isPartial = isPartialOff(reason);

      output += `   + Nghỉ ${typeMap[type]}: ${reason}\n`;

      if (isPartial && data.yesterdayTasks.length > 0) {
        data.yesterdayTasks.forEach((task) => {
          const taskId = task.task_id ? `${task.task_id} - ` : '';
          const project = task.project ? `(${task.project})` : '';
          output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h, ${task.act_time ? "thực tế: " + task.act_time + "h" : ""} - ${task.status} - \n`;
        });
      }
    } else if (data.yesterdayTasks.length > 0) {
      data.yesterdayTasks.forEach((task) => {
        const taskId = task.task_id ? `${task.task_id} - ` : '';
        const project = task.project ? `(${task.project})` : '';
        output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h, ${task.act_time ? "thực tế: " + task.act_time + "h" : ""} - ${task.status}\n`;
      });
    }

    // Today section
    output += `\n# ${data.todayLabel}\n`;
    if (data.todayAbsence) {
      const typeMap: { [key: string]: string } = {
        SCHEDULED: 'theo lịch',
        EXCUSED: 'có phép',
        UNEXCUSED: 'không phép',
      };

      const { type, reason } = data.todayAbsence;
      const isPartial = isPartialOff(reason);

      output += `   + Nghỉ ${typeMap[type]}: ${reason}\n`;

      if (isPartial && data.todayTasks.length > 0) {
        data.todayTasks.forEach((task) => {
          const taskId = task.task_id ? `${task.task_id} - ` : '';
          const project = task.project ? `(${task.project})` : '';
          output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h, ${task.act_time ? "thực tế: " + task.act_time + "h" : ""} - ${task.status} \n`;
        });
      }
    } else if (data.todayTasks.length > 0) {
      data.todayTasks.forEach((task) => {
        const taskId = task.task_id ? `${task.task_id} - ` : '';
        const project = task.project ? `(${task.project})` : '';
        output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h, ${task.act_time ? "thực tế: " + task.act_time + "h" : ""} - ${task.status}\n`;
      });
    }

    // Waiting for task
    if (data.waitingForTask) {
      output += '   + Chờ task';
    }

    return output;
  };

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(formatTextOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép: ', err);
    }
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text size="lg" fw={500}>
          Báo Cáo Của Bạn
        </Text>
        {data && (
          <Group>
            <Tooltip label={isTableView ? 'Chuyển sang dạng text' : 'Chuyển sang dạng bảng'}>
              <ActionIcon variant="light" onClick={() => setIsTableView(!isTableView)}>
                {isTableView ? <IconFileText size={18} /> : <IconTable size={18} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label={copied ? 'Đã sao chép!' : 'Sao chép báo cáo'}>
              <ActionIcon variant="light" onClick={handleCopy}>
                <IconCopy size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>

      <Paper p="md" withBorder>
        {data ? (
          isTableView ? (
            <Stack>
              <Text size="sm" fw={500}>
                Ngày: {formatDate(data.date)}
              </Text>
              <Text size="sm" fw={500}>
                Người thực hiện: {data.intern_name}
                {data.is_intern ? ' (Thực tập sinh)' : ''}
              </Text>

              <Text size="sm" fw={500} mt="md">
                {data.yesterdayLabel}
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Task ID</Table.Th>
                    <Table.Th>Dự án</Table.Th>
                    <Table.Th>Nội dung</Table.Th>
                    <Table.Th>Thời gian dự kiến</Table.Th>
                    <Table.Th>Thời gian thực tế</Table.Th>
                    <Table.Th>Trạng thái</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.yesterdayTasks.length > 0 ? (
                    data.yesterdayTasks.map((task, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{task.task_id || '-'}</Table.Td>
                        <Table.Td>{task.project || '-'}</Table.Td>
                        <Table.Td>{task.content}</Table.Td>
                        <Table.Td>{task.est_time}h</Table.Td>
                        <Table.Td>{task.act_time ? `${task.act_time}h` : '-'}</Table.Td>
                        <Table.Td>{task.status}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={6} ta="center">
                        Không có
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
              {data.yesterdayAbsence && (
                <Badge
                  variant="light"
                  color={
                    data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                      ? 'blue'
                      : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                        ? 'green'
                        : 'red'
                  }
                  mt="xs"
                >
                  Nghỉ{' '}
                  {data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                    ? 'theo lịch'
                    : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                      ? 'có phép'
                      : 'không phép'}
                  : {data.yesterdayAbsence.reason}
                </Badge>
              )}

              <Text size="sm" fw={500} mt="md">
                {data.todayLabel}
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Task ID</Table.Th>
                    <Table.Th>Dự án</Table.Th>
                    <Table.Th>Nội dung</Table.Th>
                    <Table.Th>Thời gian dự kiến</Table.Th>
                    <Table.Th>Thời gian thực tế</Table.Th>
                    <Table.Th>Trạng thái</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.todayTasks.length > 0 ? (
                    data.todayTasks.map((task, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{task.task_id || '-'}</Table.Td>
                        <Table.Td>{task.project || '-'}</Table.Td>
                        <Table.Td>{task.content}</Table.Td>
                        <Table.Td>{task.est_time}h</Table.Td>
                        <Table.Td>{task.act_time ? `${task.act_time}h` : '-'}</Table.Td>
                        <Table.Td>{task.status}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={6} ta="center">
                        Không có
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
              {data.todayAbsence && (
                <Badge
                  variant="light"
                  color={
                    data.todayAbsence.type === AbsenceType.SCHEDULED
                      ? 'blue'
                      : data.todayAbsence.type === AbsenceType.EXCUSED
                        ? 'green'
                        : 'red'
                  }
                  mt="xs"
                >
                  Nghỉ{' '}
                  {data.todayAbsence.type === AbsenceType.SCHEDULED
                    ? 'theo lịch'
                    : data.todayAbsence.type === AbsenceType.EXCUSED
                      ? 'có phép'
                      : 'không phép'}
                  : {data.todayAbsence.reason}
                </Badge>
              )}
              {data.waitingForTask && (
                <Text size="sm" mt="xs" c="dimmed">
                  ⏳ Chờ task
                </Text>
              )}
            </Stack>
          ) : (
            <Text style={{ whiteSpace: 'pre-line' }}>{formatTextOutput()}</Text>
          )
        ) : (
          <Stack>
            <Text style={{ whiteSpace: 'pre-line', fontWeight: 'bold' }}>
              📄 Báo cáo của bạn sẽ được hiển thị tại đây ngay sau khi được tạo.
            </Text>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
