import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      variant="light"
      onClick={() => toggleColorScheme()}
      title="Chuyển đổi giao diện sáng/tối"
      size={38}
      style={{
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 2100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: colorScheme === 'dark' ? '#222' : '#fff',
        transition: 'box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}
