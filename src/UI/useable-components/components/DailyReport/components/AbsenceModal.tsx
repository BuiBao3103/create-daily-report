import { Autocomplete, Button, Modal, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { absenceReasons } from '@/Utils/constants/TaskForm.constants';
import { AbsenceType } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { useDailyReport } from '../context/DailyReportContext';

interface AbsenceModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly isToday: boolean;
  readonly initialAbsence?: {
    type: AbsenceType;
    reason: string;
  };
}

export function AbsenceModal({
  opened,
  onClose,
  isToday,
  initialAbsence,
}: AbsenceModalProps) {
  const { addAbsence, editAbsence } = useDailyReport();
  const form = useForm({
    initialValues: initialAbsence || {
      type: AbsenceType.SCHEDULED,
      reason: '',
    },
    validate: {
      type: (value) => (value ? null : 'Vui lòng chọn loại nghỉ'),
      reason: (value) => (value.trim().length > 0 ? null : 'Vui lòng nhập lý do nghỉ'),
    },
  });

  const handleSubmit = () => {
    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      return;
    }

    if (initialAbsence) {
      editAbsence(form.values, isToday);
    } else {
      addAbsence(form.values, isToday);
    }
    
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Thông tin nghỉ" centered>
      <Stack>
        <Select
          label="Loại nghỉ"
          allowDeselect={false}
          value={form.values.type}
          onChange={(value) => {
            form.setFieldValue('type', value as AbsenceType);
          }}
          data={[
            { value: AbsenceType.SCHEDULED, label: 'Nghỉ theo lịch' },
            { value: AbsenceType.EXCUSED, label: 'Nghỉ có phép' },
            { value: AbsenceType.UNEXCUSED, label: 'Nghỉ không phép' },
          ]}
          withAsterisk
          error={form.errors.type}
        />
        <Autocomplete
          label="Lý do"
          placeholder="Chọn hoặc nhập lý do"
          value={form.values.reason}
          onChange={(value) => {
            form.setFieldValue('reason', value);
          }}
          data={absenceReasons}
          withAsterisk
          error={form.errors.reason}
        />
        <Button onClick={handleSubmit} disabled={!form.isValid()}>
          Xác nhận
        </Button>
      </Stack>
    </Modal>
  );
}
