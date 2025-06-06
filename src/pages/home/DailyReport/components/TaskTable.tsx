import { ActionIcon, Flex, Paper, Table, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Task } from '@/interfaces/task.types';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task, index: number, isToday: boolean) => void;
  onDelete: (task: Task, isToday: boolean) => void;
  isToday: boolean;
}

export function TaskTable({ tasks, onEdit, onDelete, isToday }: TaskTableProps) {
  return (
    <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        style={{
          '& thead tr th': {
            backgroundColor: 'var(--mantine-color-blue-0)',
            color: 'var(--mantine-color-blue-7)',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
          },
          '& tbody tr td': {
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
          },
          '& tbody tr:hover': {
            backgroundColor: 'var(--mantine-color-blue-0)',
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Task ID</Table.Th>
            <Table.Th>Dự án</Table.Th>
            <Table.Th>Nội dung</Table.Th>
            <Table.Th>Dự kiến</Table.Th>
            <Table.Th>Thực tế</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tasks.map((task: Task, index: number) => (
            <Table.Tr key={index}>
              <Table.Td>{task.backlog_id || '-'}</Table.Td>
              <Table.Td>{task.project || '-'}</Table.Td>
              <Table.Td>{task.content || '-'}</Table.Td>
              <Table.Td>{task.estimate_time ? `${task.estimate_time}h` : '-'}</Table.Td>
              <Table.Td>{task.actual_time ? `${task.actual_time}h` : '-'}</Table.Td>
              <Table.Td>{task.status || '-'}</Table.Td>
              <Table.Td>
                <Flex gap={4} justify="flex-end">
                  <Tooltip label="Chỉnh sửa">
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      size="sm"
                      radius="xl"
                      onClick={() => onEdit(task, index, isToday)}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Xóa">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      radius="xl"
                      onClick={() => onDelete(task, isToday)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
} 