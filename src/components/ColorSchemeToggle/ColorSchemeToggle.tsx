import { IconMoon, IconSun } from '@tabler/icons-react';
import { ActionIcon, Group, Tooltip, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleClick = () => {
    if (!document.startViewTransition) {
      toggleColorScheme();
      return;
    }
    document.startViewTransition(() => {
      toggleColorScheme();
    });
  };

  return (
    <Group
      style={{
        position: 'fixed',
        top: 10,
        right: 32,
        zIndex: 100,
      }}
    >
      {/* Nút đổi giao diện sáng/tối */}
      <Tooltip label="Chuyển giao diện sáng/tối">
        <ActionIcon
          variant="light"
          onClick={handleClick}
          size={38}
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            background: colorScheme === 'dark' ? '#222' : 'rgba(0, 8, 255, 0.03)',
            transition: 'all 0.3s ease',
          }}
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
