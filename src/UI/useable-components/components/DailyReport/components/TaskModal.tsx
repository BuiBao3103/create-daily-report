import {
  Autocomplete,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { projects, statuses } from '@/Utils/constants/TaskForm.constants';
import { Task } from '@/Utils/enums/DailyEnum/TaskForm.types';
import { useEffect } from 'react';

interface TaskModalProps {
  readonly workDate: Date;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (task: Task) => void;
  readonly initialValues?: Task;
  readonly isEdit?: boolean;
}

export function TaskModal({ workDate, opened, onClose, onSubmit, initialValues, isEdit = false }: TaskModalProps) {
  const form = useForm<Task>({
    initialValues: initialValues || {
      workDate: workDate,
      content: '',
      task_id: '',
      project: '',
      est_time: undefined,
      act_time: undefined,
      status: 'To Do',
    },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập nội dung công việc'),
      est_time: (value) => (value && value > 0 ? null : 'Vui lòng nhập thời gian dự kiến'),
      status: (value) => (value ? null : 'Vui lòng chọn trạng thái'),
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.setValues(initialValues);
    }
  }, [initialValues, opened]);

  const handleSubmit = () => {
    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      return;
    }
    onSubmit(form.values);
    form.reset();
    onClose();
  };

  return (
    <Modal 
      size={'lg'} 
      opened={opened} 
      onClose={onClose} 
      title={isEdit ? "Chỉnh sửa task" : "Thêm task mới"} 
      centered
    >
      <Stack gap="xs">
        <Group grow>
          <TextInput
            label="Task ID"
            placeholder="Nhập task ID"
            {...form.getInputProps('task_id')}
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
            {...form.getInputProps('est_time')}
          />
          <NumberInput
            label="Thời gian thực tế (giờ)"
            placeholder="Nhập thời gian thực tế"
            min={0}
            {...form.getInputProps('act_time')}
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
        <Button variant="light" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!form.isValid()}>
          {isEdit ? 'Cập nhật' : 'Thêm'}
        </Button>
      </Group>
    </Modal>
  );
}
