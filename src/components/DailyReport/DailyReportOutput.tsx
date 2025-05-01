import { useState } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { ActionIcon, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { DailyReportData } from './DailyReportForm';

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

  const formatTasks = (tasks: { description: string; hours: string }[]) => {
    if (tasks.length === 0) return '    + Không có';
    return tasks
      .map((task) => {
        if (!task.description) return null;
        return `    + ${task.description}${task.hours ? ' ' + task.hours + 'h' : ''}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const generateReport = () => {
    if (!data) return '';

    return `${data.name || '[Chưa nhập tên]'}
Daily (${formatDate(data.date)})
# ${data.yesterdayLabel}
${formatTasks(data.yesterdayTasks)}
# ${data.todayLabel}
${formatTasks(data.todayTasks)}
`;
  };

  const handleCopy = async () => {
    const report = generateReport();
    if (report.includes('Báo cáo sẽ hiển thị ở đây')) {
      alert('Vui lòng tạo báo cáo trước khi sao chép!');
      return;
    }

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
        <Text
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: '"Consolas", "Courier New", monospace',
            lineHeight: 1.5,
          }}
          size="sm"
        >
          {data
            ? generateReport()
            : 'Báo cáo sẽ hiển thị ở đây sau khi bạn nhập thông tin và nhấn "Tạo báo cáo".'}
        </Text>
      </Paper>
    </Stack>
  );
}
