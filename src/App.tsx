import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/transitions.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
    >
      <Router />
    </MantineProvider>
  );
}
