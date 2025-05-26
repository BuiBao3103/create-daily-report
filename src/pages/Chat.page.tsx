import React, { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Box,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import baseAxios from '@/api/baseAxios';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

type ChatMessage = {
  sender: 'user' | 'bot';
  message: string;
};

type ChartType = 'line' | 'bar' | 'doughnut';

export default function ChatPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartData, setChartData] = useState<ChartData<ChartType>>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    // 👉 MOCK dữ liệu giống như API trả về từ n8n
    const mockResponse = {
      type: 'bar' as ChartType,
      labels: ['Intern', 'Full-time', 'Freelance'],
      data: [40, 30, 30],
    };

    setChartType(mockResponse.type);
    setChartData({
      labels: mockResponse.labels,
      datasets: [
        {
          label: 'Tỉ lệ nhân sự',
          data: mockResponse.data,
          backgroundColor: ['#4dc9f6', '#f67019', '#f53794'],
          borderColor: '#3e95cd',
          borderWidth: 1,
        },
      ],
    });

    // ✅ Khi dùng thật:
    /*
    fetch('https://your-n8n-domain/webhook/chart-data')
      .then((res) => res.json())
      .then(({ type, labels, data }) => {
        setChartType(type);
        setChartData({
          labels,
          datasets: [
            {
              label: 'Tỉ lệ nhân sự',
              data,
              backgroundColor: ['#4dc9f6', '#f67019', '#f53794'],
              borderColor: '#3e95cd',
              borderWidth: 1,
            },
          ],
        });
      });
    */
  }, []);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    setChatHistory((prev) => [...prev, { sender: 'user', message: userMessage }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5678/webhook-test/chat', {
        message: userMessage,
        sessionId,
      });
      setChatHistory((prev) => [...prev, { sender: 'bot', message: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid px={0} style={{ height: '100vh', display: 'flex' }}>
      <ColorSchemeToggle />

      {/* Chat Section */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          backgroundColor:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)',
        }}
      >
        <Title order={3} mb="md" c={colorScheme === 'dark' ? 'white' : 'dark'}>
          Chat với AI
        </Title>

        <ScrollArea style={{ flex: 1, marginBottom: '1rem' }}>
          <Stack gap="md">
            {chatHistory.map((msg, i) => (
              <Box
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  shadow="xs"
                  p="md"
                  withBorder
                  style={{
                    maxWidth: '70%',
                    backgroundColor:
                      msg.sender === 'user'
                        ? colorScheme === 'dark'
                          ? 'var(--mantine-color-blue-9)'
                          : 'var(--mantine-color-blue-1)'
                        : colorScheme === 'dark'
                          ? 'var(--mantine-color-dark-6)'
                          : 'var(--mantine-color-gray-1)',
                  }}
                >
                  <Stack gap="xs">
                    <Text size="sm" fw={500} c={colorScheme === 'dark' ? 'gray.4' : 'dimmed'}>
                      {msg.sender === 'user' ? 'Bạn' : 'AI'}
                    </Text>
                    <Box
                      style={{
                        color: colorScheme === 'dark' ? 'white' : 'dark',
                        '& ul': {
                          marginLeft: '1.5rem',
                          marginTop: '0.5rem',
                          marginBottom: '0.5rem',
                        },
                        '& li': {
                          marginBottom: '0.25rem',
                        },
                        '& strong': {
                          fontWeight: 700,
                        },
                      }}
                    >
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <Paper
                  shadow="xs"
                  p="md"
                  withBorder
                  style={{
                    backgroundColor:
                      colorScheme === 'dark'
                        ? 'var(--mantine-color-dark-6)'
                        : 'var(--mantine-color-gray-1)',
                  }}
                >
                  <Group gap="xs">
                    <Loader size="sm" color={colorScheme === 'dark' ? 'white' : 'blue'} />
                    <Text c={colorScheme === 'dark' ? 'gray.4' : 'dimmed'}>AI đang trả lời...</Text>
                  </Group>
                </Paper>
              </Box>
            )}
          </Stack>
        </ScrollArea>

        <form onSubmit={handleChatSubmit}>
          <Group>
            <TextInput
              value={chatInput}
              onChange={(e) => setChatInput(e.currentTarget.value)}
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1 }}
              disabled={isLoading}
              styles={{
                input: {
                  backgroundColor: colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'white',
                  color: colorScheme === 'dark' ? 'white' : 'dark',
                },
              }}
            />
            <Button
              type="submit"
              loading={isLoading}
              variant={colorScheme === 'dark' ? 'light' : 'filled'}
            >
              Gửi
            </Button>
          </Group>
        </form>
      </Box>

      {/* Chart Section */}
      {/* <Box style={{ flex: 1, padding: '20px' }}>
        <Group mb="md">
          <Title order={3}>Biểu đồ từ dữ liệu</Title>
          <SegmentedControl
            value={chartType}
            onChange={(val) => setChartType(val as ChartType)}
            data={[
              { label: 'Line', value: 'line' },
              { label: 'Bar', value: 'bar' },
              { label: 'Doughnut', value: 'doughnut' },
            ]}
          />
        </Group>

        {chartType === 'bar' && <Bar data={chartData as ChartData<'bar'>} />}
        {chartType === 'line' && <Line data={chartData as ChartData<'line'>} />}
        {chartType === 'doughnut' && <Doughnut data={chartData as ChartData<'doughnut'>} />}
      </Box> */}
    </Container>
  );
}
