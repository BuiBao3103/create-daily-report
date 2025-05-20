import { useEffect } from 'react';
import { Autocomplete, Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import baseAxios from '@/api/baseAxios';
import { projects, statuses } from '@/constants/TaskForm.constants';
import { useDailyReport } from '@/context/DailyReportContext';
import { Task } from '@/interfaces/task.types';
import { addOrCreateTask } from '@/hooks/use_tasks';
import { QueryClient } from '@tanstack/react-query';

interface TaskModalProps {
  readonly workDate: string;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly initialValues?: Omit<Task, 'date'>;
  readonly isEdit?: boolean;
}

export function TaskModal({
  workDate,
  opened,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}: TaskModalProps) {
  const { intern } = useDailyReport();
  const mutation = addOrCreateTask({
  options: {
    onSuccess: () => {
      onSubmit();
    }
  }
});
  const formTask = useForm<Omit<Task, 'date'>>({
    initialValues: initialValues || {
      content: '',
      task_id: '',
      project: '',
      est_time: undefined,
      act_time: undefined,
      status: 'To Do',
      intern: null,
    },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập nội dung công việc'),
      est_time: (value) => (value && value > 0 ? null : 'Vui lòng nhập thời gian dự kiến'),
      status: (value) => (value ? null : 'Vui lòng chọn trạng thái'),
    },
  });

  const handleSubmit = async () => {
    const validationResult = formTask.validate();
    if (validationResult.hasErrors) {
      return;
    }

    await baseAxios.post('/api/tasks/', { ...formTask.values, intern, date: workDate });

    onSubmit();
    formTask.reset();
    onClose();
  };

  return (
    <Modal
      size={'lg'}
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa task' : 'Thêm task mới'}
      centered
    >
      <form onSubmit={formTask.onSubmit(values => {
        mutation.mutate([values]);
      })}>
      <Stack gap="xs">
        <Group grow>
          <TextInput
            label="Task ID"
            placeholder="Nhập task ID"
            {...formTask.getInputProps('task_id')}
          />
          <Autocomplete
            label="Dự án"
            placeholder="Chọn hoặc nhập dự án"
            data={projects}
            comboboxProps={{ withinPortal: true }}
            {...formTask.getInputProps('project')}
          />
        </Group>

        <TextInput
          label="Nội dung công việc"
          placeholder="Nhập nội dung công việc"
          withAsterisk
          {...formTask.getInputProps('content')}
        />

        <Group grow>
          <NumberInput
            label="Thời gian dự kiến (giờ)"
            placeholder="Nhập thời gian dự kiến"
            min={0}
            withAsterisk
            {...formTask.getInputProps('est_time')}
          />
          <NumberInput
            label="Thời gian thực tế (giờ)"
            placeholder="Nhập thời gian thực tế"
            min={0}
            {...formTask.getInputProps('act_time')}
          />
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={statuses}
            withAsterisk
            allowDeselect={false}
            {...formTask.getInputProps('status')}
          />
        </Group>
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="light" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!formTask.isValid()}>
          {isEdit ? 'Cập nhật' : 'Thêm'}
        </Button>
      </Group>
      </form>
    </Modal>
  );
}
