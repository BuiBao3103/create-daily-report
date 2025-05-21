import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { useDailyReport } from '@/context/DailyReportContext';
import { useTaskMutations } from '@/hooks/use_tasks';
import { Task } from '@/interfaces/task.types';

interface TaskModalProps {
  readonly workDate: string;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly initialValues?: Omit<Task, 'date'>;
  readonly isEdit?: boolean;
  readonly isToday?: boolean;
}

export function TaskModal({
  workDate,
  opened,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
  isToday = true,
}: TaskModalProps) {
  const { intern, addTask: addTaskToContext, updateTask: updateTaskInContext } = useDailyReport();
  const queryClient = useQueryClient();
  const { addTask, updateTask } = useTaskMutations();

  const formTask = useForm<Omit<Task, 'date'>>({
    initialValues: {
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
      act_time: (value, values) => {
        if (values.status === 'Done') {
          return value && value > 0 ? null : 'Vui lòng nhập thời gian thực tế khi trạng thái là Done';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (opened && initialValues) {
      formTask.setValues({
        content: initialValues.content ?? '',
        task_id: initialValues.task_id ?? '',
        project: initialValues.project ?? '',
        est_time: initialValues.est_time,
        act_time: initialValues.act_time,
        status: initialValues.status ?? 'To Do',
        intern: initialValues.intern,
      });
    }
  }, [opened, initialValues]);

  const handleSubmit = async (values: Omit<Task, 'date'>) => {
    // Chuẩn bị payload gửi lên API
    const apiPayload: any = { 
      ...values, 
      date: workDate, 
      intern,
    };
    if (typeof values.act_time === 'number') {
      apiPayload.act_time = values.act_time;
    } else {
      apiPayload.act_time = null;
    }
    
    try {
      if (isEdit && initialValues?.id) {
        const updatedTask = await updateTask.mutateAsync({ ...apiPayload, id: initialValues.id });
        updateTaskInContext(updatedTask, isToday);
      } else {
        const newTask = await addTask.mutateAsync(apiPayload);
        addTaskToContext(newTask, isToday);
      }
      
      await queryClient.refetchQueries({ 
        queryKey: ['/api/tasks/', `?intern=${intern}&date=${workDate}`]
      });
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <Modal
      size={'lg'}
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa task' : 'Thêm task mới'}
      centered
    >
      <form onSubmit={formTask.onSubmit(handleSubmit)}>
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
              withAsterisk={formTask.values.status === 'Done'}
              disabled={formTask.values.status === 'To Do'}
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
          <Button 
            type="submit" 
            disabled={!formTask.isValid() || addTask.isPending || updateTask.isPending}
          >
            {isEdit ? 'Cập nhật' : 'Thêm'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
