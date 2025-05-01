import { useEffect, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Box, Button, Group, Stack, TextInput } from '@mantine/core';

interface Task {
  description: string;
  hours: string;
}

interface DailyReportFormProps {
  readonly onSubmit?: (data: DailyReportData) => void;
}

export interface DailyReportData {
  name: string;
  date: string;
  yesterdayLabel: string;
  todayLabel: string;
  yesterdayTasks: Task[];
  todayTasks: Task[];
}

const defaultLabels = {
  yesterday: 'Hôm qua',
  today: 'Hôm nay',
};

export function DailyReportForm({ onSubmit }: DailyReportFormProps) {
  const [formData, setFormData] = useState<DailyReportData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    yesterdayLabel: defaultLabels.yesterday,
    todayLabel: defaultLabels.today,
    yesterdayTasks: [],
    todayTasks: [],
  });

  useEffect(() => {
    // Load saved labels from localStorage
    const savedYesterdayLabel = localStorage.getItem('yesterdayLabel');
    const savedTodayLabel = localStorage.getItem('todayLabel');

    if (savedYesterdayLabel) {
      setFormData((prev) => ({ ...prev, yesterdayLabel: savedYesterdayLabel }));
    }
    if (savedTodayLabel) {
      setFormData((prev) => ({ ...prev, todayLabel: savedTodayLabel }));
    }
  }, []);

  const handleChange = (field: keyof DailyReportData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (
    section: 'yesterdayTasks' | 'todayTasks',
    index: number,
    field: keyof Task,
    value: string
  ) => {
    setFormData((prev) => {
      const newTasks = [...prev[section]];
      newTasks[index] = { ...newTasks[index], [field]: value };
      return { ...prev, [section]: newTasks };
    });
  };

  const addTask = (section: 'yesterdayTasks' | 'todayTasks') => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], { description: '', hours: '' }],
    }));
  };

  const removeTask = (section: 'yesterdayTasks' | 'todayTasks', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const resetLabel = (section: 'yesterdayLabel' | 'todayLabel') => {
    const defaultValue =
      section === 'yesterdayLabel' ? defaultLabels.yesterday : defaultLabels.today;
    setFormData((prev) => ({ ...prev, [section]: defaultValue }));
    localStorage.setItem(section, defaultValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save labels to localStorage
    localStorage.setItem('yesterdayLabel', formData.yesterdayLabel);
    localStorage.setItem('todayLabel', formData.todayLabel);
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Tên"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Nhập tên của bạn..."
          required
        />

        <TextInput
          label="Ngày"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />

        {/* Nhãn 1 */}
        <Group gap={8} align="center" mb={4} wrap="nowrap">
          <TextInput
            label="Nhãn 1"
            id="yesterdayLabel"
            value={formData.yesterdayLabel}
            onChange={(e) => handleChange('yesterdayLabel', e.target.value)}
            placeholder="Nhãn..."
            size="sm"
            radius="sm"
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button
            variant="light"
            size="xs"
            radius="sm"
            px={10}
            style={{ fontWeight: 400, minWidth: 0, marginTop: 22 }}
            onClick={() => resetLabel('yesterdayLabel')}
          >
            Mặc định
          </Button>
        </Group>

        <Box>
          <Stack gap="xs">
            {formData.yesterdayTasks.map((task, index) => (
              <Group key={index} gap="xs">
                <TextInput
                  placeholder="Nhập công việc..."
                  value={task.description}
                  onChange={(e) =>
                    handleTaskChange('yesterdayTasks', index, 'description', e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <TextInput
                  type="number"
                  placeholder="Giờ"
                  value={task.hours}
                  onChange={(e) =>
                    handleTaskChange('yesterdayTasks', index, 'hours', e.target.value)
                  }
                  style={{ width: '80px' }}
                  min={0}
                  step={0.5}
                />
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeTask('yesterdayTasks', index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => addTask('yesterdayTasks')}
              size="xs"
            >
              Thêm dòng
            </Button>
          </Stack>
        </Box>
        {/* Nhãn 2 */}
        <Group gap={8} align="center" mb={4} wrap="nowrap">
          <TextInput
            label="Nhãn 2"
            id="todayLabel"
            value={formData.todayLabel}
            onChange={(e) => handleChange('todayLabel', e.target.value)}
            placeholder="Nhãn..."
            size="sm"
            radius="sm"
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button
            variant="light"
            size="xs"
            radius="sm"
            px={10}
            style={{ fontWeight: 400, minWidth: 0, marginTop: 22 }}
            onClick={() => resetLabel('todayLabel')}
          >
            Mặc định
          </Button>
        </Group>
        <Box>
          <Stack gap="xs">
            {formData.todayTasks.map((task, index) => (
              <Group key={index} gap="xs">
                <TextInput
                  placeholder="Nhập công việc..."
                  value={task.description}
                  onChange={(e) =>
                    handleTaskChange('todayTasks', index, 'description', e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <TextInput
                  type="number"
                  placeholder="Giờ"
                  value={task.hours}
                  onChange={(e) => handleTaskChange('todayTasks', index, 'hours', e.target.value)}
                  style={{ width: '80px' }}
                  min={0}
                  step={0.5}
                />
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeTask('todayTasks', index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => addTask('todayTasks')}
              size="xs"
            >
              Thêm dòng
            </Button>
          </Stack>
        </Box>

        <Button type="submit" fullWidth mt="auto">
          Tạo báo cáo
        </Button>
      </Stack>
    </form>
  );
}
