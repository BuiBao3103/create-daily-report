import { useEffect, useState } from 'react';
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
  Text,
  Paper,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { projects, statuses } from '@/constants/TaskForm.constants';
import { useDailyReport } from '@/context/DailyReportContext';
import { useTaskMutations } from '@/hooks/use_tasks';
import { Task } from '@/interfaces/task.types';
import { IconCheck, IconRefresh, IconClock, IconArrowRight, IconX, IconPlus } from '@tabler/icons-react';

interface TaskModalProps {
  readonly workDate: string;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly initialValues?: Omit<Task, 'date'>;
  readonly isEdit?: boolean;
  readonly isToday?: boolean;
  readonly onSpecialAction?: (
    action: 'done' | 'continue',
    value: number | { est_time: number; act_time: number }
  ) => void;
}

export function TaskModal({
  workDate,
  opened,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
  isToday = true,
  onSpecialAction,
}: TaskModalProps) {
  const { intern, addTask: addTaskToContext, updateTask: updateTaskInContext } = useDailyReport();
  const queryClient = useQueryClient();
  const { addTask, updateTask } = useTaskMutations();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

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

  const [specialMode, setSpecialMode] = useState<'done' | 'continue' | null>(null);
  const [specialValue, setSpecialValue] = useState<number | undefined>(undefined);
  const [continueStep, setContinueStep] = useState<1 | 2>(1);
  const [continueActTime, setContinueActTime] = useState<number | undefined>(undefined);

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

  // Detect if this is yesterday's To Do task being edited
  const isYesterdayToDoEdit = isEdit && !isToday && initialValues?.status === 'To Do';

  return (
    <Modal
      size={'lg'}
      opened={opened}
      onClose={() => {
        setSpecialMode(null);
        setSpecialValue(undefined);
        setContinueStep(1);
        setContinueActTime(undefined);
        onClose();
      }}
      title={isEdit ? 'Chỉnh sửa task' : 'Thêm task mới'}
      centered
    >
      {/* Nếu đang ở chế độ đặc biệt, chỉ hiển thị input và nút xác nhận */}
      {specialMode === 'done' ? (
        <Stack gap="xs">
          {/* Hiển thị thông tin task hiện tại */}
          {initialValues && (
            <Paper
              withBorder
              radius="md"
              p="md"
              mb="sm"
              style={{
                background: isDark
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
                borderColor: isDark
                  ? theme.colors.dark[4]
                  : theme.colors.gray[3],
              }}
            >
              <Text size="sm" fw={600} mb={4}>Thông tin task hôm qua</Text>
              <Group gap={8}>
                <Text size="sm">ID: <b>{initialValues.task_id || '-'}</b></Text>
                <Text size="sm">| Nội dung: <b>{initialValues.content}</b></Text>
                <Text size="sm">| Dự kiến: <b>{initialValues.est_time ?? '-'}</b> giờ</Text>
                <Text size="sm">| Trạng thái: <b>{initialValues.status}</b></Text>
              </Group>
            </Paper>
          )}
          <Text>Nhập số giờ thực tế để hoàn thành task:</Text>
          <NumberInput
            label="Thời gian thực tế (giờ)"
            min={0}
            value={specialValue}
            onChange={(val) => setSpecialValue(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" leftSection={<IconX size={16} />} onClick={() => { setSpecialMode(null); setSpecialValue(undefined); }}>
              Hủy
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={() => {
                if (specialValue && onSpecialAction) {
                  onSpecialAction('done', specialValue);
                  setSpecialMode(null);
                  setSpecialValue(undefined);
                }
              }}
              disabled={typeof specialValue !== 'number' || specialValue <= 0}
            >
              Cập nhật
            </Button>
          </Group>
        </Stack>
      ) : specialMode === 'continue' ? (
        <Stack gap="xs">
          {/* Hiển thị thông tin task hiện tại */}
          {initialValues && (
            <Paper
              withBorder
              radius="md"
              p="md"
              mb="sm"
              style={{
                background: isDark
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
                borderColor: isDark
                  ? theme.colors.dark[4]
                  : theme.colors.gray[3],
              }}
            >
              <Text size="sm" fw={600} mb={4}>Thông tin task hôm qua</Text>
              <Group gap={8}>
                <Text size="sm">ID: <b>{initialValues.task_id || '-'}</b></Text>
                <Text size="sm">| Nội dung: <b>{initialValues.content}</b></Text>
                <Text size="sm">| Dự kiến: <b>{initialValues.est_time ?? '-'}</b> giờ</Text>
                <Text size="sm">| Trạng thái: <b>{initialValues.status}</b></Text>
              </Group>
            </Paper>
          )}
          <Text>Nhập số giờ thực tế đã làm hôm qua:</Text>
          <NumberInput
            label="Thời gian thực tế hôm qua (giờ)"
            min={0}
            value={continueActTime}
            onChange={(val) => setContinueActTime(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" leftSection={<IconX size={16} />} onClick={() => {
              setSpecialMode(null);
              setContinueStep(1);
              setContinueActTime(undefined);
            }}>
              Hủy
            </Button>
            <Button
              color="blue"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                if (
                  onSpecialAction &&
                  typeof continueActTime === 'number' &&
                  initialValues &&
                  typeof initialValues.est_time === 'number'
                ) {
                  // Tính est_time mới
                  const newEst = Math.max(1, initialValues.est_time - continueActTime);
                  onSpecialAction('continue', { est_time: newEst, act_time: continueActTime });
                  setSpecialMode(null);
                  setContinueStep(1);
                  setContinueActTime(undefined);
                  setSpecialValue(undefined);
                }
              }}
              disabled={typeof continueActTime !== 'number' || continueActTime <= 0}
            >
              Tạo task mới
            </Button>
          </Group>
        </Stack>
      ) : (
        <>
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
              <Button variant="light" leftSection={<IconX size={16} />} onClick={onClose}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                leftSection={isEdit ? <IconCheck size={16} /> : <IconPlus size={16} />}
                disabled={!formTask.isValid() || addTask.isPending || updateTask.isPending}
              >
                {isEdit ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Group>
          </form>
          {/* Nếu là edit task To Do hôm qua, hiển thị 2 nút đặc biệt */}
          {isYesterdayToDoEdit && (
            <Group mt="md" justify="flex-end">
              <Button color="green" leftSection={<IconCheck size={16} />} onClick={() => setSpecialMode('done')}>Hoàn thành</Button>
              <Button color="blue" leftSection={<IconRefresh size={16} />} onClick={() => { setSpecialMode('continue'); setContinueStep(1); }}>Làm tiếp</Button>
            </Group>
          )}
        </>
      )}
    </Modal>
  );
}
