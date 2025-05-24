import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { useDailyReport } from '@/context/DailyReportContext';
import { useTaskMutations } from '@/hooks/use_tasks';
import { Task } from '@/interfaces/task.types';
import { TaskForm } from './components/TaskForm';
import { TaskInfo } from './components/TaskInfo';

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
    value: number | { estimate_time: number; actual_time: number }
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
  const [specialMode, setSpecialMode] = useState<'done' | 'continue' | null>(null);
  const [specialValue, setSpecialValue] = useState<number | undefined>(undefined);
  const [continueActTime, setContinueActTime] = useState<number | undefined>(undefined);

  const handleSubmit = async (values: Omit<Task, 'date'>) => {
    const apiPayload = { ...values, date: workDate, intern };
    
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

  const handleClose = () => {
    setSpecialMode(null);
    setSpecialValue(undefined);
    setContinueActTime(undefined);
    onClose();
  };

  const renderSpecialModeContent = () => {
    if (specialMode === 'done') {
      return (
        <Stack gap="xs">
          {initialValues && <TaskInfo task={{ ...initialValues, date: workDate }} />}
          <Text>Nhập số giờ thực tế để hoàn thành task:</Text>
          <NumberInput
            label="Thời gian thực tế (giờ)"
            min={0}
            value={specialValue}
            onChange={(val) => setSpecialValue(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" leftSection={<IconX size={16} />} onClick={handleClose}>
              Hủy
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={() => {
                if (specialValue && onSpecialAction) {
                  onSpecialAction('done', specialValue);
                  handleClose();
                }
              }}
              disabled={typeof specialValue !== 'number' || specialValue <= 0}
            >
              Cập nhật
            </Button>
          </Group>
        </Stack>
      );
    }

    if (specialMode === 'continue') {
      return (
        <Stack gap="xs">
          {initialValues && <TaskInfo task={{ ...initialValues, date: workDate }} />}
          <Text>Nhập số giờ thực tế đã làm hôm qua:</Text>
          <NumberInput
            label="Thời gian thực tế hôm qua (giờ)"
            min={0}
            value={continueActTime}
            onChange={(val) => setContinueActTime(typeof val === 'number' ? val : undefined)}
            withAsterisk
          />
          <Group justify="flex-end">
            <Button variant="light" leftSection={<IconX size={16} />} onClick={handleClose}>
              Hủy
            </Button>
            <Button
              color="blue"
              leftSection={<IconCheck size={16} />}
              onClick={() => {
                if (
                  onSpecialAction &&
                  typeof continueActTime === 'number' &&
                  initialValues &&
                  typeof initialValues.estimate_time === 'number'
                ) {
                  const newEst = Math.max(1, initialValues.estimate_time - continueActTime);
                  onSpecialAction('continue', { estimate_time: newEst, actual_time: continueActTime });
                  handleClose();
                }
              }}
              disabled={typeof continueActTime !== 'number' || continueActTime <= 0}
            >
              Tạo task mới
            </Button>
          </Group>
        </Stack>
      );
    }

    return null;
  };

  const isYesterdayToDoEdit = isEdit && !isToday && initialValues?.status === 'To Do';

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={handleClose}
      title={isEdit ? 'Chỉnh sửa task' : 'Thêm task mới'}
      centered
    >
      {specialMode ? (
        renderSpecialModeContent()
      ) : (
        <>
          <TaskForm
            initialValues={initialValues}
            isEdit={isEdit}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isPending={addTask.isPending || updateTask.isPending}
          />
          {isYesterdayToDoEdit && (
            <Group mt="md" justify="flex-end">
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={() => setSpecialMode('done')}
              >
                Hoàn thành
              </Button>
              <Button
                color="blue"
                leftSection={<IconRefresh size={16} />}
                onClick={() => setSpecialMode('continue')}
              >
                Làm tiếp
              </Button>
            </Group>
          )}
        </>
      )}
    </Modal>
  );
}
