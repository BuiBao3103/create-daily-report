import { createTheme, Loader } from '@mantine/core';
import { RingLoader } from './components/Loader/RingLoader';

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
            boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
            boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders, ring: RingLoader },
        type: 'ring',
      },
    }),
  },
  other: {
    gradients: {
      dark: 'linear-gradient(135deg, #263238, #0d1821)',
      light: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
    },
    transitions: {
      default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  defaultRadius: 'md',
  black: '#121212',
  white: '#ffffff',
});
