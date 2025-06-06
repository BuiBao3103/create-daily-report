import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/transitions.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import Layout from './pages/layout';

export default function App() {
    return (
        <MantineProvider
            theme={theme}
            defaultColorScheme="dark"
        >
            <Layout>
                <Router />
            </Layout>
        </MantineProvider>
    );
}
