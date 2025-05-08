import { useEffect, useState } from 'react';
import { IconCopy, IconFileText, IconPrinter, IconRefresh, IconTable } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { checkDailyReportStatus, insertToGoogleSheet } from '../../api/googleSheets';
import { AbsenceType, DailyReportData } from './DailyReportForm.types';

interface DailyReportOutputProps {
  readonly data?: DailyReportData;
}

export function DailyReportOutput({ data }: DailyReportOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const checkStatus = async () => {
    if (!data?.intern_name || !data?.date) return;
    
    setIsChecking(true);
    try {
      const status = await checkDailyReportStatus(data.intern_name, data.date);
      setHasReported(status);
    } catch (error) {
      console.error('Error checking daily report status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTextOutput = () => {
    if (!data) return '';

    let output = '';

    // Header
    output += `${data.intern_name}${data.is_intern ? ' (Thực tập sinh)' : ''}\n`;
    output += `Daily (${formatDate(data.date)})\n\n`;

    // Yesterday section
    output += `# ${data.yesterdayLabel}\n`;

    if (data.yesterdayAbsence) {
      const typeMap: { [key: string]: string } = {
        SCHEDULED: 'theo lịch',
        EXCUSED: 'có phép',
        UNEXCUSED: 'không phép',
      };

      const { type, reason } = data.yesterdayAbsence;

      output += `   + Nghỉ ${typeMap[type]}: ${reason}\n`;
    }
    if (data.yesterdayTasks.length > 0) {
      data.yesterdayTasks.forEach((task) => {
        const taskId = task.task_id ? `[${task.task_id}] - ` : '';
        const project = task.project ? `(${task.project}) - ` : '';
        output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h${task.act_time ? ', thực tế: ' + task.act_time + 'h' : ' '} - ${task.status}\n`;
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

      output += `   + Nghỉ ${typeMap[type]}: ${reason}\n`;
    }
    if (data.todayTasks.length > 0) {
      data.todayTasks.forEach((task) => {
        const taskId = task.task_id ? `[${task.task_id}]` : '';
        const project = task.project ? `(${task.project}) - ` : '';
        output += `   + ${taskId}${project} ${task.content} - dự kiến: ${task.est_time}h ${task.act_time ? ', thực tế: ' + task.act_time + 'h' : ' '} - ${task.status}\n`;
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

  const handleSync = async () => {
    if (!data) return;

    // Check status first if not checked yet
    if (!hasReported) {
      await checkStatus();
    }

    setIsSyncing(true);
    try {
      const success = await insertToGoogleSheet(data);
      if (success) {
        setHasReported(true);
      }
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
    } finally {
      setIsSyncing(false);
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

      {data?.is_intern && (
        <Paper p="md" withBorder mt="md" pos="relative">
          <LoadingOverlay visible={isSyncing || isChecking} />
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                Trạng thái đồng bộ:
              </Text>
              <Badge color={hasReported ? "green" : "gray"}>
                {hasReported ? "Đã đồng bộ hôm nay" : "Chưa đồng bộ hôm nay"}
              </Badge>
            </Group>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={handleSync}
              loading={isSyncing || isChecking}
            >
              Đồng bộ Google Sheet
            </Button>
          </Group>
          <Text size="sm" c="dimmed" mt="xs">
            Ngày: {formatDate(data.date)}
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
