import { useState } from 'react';
import { Container, Grid, Paper, Title, Box } from '@mantine/core';
import { keyframes } from '@emotion/react';
import { DailyReportForm, DailyReportData } from '../components/DailyReport/DailyReportForm';
import { DailyReportOutput } from '../components/DailyReport/DailyReportOutput';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export function HomePage() {
  const [reportData, setReportData] = useState<DailyReportData | undefined>();

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
          maxWidth: '900px',
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
          Báo Cáo Hàng Ngày
        </Title>
        <Grid gutter={0} style={{ height: 'calc(100vh - 30px)', maxHeight: '700px' }}>
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
              <DailyReportForm onSubmit={handleSubmit} />
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              p="md"
              style={{
                height: '100%',
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
      </Container>
    </Box>
  );
}
