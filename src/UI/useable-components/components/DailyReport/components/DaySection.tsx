import { IconCalendarOff, IconPlus } from '@tabler/icons-react';
import { Box, Button, Checkbox, Group, Stack } from '@mantine/core';
import { useDailyReport } from '../context/DailyReportContext';

interface DaySectionProps {
  readonly label: string;
  readonly hasAbsence?: boolean;
  readonly onAddTask?: () => void;
  readonly onAddAbsence?: () => void;
}

export function DaySection({
  label,
  hasAbsence,
  onAddTask,
  onAddAbsence,
}: DaySectionProps) {
  const isToday = label === 'Hôm nay';
  const { form, setWaitingForTask } = useDailyReport();

  return (
    <Box>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={onAddTask}
            >
              Thêm task
            </Button>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconCalendarOff size={14} />}
              onClick={onAddAbsence}
              disabled={hasAbsence}
            >
              Nghỉ
            </Button>
          </Group>
          <Group>
            {isToday && (
              <Checkbox
                label="Chờ task"
                checked={form.values.waitingForTask}
                onChange={(e) => setWaitingForTask(e.currentTarget.checked)}
              />
            )}
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
