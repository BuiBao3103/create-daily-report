'use-client';

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
import useInterns from '@/hooks/use_interns';
import { AbsenceType } from '@/interfaces/DailyReportForm.types';
import { useDailyReport } from '../../context/DailyReportContext';
import { AbsenceModal } from './AbsenceModal';
import { DaySection } from './DaySection';
import { TaskModal } from './TaskModal';
import { useEffect } from 'react';

function DailyReportFormContent() {
  const query = useInterns({
    params: '',
  });

  const {
    intern,
    isIntern,
    name,
    waitingForTask,
    yesterdayDate,
    todayDate,
    setIntern,
    setIsIntern,
    setName,
    setWaitingForTask,
    setYesterdayDate,
    setTodayDate,
    addTask,
  } = useDailyReport();

  useEffect(() => {
    if (intern && query.data?.results) {
      const selectedIntern = query.data.results.find((i) => i.id === intern);
      if (selectedIntern) {
        setName(selectedIntern.full_name);
      }
    }
  }, [intern, query.data, setName]);

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

  const handleDateChange = (date: string | null, field: 'yesterdayDate' | 'todayDate') => {
    if (date) {
      if (field === 'yesterdayDate') {
        setYesterdayDate(date);
      } else {
        setTodayDate(date);
      }
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
              disabled={isIntern}
              withAsterisk
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <DateInput
              label="Ngày báo cáo"
              placeholder="Chọn ngày"
              valueFormat="DD/MM/YYYY"
              maxDate={new Date()}
              withAsterisk
              clearable={false}
              style={{ flex: 1 }}
              value={todayDate}
              onChange={(date) => date && setTodayDate(date)}
            />
            <Checkbox
              label="Là thực tập sinh"
              mt={25}
              checked={isIntern}
              onChange={(e) => setIsIntern(e.currentTarget.checked)}
            />
          </Group>

          {isIntern && (
            <Select
              allowDeselect={false}
              label="Chọn thực tập sinh"
              placeholder="Chọn thực tập sinh"
              data={
                (query?.data?.results || []).map((intern) => ({
                  value: intern.id.toString(),
                  label: `${intern.full_name} - ${intern.uni_code}`,
                })) || []
              }
              withAsterisk
              value={intern?.toString()}
              onChange={(value) => setIntern(value ? parseInt(value) : null)}
            />
          )}

          <Stack gap="md">
            <Stack gap="xs" style={{ position: 'relative' }}>
              <DateInput
                label="Ngày trước"
                value={yesterdayDate}
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
              {!intern && (
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
                value={todayDate}
                onChange={(date) => handleDateChange(date, 'todayDate')}
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
              />
              <DaySection
                waitingForTask={waitingForTask}
                onAddTask={() => openTodayTaskModal()}
                onAddAbsence={() => openTodayAbsenceModal()}
                onWaitingForTaskChange={(checked) => setWaitingForTask(checked)}
                label="Hôm nay"
              />
              {!intern && (
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
        workDate={yesterdayDate}
        opened={yesterdayTaskModal}
        onClose={closeYesterdayTaskModal}
        onSubmit={() => {
          closeYesterdayTaskModal();
        }}
        isToday={false}
      />

      <TaskModal
        workDate={todayDate}
        opened={todayTaskModal}
        onClose={closeTodayTaskModal}
        onSubmit={() => {
          closeTodayTaskModal();
        }}
        isToday={true}
      />

      <AbsenceModal
        opened={yesterdayAbsenceModal}
        onClose={closeYesterdayAbsenceModal}
        absenceType={AbsenceType.SCHEDULED}
        setAbsenceType={() => {}}
        absenceReason=""
        setAbsenceReason={() => {}}
        onSubmit={() => {
          closeYesterdayAbsenceModal();
        }}
      />

      <AbsenceModal
        opened={todayAbsenceModal}
        onClose={closeTodayAbsenceModal}
        absenceType={AbsenceType.SCHEDULED}
        setAbsenceType={() => {}}
        absenceReason=""
        setAbsenceReason={() => {}}
        onSubmit={() => {
          closeTodayAbsenceModal();
        }}
      />
    </Stack>
  );
}

export function DailyReportForm() {
  return <DailyReportFormContent />;
}
