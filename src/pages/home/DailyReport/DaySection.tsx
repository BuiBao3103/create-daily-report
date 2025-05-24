import { IconCalendarOff, IconPlus } from '@tabler/icons-react';
import { Box, Button, Checkbox, Group, Stack } from '@mantine/core';

interface DaySectionProps {
  readonly waitingForTask?: boolean;
  readonly onAddTask: () => void;
  readonly onAddAbsence: () => void;
  readonly onWaitingForTaskChange?: (checked: boolean) => void;
  readonly label: string;
  readonly hasAbsence?: boolean;
}

export function DaySection({
  waitingForTask,
  onAddTask,
  onAddAbsence,
  onWaitingForTaskChange,
  label,
  hasAbsence = false,
}: DaySectionProps) {
  const isToday = label === 'Hôm nay';

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
            {isToday && onWaitingForTaskChange && (
              <Checkbox
                label="Chờ task"
                checked={waitingForTask}
                onChange={(e) => onWaitingForTaskChange(e.currentTarget.checked)}
              />
            )}
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
