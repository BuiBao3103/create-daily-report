import { useState } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Container, Grid, Paper, Title } from '@mantine/core';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { DailyReportForm } from '../components/DailyReport/DailyReportForm';
import { DailyReportOutput } from '../components/DailyReport/DailyReportOutput';
import { DailyReportData } from '@/Utils/enums/DailyEnum/DailyReportForm.types';
import { DailyReportProvider } from '../components/DailyReport/context/DailyReportContext';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const getDefaultReportData = (): DailyReportData => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (today.getDay() === 1) {
    yesterday.setDate(today.getDate() - 3);
  }

  return {
    date: today,
    intern_name: '',
    is_intern: false,
    yesterdayDate: yesterday,
    todayDate: today,
    yesterdayTasks: [],
    todayTasks: [],
    waitingForTask: false,
  };
};

export function HomePage() {
  const [reportData, setReportData] = useState<DailyReportData>(getDefaultReportData());

  const handleSubmit = (data: DailyReportData) => {
    setReportData(data);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px',
        background: 'var(--mantine-color-body)',
        transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Container
        size="xl"
        style={{
          width: '100%',
          maxWidth: '1200px',
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        <ColorSchemeToggle />
        <Title
          order={1}
          ta="center"
          mb="xl"
          c="blue.6"
          style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          Báo cáo hàng ngày
        </Title>
        <DailyReportProvider onSubmit={handleSubmit}>
          <Grid gutter={0} style={{ height: 'calc(100vh - 30px)', maxHeight: '800px' }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                p="md"
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <DailyReportForm />
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                p="md"
                style={{
                  minHeight: '100%',
                  height: 'auto',
                  overflowY: 'auto',
                  background: 'var(--mantine-color-body)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderTopRightRadius: 16,
                  borderBottomRightRadius: 16,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <DailyReportOutput data={reportData} />
              </Paper>
            </Grid.Col>
          </Grid>
        </DailyReportProvider>
      </Container>
    </Box>
  );
}
