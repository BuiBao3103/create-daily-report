import { Autocomplete, Button, Modal, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { absenceReasons } from '@/Utils/constants/TaskForm.constants';
import { AbsenceType } from '@/Utils/enums/DailyEnum/DailyReportForm.types';

interface AbsenceModalProps {
  opened: boolean;
  onClose: () => void;
  absenceType: AbsenceType;
  setAbsenceType: (type: AbsenceType) => void;
  absenceReason: string;
  setAbsenceReason: (reason: string) => void;
  onSubmit: () => void;
}

export function AbsenceModal({
  opened,
  onClose,
  absenceType,
  setAbsenceType,
  absenceReason,
  setAbsenceReason,
  onSubmit,
}: AbsenceModalProps) {
  const form = useForm({
    initialValues: {
      type: absenceType,
      reason: absenceReason,
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
    setAbsenceType(form.values.type);
    setAbsenceReason(form.values.reason);
    onSubmit();
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
