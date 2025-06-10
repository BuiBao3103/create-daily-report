import { Group, Paper, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Task } from '@/interfaces/task.types';

interface TaskInfoProps {
  task: Task;
}

export function TaskInfo({ task }: TaskInfoProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mb="sm"
      style={{
        background: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
      }}
    >
      <Text size="sm" fw={600} mb={4}>
        Thông tin task hôm qua
      </Text>
      <Group gap={8}>
        <Text size="sm">
          ID: <b>{task.backlog_id ?? '-'}</b>
        </Text>
        <Text size="sm">
          | Nội dung: <b>{task.content}</b>
        </Text>
        <Text size="sm">
          | Dự kiến: <b>{task.estimate_time ?? '-'}</b> giờ
        </Text>
        <Text size="sm">
          | Trạng thái: <b>{task.status}</b>
        </Text>
      </Group>
    </Paper>
  );
} 