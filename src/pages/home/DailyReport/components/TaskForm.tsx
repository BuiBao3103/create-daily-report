import { Autocomplete, Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { projects, statuses } from '@/constants/TaskForm.constants';
import { Task } from '@/interfaces/task.types';

interface TaskFormProps {
  initialValues?: Omit<Task, 'date'>;
  isEdit?: boolean;
  onSubmit: (values: Omit<Task, 'date'>) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function TaskForm({ initialValues, isEdit = false, onSubmit, onCancel, isPending }: TaskFormProps) {
  const form = useForm<Omit<Task, 'date'>>({
    initialValues: {
      content: '',
      backlog_id: '',
      project: '',
      estimate_time: undefined,
      actual_time: undefined,
      status: 'To Do',
      intern: null,
      ...initialValues,
    },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập nội dung công việc'),
      estimate_time: (value) => (value && value > 0 ? null : 'Vui lòng nhập thời gian dự kiến'),
      status: (value) => (value ? null : 'Vui lòng chọn trạng thái'),
      actual_time: (value, values) => {
        if (values.status === 'Done') {
          return value && value > 0
            ? null
            : 'Vui lòng nhập thời gian thực tế khi trạng thái là Done';
        }
        return null;
      },
    },
    transformValues: (values) => ({
      ...values,
      actual_time: values.status === 'Done' ? values.actual_time : undefined,
      estimate_time: values.estimate_time ?? undefined,
    }),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="xs">
        <Group grow>
          <TextInput
            label="Task ID"
            placeholder="Nhập task ID"
            {...form.getInputProps('backlog_id')}
          />
          <Autocomplete
            label="Dự án"
            placeholder="Chọn hoặc nhập dự án"
            data={projects}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('project')}
          />
        </Group>

        <TextInput
          label="Nội dung công việc"
          placeholder="Nhập nội dung công việc"
          withAsterisk
          {...form.getInputProps('content')}
        />

        <Group grow>
          <NumberInput
            label="Thời gian dự kiến (giờ)"
            placeholder="Nhập thời gian dự kiến"
            min={0}
            withAsterisk
            {...form.getInputProps('estimate_time')}
          />
          <NumberInput
            label="Thời gian thực tế (giờ)"
            placeholder="Nhập thời gian thực tế"
            min={0}
            {...form.getInputProps('actual_time')}
            withAsterisk={form.values.status === 'Done'}
            disabled={form.values.status === 'To Do'}
          />
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={statuses}
            withAsterisk
            allowDeselect={false}
            {...form.getInputProps('status')}
          />
        </Group>
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="light" leftSection={<IconX size={16} />} onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          leftSection={isEdit ? <IconCheck size={16} /> : <IconPlus size={16} />}
          disabled={!form.isValid() || isPending}
        >
          {isEdit ? 'Cập nhật' : 'Thêm'}
        </Button>
      </Group>
    </form>
  );
} 