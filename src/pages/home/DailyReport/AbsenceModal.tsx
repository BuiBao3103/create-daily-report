import { Autocomplete, Button, Modal, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { absenceReasons } from '@/constants/TaskForm.constants';
import { AbsenceType } from '@/interfaces/DailyReportForm.types';
import { useAbsenceMutations } from '@/hooks/use_absences';
import { useQueryClient } from '@tanstack/react-query';

interface AbsenceModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly absenceType: AbsenceType;
  readonly setAbsenceType: (type: AbsenceType) => void;
  readonly absenceReason: string;
  readonly setAbsenceReason: (reason: string) => void;
  readonly onSubmit: () => void;
  readonly date: string;
  readonly intern: number;
}

export function AbsenceModal({
  opened,
  onClose,
  absenceType,
  setAbsenceType,
  absenceReason,
  setAbsenceReason,
  onSubmit,
  date,
  intern,
}: AbsenceModalProps) {
  const { addAbsence } = useAbsenceMutations();
  const queryClient = useQueryClient();

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

  const handleSubmit = async () => {
    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      return;
    }

    try {
      await addAbsence.mutateAsync({
        date,
        type: form.values.type,
        reason: form.values.reason,
        intern,
      });

      setAbsenceType(form.values.type);
      setAbsenceReason(form.values.reason);
      await queryClient.invalidateQueries({ queryKey: ['/api/absences/'] });
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error adding absence:', error);
    }
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
        <Button 
          onClick={handleSubmit} 
          disabled={!form.isValid() || addAbsence.isPending}
        >
          Xác nhận
        </Button>
      </Stack>
    </Modal>
  );
}
