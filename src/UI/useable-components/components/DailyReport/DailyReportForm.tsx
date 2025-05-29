'use-client';

import { useEffect } from 'react';
import { IconLock } from '@tabler/icons-react';
import {
  Center,
  Group,
  Paper as MantinePaper,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { interns } from '@/Utils/constants/TaskForm.constants';
import { AbsenceModal } from './components/AbsenceModal';
import { DaySection } from './components/DaySection';
import { TaskModal } from './components/TaskModal';
import { useDailyReport } from './context/DailyReportContext';

function DailyReportFormContent() {
  const { form, updateOutput } = useDailyReport();
  const [yesterdayTaskModal, { open: openYesterdayTaskModal, close: closeYesterdayTaskModal }] =
    useDisclosure(false);
  const [todayTaskModal, { open: openTodayTaskModal, close: closeTodayTaskModal }] =
    useDisclosure(false);
  const [
    yesterdayAbsenceModal,
    { open: openYesterdayAbsenceModal, close: closeYesterdayAbsenceModal },
  ] = useDisclosure(false);
  const [todayAbsenceModal, { open: openTodayAbsenceModal, close: closeTodayAbsenceModal }] =
    useDisclosure(false);

  // Update output when name or date changes
  useEffect(() => {
    updateOutput();
  }, [form.values.internName, form.values.date]);

  const handleDateChange = (date: string | null, field: 'yesterdayDate' | 'todayDate') => {
    if (date) {
      form.setFieldValue(field, new Date(date));
      updateOutput();
    }
  };

  return (
    <Stack gap="md">
      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3}>Báo cáo công việc</Title>
          <Group grow align="flex-start">
            <Select
              searchable
              allowDeselect={false}
              label="Chọn thực tập sinh"
              placeholder="Chọn thực tập sinh"
              data={
                interns?.map((intern) => ({
                  value: intern.id.toString(),
                  label: `${intern.full_name} - ${intern.uni_code}`,
                })) || []
              }
              withAsterisk
              onChange={(value) => {
                const selectedIntern = interns.find((intern) => intern.id.toString() === value);
                if (selectedIntern) {
                  form.setFieldValue('internName', selectedIntern.full_name);
                  form.setFieldValue('internId', selectedIntern.id);
                }
              }}
            />
            <DateInput
              label="Ngày báo cáo"
              placeholder="Chọn ngày"
              valueFormat="DD/MM/YYYY"
              maxDate={new Date()}
              withAsterisk
              clearable={false}
              style={{ flex: 1 }}
              {...form.getInputProps('date')}
            />
          </Group>

          <Stack gap="md">
            <Stack gap="xs" style={{ position: 'relative' }}>
              <DateInput
                label="Ngày trước"
                value={form.values.yesterdayDate}
                onChange={(date) => handleDateChange(date, 'yesterdayDate')}
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
              />
              <DaySection
                label="Hôm qua"
                hasAbsence={!!form.values.yesterdayAbsence}
                onAddTask={openYesterdayTaskModal}
                onAddAbsence={openYesterdayAbsenceModal}
              />
              {!form.values.internName && (
                <MantinePaper
                  pos="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="var(--mantine-color-body)"
                  opacity={0.9}
                  style={{ backdropFilter: 'blur(2px)', zIndex: 1 }}
                  radius="md"
                  withBorder
                  shadow="sm"
                >
                  <Center h="100%">
                    <Stack align="center" gap="xs">
                      <ThemeIcon size="xl" radius="xl" variant="light" color="gray.6">
                        <IconLock size={20} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" fw={500}>
                        Vui lòng chọn thực tập sinh
                      </Text>
                    </Stack>
                  </Center>
                </MantinePaper>
              )}
            </Stack>

            <Stack gap="xs" style={{ position: 'relative' }}>
              <DateInput
                label="Ngày hôm nay"
                value={form.values.todayDate}
                onChange={(date) => handleDateChange(date, 'todayDate')}
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
              />
              <DaySection
                label="Hôm nay"
                hasAbsence={!!form.values.todayAbsence}
                onAddTask={openTodayTaskModal}
                onAddAbsence={openTodayAbsenceModal}
              />
              {!form.values.internName && (
                <MantinePaper
                  pos="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="var(--mantine-color-body)"
                  opacity={0.9}
                  style={{ backdropFilter: 'blur(2px)', zIndex: 1 }}
                  radius="md"
                  withBorder
                  shadow="sm"
                >
                  <Center h="100%">
                    <Stack align="center" gap="xs">
                      <ThemeIcon size="xl" radius="xl" variant="light" color="gray.6">
                        <IconLock size={20} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" fw={500}>
                        Vui lòng nhập họ và tên trước
                      </Text>
                    </Stack>
                  </Center>
                </MantinePaper>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <TaskModal
        workDate={form.values.yesterdayDate}
        opened={yesterdayTaskModal}
        onClose={closeYesterdayTaskModal}
        isToday={false}
      />

      <TaskModal
        workDate={form.values.todayDate}
        opened={todayTaskModal}
        onClose={closeTodayTaskModal}
        isToday={true}
      />

      <AbsenceModal
        opened={yesterdayAbsenceModal}
        onClose={closeYesterdayAbsenceModal}
        isToday={false}
        initialAbsence={form.values.yesterdayAbsence}
      />

      <AbsenceModal
        opened={todayAbsenceModal}
        onClose={closeTodayAbsenceModal}
        isToday={true}
        initialAbsence={form.values.todayAbsence}
      />
    </Stack>
  );
}

export function DailyReportForm() {
  return <DailyReportFormContent />;
}
