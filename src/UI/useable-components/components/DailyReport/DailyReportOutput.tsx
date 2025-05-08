import { useState } from 'react';
import { IconCopy, IconFileText, IconPrinter, IconTable, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Flex, Group, Paper, Stack, Table, Text, Tooltip, SegmentedControl } from '@mantine/core';
import { AbsenceType, DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';

interface DailyReportOutputProps {
  readonly data?: DailyReportData;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTextOutput = (data: DailyReportData) => {
  let output = `Ngày: ${formatDate(data.date)}\n`;
  output += `Người thực hiện: ${data.intern_name}${data.is_intern ? ' (Thực tập sinh)' : ''}\n\n`;
  
  output += `${data.yesterdayLabel}\n`;
  if (data.yesterdayAbsence) {
    output += `Nghỉ: ${data.yesterdayAbsence.reason}\n`;
  } else {
    data.yesterdayTasks.forEach((task, index) => {
      output += `${index + 1}. ${task.content}\n`;
      if (task.task_id) output += `   Task ID: ${task.task_id}\n`;
      if (task.project) output += `   Dự án: ${task.project}\n`;
      if (task.est_time) output += `   Thời gian dự kiến: ${task.est_time} giờ\n`;
      if (task.act_time) output += `   Thời gian thực tế: ${task.act_time} giờ\n`;
      if (task.status) output += `   Trạng thái: ${task.status}\n`;
      output += '\n';
    });
  }

  output += `\n${data.todayLabel}\n`;
  if (data.todayAbsence) {
    output += `Nghỉ: ${data.todayAbsence.reason}\n`;
  } else {
    data.todayTasks.forEach((task, index) => {
      output += `${index + 1}. ${task.content}\n`;
      if (task.task_id) output += `   Task ID: ${task.task_id}\n`;
      if (task.project) output += `   Dự án: ${task.project}\n`;
      if (task.est_time) output += `   Thời gian dự kiến: ${task.est_time} giờ\n`;
      if (task.act_time) output += `   Thời gian thực tế: ${task.act_time} giờ\n`;
      if (task.status) output += `   Trạng thái: ${task.status}\n`;
      output += '\n';
    });
  }

  if (data.waitingForTask) {
    output += '\nChờ task\n';
  }

  return output;
};

const ReportContent = ({ data, isTableView }: { data: DailyReportData | undefined; isTableView: boolean }) => {
  if (!data) return null;

  if (isTableView) {
    return (
      <Stack>
        <Text size="sm" fw={500}>
          {data.yesterdayLabel} - {data.todayLabel}
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ngày làm việc</Table.Th>
              <Table.Th>Task ID</Table.Th>
              <Table.Th>Dự án</Table.Th>
              <Table.Th>Nội dung</Table.Th>
              <Table.Th>Thời gian dự kiến</Table.Th>
              <Table.Th>Thời gian thực tế</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.yesterdayTasks.length > 0 ? (
              data.yesterdayTasks.map((task, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{formatDate(data.yesterdayLabel)}</Table.Td>
                  <Table.Td>{task.task_id}</Table.Td>
                  <Table.Td>{task.project}</Table.Td>
                  <Table.Td>{task.content}</Table.Td>
                  <Table.Td>{task.est_time}h</Table.Td>
                  <Table.Td>{task.act_time}h</Table.Td>
                  <Table.Td>{task.status}</Table.Td>
                  <Table.Td>
                    <Flex gap="xs">
                      <Tooltip label="Sửa">
                        <ActionIcon variant="light" size="sm">
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Xóa">
                        <ActionIcon variant="light" color="red" size="sm">
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8} ta="center">
                  {data.yesterdayAbsence ? (
                    <Badge
                      variant="light"
                      color={
                        data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                          ? 'blue'
                          : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                            ? 'green'
                            : 'red'
                      }
                    >
                      Nghỉ{' '}
                      {data.yesterdayAbsence.type === AbsenceType.SCHEDULED
                        ? 'theo lịch'
                        : data.yesterdayAbsence.type === AbsenceType.EXCUSED
                          ? 'có phép'
                          : 'không phép'}
                      : {data.yesterdayAbsence.reason}
                    </Badge>
                  ) : (
                    'Không có công việc'
                  )}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ngày làm việc</Table.Th>
              <Table.Th>Task ID</Table.Th>
              <Table.Th>Dự án</Table.Th>
              <Table.Th>Nội dung</Table.Th>
              <Table.Th>Thời gian dự kiến</Table.Th>
              <Table.Th>Thời gian thực tế</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.todayTasks.length > 0 ? (
              data.todayTasks.map((task, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{formatDate(data.todayLabel)}</Table.Td>
                  <Table.Td>{task.task_id}</Table.Td>
                  <Table.Td>{task.project}</Table.Td>
                  <Table.Td>{task.content}</Table.Td>
                  <Table.Td>{task.est_time}h</Table.Td>
                  <Table.Td>{task.act_time}h</Table.Td>
                  <Table.Td>{task.status}</Table.Td>
                  <Table.Td>
                    <Flex gap="xs">
                      <Tooltip label="Sửa">
                        <ActionIcon variant="light" size="sm">
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Xóa">
                        <ActionIcon variant="light" color="red" size="sm">
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8} ta="center">
                  {data.todayAbsence ? (
                    <Badge
                      variant="light"
                      color={
                        data.todayAbsence.type === AbsenceType.SCHEDULED
                          ? 'blue'
                          : data.todayAbsence.type === AbsenceType.EXCUSED
                            ? 'green'
                            : 'red'
                      }
                    >
                      Nghỉ{' '}
                      {data.todayAbsence.type === AbsenceType.SCHEDULED
                        ? 'theo lịch'
                        : data.todayAbsence.type === AbsenceType.EXCUSED
                          ? 'có phép'
                          : 'không phép'}
                      : {data.todayAbsence.reason}
                    </Badge>
                  ) : (
                    'Không có công việc'
                  )}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        {data.waitingForTask && (
          <Text size="sm" mt="xs" c="dimmed">
            ⏳ Chờ task
          </Text>
        )}
      </Stack>
    );
  }

  return (
    <Stack>
      <Text size="sm" fw={500}>
        {data.yesterdayLabel} - {data.todayLabel}
      </Text>
      <Text style={{ whiteSpace: 'pre-line' }}>{formatTextOutput(data)}</Text>
    </Stack>
  );
};

export function DailyReportOutput({ data }: DailyReportOutputProps) {
  const [isTableView, setIsTableView] = useState(true);
  const [copied, setCopied] = useState(false);

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

  return (
    <Paper p="md" withBorder>
      <Stack>
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Báo cáo công việc
          </Text>
          <Group>
            <SegmentedControl
              value={isTableView ? 'table' : 'text'}
              onChange={(value) => setIsTableView(value === 'table')}
              data={[
                { label: 'Bảng', value: 'table' },
                { label: 'Văn bản', value: 'text' },
              ]}
            />
            {data && (
              <Tooltip label={copied ? 'Đã sao chép!' : 'Sao chép báo cáo'}>
                <ActionIcon variant="light" onClick={handleCopy}>
                  <IconCopy size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
        <ReportContent data={data} isTableView={isTableView} />
      </Stack>
    </Paper>
  );
}
