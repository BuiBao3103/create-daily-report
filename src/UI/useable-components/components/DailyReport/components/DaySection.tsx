import { IconCalendarOff, IconPlus, IconX } from '@tabler/icons-react';
import { ActionIcon, Badge, Box, Button, Checkbox, Group, Stack } from '@mantine/core';
import { Absence, AbsenceType } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';

interface DaySectionProps {
  date: Date;
  tasks: Task[];
  absence?: Absence;
  waitingForTask?: boolean;
  onAddTask: () => void;
  onAddAbsence: () => void;
  onRemoveAbsence: () => void;
  onWaitingForTaskChange?: (checked: boolean) => void;
  label: string;
}

export function DaySection({
  date,
  tasks,
  absence,
  waitingForTask,
  onAddTask,
  onAddAbsence,
  onRemoveAbsence,
  onWaitingForTaskChange,
  label,
}: DaySectionProps) {
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
            >
              Nghỉ
            </Button>
          </Group>
          <Group>
            {absence && (
              <Group gap="xs">
                <Badge
                  variant="light"
                  color={
                    absence.type === AbsenceType.SCHEDULED
                      ? 'blue'
                      : absence.type === AbsenceType.EXCUSED
                        ? 'green'
                        : 'red'
                  }
                >
                  Nghỉ{' '}
                  {absence.type === AbsenceType.SCHEDULED
                    ? 'theo lịch'
                    : absence.type === AbsenceType.EXCUSED
                      ? 'có phép'
                      : 'không phép'}
                  : {absence.reason}
                </Badge>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={onRemoveAbsence}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            )}
            {onWaitingForTaskChange && (
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
