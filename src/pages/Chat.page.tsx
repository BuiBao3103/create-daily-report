import React, { FormEvent, useEffect, useState } from 'react';
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
  Paper,
  ScrollArea,
  SegmentedControl,
  TextInput,
  Title,
} from '@mantine/core';
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
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartData, setChartData] = useState<ChartData<ChartType>>({
    labels: [],
    datasets: [],
  });

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

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    setChatHistory((prev) => [...prev, { sender: 'user', message: userMessage }]);
    setChatInput('');

    // 👉 MOCK phản hồi AI
    // setTimeout(() => {
    //   setChatHistory((prev) => [
    //     ...prev,
    //     { sender: 'bot', message: 'Đây là phản hồi mẫu từ AI (dùng mock).' },
    //   ]);
    // }, 500);

    // ✅ Khi dùng thật:

    fetch('http://localhost:5678/webhook-test/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
      .then((res) => res.json())
      .then((result) => {
        setChatHistory((prev) => [  
          ...prev,
          { sender: 'bot', message: result.response },
        ]);
      });
  };

  return (
    <Container fluid px={0} style={{ height: '100vh', display: 'flex' }}>
      <ColorSchemeToggle />

      {/* Chat Section */}
      <Box
        style={{
          flex: 1,
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        <Title order={3} mb="md">
          Chat với AI
        </Title>

        <ScrollArea style={{ flex: 1, marginBottom: '1rem' }}>
          {chatHistory.map((msg, i) => (
            <Paper
              key={i}
              shadow="xs"
              p="xs"
              mb="sm"
              withBorder
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <b>{msg.sender === 'user' ? 'Bạn' : 'AI'}:</b> {msg.message}
            </Paper>
          ))}
        </ScrollArea>

        <form onSubmit={handleChatSubmit}>
          <Group>
            <TextInput
              value={chatInput}
              onChange={(e) => setChatInput(e.currentTarget.value)}
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1 }}
            />
            <Button type="submit">Gửi</Button>
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
