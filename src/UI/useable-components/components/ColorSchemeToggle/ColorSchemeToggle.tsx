import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconSun, IconMoon, IconMessageCircle } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  return (
    <Group
      style={{
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 2100,
      }}
    >
      {/* Nút chuyển qua trang chat AI */}
      <Tooltip label="Đi tới Chat AI">
        <ActionIcon
          variant="light"
          size={38}
          onClick={() => navigate('/chat-ai')}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: colorScheme === 'dark' ? '#222' : '#fff',
            transition: 'all 0.3s ease',
          }}
        >
          <IconMessageCircle size={20} />
        </ActionIcon>
      </Tooltip>

      {/* Nút đổi giao diện sáng/tối */}
      <Tooltip label="Chuyển giao diện sáng/tối">
        <ActionIcon
          variant="light"
          onClick={() => toggleColorScheme()}
          size={38}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: colorScheme === 'dark' ? '#222' : '#fff',
            transition: 'all 0.3s ease',
          }}
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
