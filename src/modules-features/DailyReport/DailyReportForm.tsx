'use-client';

import { useEffect } from 'react';
import { IconLock } from '@tabler/icons-react';
import {
  Center,
  Checkbox,
  Group,
  Paper as MantinePaper,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
// import { interns } from '@/constants/TaskForm.constants';
import { AbsenceType } from '@/types/DailyReportForm.types';
import { AbsenceModal } from './AbsenceModal';
import { DaySection } from './DaySection';
import { TaskModal } from './TaskModal';
import { useDailyReport } from '../../context/DailyReportContext';
import useInterns from '@/hooks/use_interns';

function DailyReportFormContent() {
  const query = useInterns({
    params: ""
  })
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

  const handleDateChange = (date: Date | null, field: 'yesterdayDate' | 'todayDate') => {
    if (date) {
      form.setFieldValue(field, date);
      updateOutput();
    }
  };

  return (
    <Stack gap="md">
      <Paper shadow="xs" p="md">
        <Stack gap="md">
          <Title order={3}>Báo cáo công việc</Title>
          <Group grow align="flex-start">
            <TextInput
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              disabled={form.values.isIntern}
              withAsterisk
              {...form.getInputProps('internName')}
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
            <Checkbox
              label="Là thực tập sinh"
              mt={25}
              {...form.getInputProps('isIntern', { type: 'checkbox' })}
            />
          </Group>

          {form.values.isIntern && (
            <Select
              allowDeselect={false}
              label="Chọn thực tập sinh"
              placeholder="Chọn thực tập sinh"
              data={
                // interns?.data?.results?.map((intern) => ({
                //   value: intern.full_name,
                //   label: `${intern.full_name} - ${intern.uni_code}`,
                // })) || []
                (query?.data?.results || []).map((intern) => ({
                  value: intern.full_name,
                  label: `${intern.full_name} - ${intern.uni_code}`,
                })) || []
              }
              withAsterisk
              {...form.getInputProps('internName')}
            />
          )}

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
                waitingForTask={false}
                onAddTask={() => openYesterdayTaskModal()}
                onAddAbsence={() => openYesterdayAbsenceModal()}
                label="Hôm qua"
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

            <Stack gap="xs" style={{ position: 'relative' }}>
              <DateInput
                label="Ngày hôm nay"
                value={form.values.todayDate}
                onChange={(date) => handleDateChange(date, 'todayDate')}
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
              />
              <DaySection
                waitingForTask={form.values.waitingForTask}
                onAddTask={() => openTodayTaskModal()}
                onAddAbsence={() => openTodayAbsenceModal()}
                onWaitingForTaskChange={(checked) => {
                  form.setFieldValue('waitingForTask', checked);
                  updateOutput();
                }}
                label="Hôm nay"
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
        onSubmit={(task) => {
          form.setFieldValue('yesterdayTasks', [...form.values.yesterdayTasks, task]);
          updateOutput();
          closeYesterdayTaskModal();
        }}
      />

      <TaskModal
        workDate={form.values.todayDate}
        opened={todayTaskModal}
        onClose={closeTodayTaskModal}
        onSubmit={(task) => {
          form.setFieldValue('todayTasks', [...form.values.todayTasks, task]);
          updateOutput();
          closeTodayTaskModal();
        }}
      />

      <AbsenceModal
        opened={yesterdayAbsenceModal}
        onClose={closeYesterdayAbsenceModal}
        absenceType={form.values.yesterdayAbsence?.type ?? AbsenceType.SCHEDULED}
        setAbsenceType={(type) => {
          form.setFieldValue('yesterdayAbsence', {
            type,
            reason: form.values.yesterdayAbsence?.reason ?? '',
          });
        }}
        absenceReason={form.values.yesterdayAbsence?.reason ?? ''}
        setAbsenceReason={(reason) => {
          form.setFieldValue('yesterdayAbsence', {
            type: form.values.yesterdayAbsence?.type ?? AbsenceType.SCHEDULED,
            reason,
          });
        }}
        onSubmit={() => {
          updateOutput();
          closeYesterdayAbsenceModal();
        }}
      />

      <AbsenceModal
        opened={todayAbsenceModal}
        onClose={closeTodayAbsenceModal}
        absenceType={form.values.todayAbsence?.type ?? AbsenceType.SCHEDULED}
        setAbsenceType={(type) => {
          form.setFieldValue('todayAbsence', {
            type,
            reason: form.values.todayAbsence?.reason ?? '',
          });
        }}
        absenceReason={form.values.todayAbsence?.reason ?? ''}
        setAbsenceReason={(reason) => {
          form.setFieldValue('todayAbsence', {
            type: form.values.todayAbsence?.type ?? AbsenceType.SCHEDULED,
            reason,
          });
        }}
        onSubmit={() => {
          updateOutput();
          closeTodayAbsenceModal();
        }}
      />
    </Stack>
  );
}

export function DailyReportForm() {
  return <DailyReportFormContent />;
}
