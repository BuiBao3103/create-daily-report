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
import { projects, statuses } from '@/constants/TaskForm.constants';
import { Task } from '@/types/TaskForm.types';
import { useEffect } from 'react';
import { useDailyReport } from '@/context/DailyReportContext';
import baseAxios from '@/api/baseAxios';

interface TaskModalProps {
  readonly workDate: Date;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (task: Task) => void;
  readonly initialValues?: Task;
  readonly isEdit?: boolean;
}

export function TaskModal({ workDate, opened, onClose, onSubmit, initialValues, isEdit = false }: TaskModalProps) {
  const { form, updateOutput } = useDailyReport();
  const formTask = useForm<Task>({
    initialValues: initialValues || {
      date: workDate,
      content: '',
      task_id: '',
      project: '',
      est_time: undefined,
      act_time: undefined,
      status: 'To Do',
      intern: form.getValues().internID ?? null
    },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập nội dung công việc'),
      est_time: (value) => (value && value > 0 ? null : 'Vui lòng nhập thời gian dự kiến'),
      status: (value) => (value ? null : 'Vui lòng chọn trạng thái'),
    },
  });

  useEffect(() => {
    formTask.setValues({ ...formTask.values, intern: form.getValues().internID ?? null });
  }, [opened]);

  const handleSubmit = async () => {
  const validationResult = formTask.validate();
  if (validationResult.hasErrors) {
    return;
  }

  // Chuyển ngày về định dạng chuỗi 'YYYY-MM-DD'
  const formattedDate = workDate.toISOString().split('T')[0];

  const valuesToSubmit = {
    ...formTask.values,
    date: formattedDate,
  };

  console.log(valuesToSubmit);
  await baseAxios.post('/api/tasks/', valuesToSubmit);

  onSubmit(formTask.values);
  formTask.reset();
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
    </Modal>
  );
}
