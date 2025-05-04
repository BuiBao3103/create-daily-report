import { useState } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { ActionIcon, Group, Paper, Stack, Text, Tooltip, Table, Badge } from '@mantine/core';
import { DailyReportData } from './DailyReportForm.types';
import { AbsenceType } from './DailyReportForm.types';

interface DailyReportOutputProps {
  readonly data?: DailyReportData;
}

export function DailyReportOutput({ data }: DailyReportOutputProps) {
  const [copied, setCopied] = useState(false);

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

  const generateReport = (data: DailyReportData) => {
    const yesterdayTasksText = data.yesterdayTasks
      .map((task) => {
        const taskId = task.task_id ? `[${task.task_id}]` : '';
        const project = task.project ? `[${task.project}]` : '';
        const content = task.content;
        const estimatedTime = task.est_time ? `${task.est_time}h` : '';
        const actualTime = task.act_time ? `, thực tế: ${task.act_time}h` : '';
        const status = task.status ? ` (${task.status})` : '';

        return `   + ${taskId}${project} ${content} - dự kiến: ${estimatedTime}${actualTime}${status}`;
      })
      .join('\n');

    const todayTasksText = data.todayTasks
      .map((task) => {
        const taskId = task.task_id ? `[${task.task_id}]` : '';
        const project = task.project ? `[${task.project}]` : '';
        const content = task.content;
        const estimatedTime = task.est_time ? `${task.est_time}h` : '';
        const status = task.status ? ` (${task.status})` : '';

        return `   + ${taskId}${project} ${content} - dự kiến: ${estimatedTime}${status}`;
      })
      .join('\n');

    const waitingForTaskText = data.waitingForTask ? '\n   + Chờ task' : '';

    const yesterdayAbsenceText = data.yesterdayAbsence 
      ? `\n   + Nghỉ ${data.yesterdayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : 
                    data.yesterdayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: ${data.yesterdayAbsence.reason}`
      : '';

    const todayAbsenceText = data.todayAbsence 
      ? `\n   + Nghỉ ${data.todayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : 
                    data.todayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: ${data.todayAbsence.reason}`
      : '';

    return `${data.intern_name}${data.is_intern ? ' (Thực tập sinh)' : ''}
Daily (${data.date})

# ${data.yesterdayLabel}
${yesterdayTasksText || '   + Không có'}${yesterdayAbsenceText}

# ${data.todayLabel}
${todayTasksText || '   + Không có'}${todayAbsenceText}${waitingForTaskText}`;
  };

  const handleCopy = async () => {
    if (!data) {
      alert('Vui lòng tạo báo cáo trước khi sao chép!');
      return;
    }
    const report = generateReport(data);
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép: ', err);
      alert('Không thể sao chép báo cáo. Vui lòng thử lại sau.');
    }
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text size="lg" fw={500}>
          Báo Cáo Của Bạn
        </Text>
        {data && (
          <Tooltip label={copied ? 'Đã sao chép!' : 'Sao chép báo cáo'}>
            <ActionIcon variant="light" onClick={handleCopy}>
              <IconCopy size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Paper p="md" withBorder>
        {data ? (
          <Stack>
            <Text size="sm" fw={500}>
              Ngày: {formatDate(data.date)}
            </Text>
            <Text size="sm" fw={500}>
              Người thực hiện: {data.intern_name}{data.is_intern ? ' (Thực tập sinh)' : ''}
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
                    <Table.Td colSpan={6} ta="center">Không có</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
            {data.yesterdayAbsence && (
              <Badge 
                variant="light" 
                color={data.yesterdayAbsence.type === AbsenceType.SCHEDULED ? 'blue' : 
                       data.yesterdayAbsence.type === AbsenceType.EXCUSED ? 'green' : 'red'}
                mt="xs"
              >
                Nghỉ {data.yesterdayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : 
                      data.yesterdayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: {data.yesterdayAbsence.reason}
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
                    <Table.Td colSpan={6} ta="center">Không có</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
            {data.todayAbsence && (
              <Badge 
                variant="light" 
                color={data.todayAbsence.type === AbsenceType.SCHEDULED ? 'blue' : 
                       data.todayAbsence.type === AbsenceType.EXCUSED ? 'green' : 'red'}
                mt="xs"
              >
                Nghỉ {data.todayAbsence.type === AbsenceType.SCHEDULED ? 'theo lịch' : 
                      data.todayAbsence.type === AbsenceType.EXCUSED ? 'có phép' : 'không phép'}: {data.todayAbsence.reason}
              </Badge>
            )}
            {data.waitingForTask && (
              <Text size="sm" mt="xs" c="dimmed">
                ⏳ Chờ task
              </Text>
            )}
          </Stack>
        ) : (
          <Text size="sm">
            Báo cáo sẽ hiển thị ở đây sau khi bạn nhập thông tin và nhấn "Tạo báo cáo".
        </Text>
        )}
      </Paper>
    </Stack>
  );
}
