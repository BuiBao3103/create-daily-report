import { TextInput, NumberInput, Select, Group, Stack, Button, Paper, Autocomplete } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { TaskFormProps } from '../../../../enum/DailyEnum/TaskForm.types';
import { projects, statuses } from '../../../../enum/DailyEnum/TaskForm.constants';
import { useState } from 'react';

export function TaskForm({ task, index, onChange, onDelete, label }: TaskFormProps) {
  const [touched, setTouched] = useState({
    content: false,
    est_time: false,
    status: false
  });

  const handleChange = (field: keyof typeof task, value: any) => {
    onChange(index, field, value);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group grow>
          <TextInput
            label="Task ID"
            placeholder="Nhập task ID"
            value={task.task_id || ''}
            onChange={(e) => handleChange('task_id', e.target.value)}
          />
          <Autocomplete
            label="Dự án"
            placeholder="Chọn hoặc nhập dự án"
            data={projects}
            value={task.project || ''}
            onChange={(value) => handleChange('project', value)}
            comboboxProps={{ withinPortal: true }}
          />
        </Group>

        <TextInput
          label="Nội dung công việc"
          placeholder="Nhập nội dung công việc"
          value={task.content}
          onChange={(e) => handleChange('content', e.target.value)}
          withAsterisk
          error={touched.content && !task.content && 'Vui lòng nhập nội dung công việc'}
        />

        <Group grow>
          <NumberInput
            label="Thời gian dự kiến (giờ)"
            placeholder="Nhập thời gian dự kiến"
            min={0}
            value={task.est_time}
            onChange={(value) => handleChange('est_time', value)}
            withAsterisk
            error={touched.est_time && !task.est_time && 'Vui lòng nhập thời gian dự kiến'}
          />
          <NumberInput
            label="Thời gian thực tế (giờ)"
            placeholder="Nhập thời gian thực tế"
            min={0}
            value={task.act_time}
            onChange={(value) => handleChange('act_time', value)}
          />
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={statuses}
            value={task.status}
            onChange={(value) => handleChange('status', value)}
            withAsterisk
            error={touched.status && !task.status && 'Vui lòng chọn trạng thái'}
          />
        </Group>

        <Group justify="flex-end">
          <Button
            variant="light"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={() => onDelete(index)}
          >
            Xóa
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
} 