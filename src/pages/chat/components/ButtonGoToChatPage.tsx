
import { ActionIcon, Affix, useMantineColorScheme } from '@mantine/core';
import { IconPencil, IconRobot } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';


export default function ButtonGoToChatPage() {
    const { colorScheme } = useMantineColorScheme();
    const navigate = useNavigate();
    const location = useLocation();

    const styleActionIcon = {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: colorScheme === 'dark' ? '#222' : 'rgba(0, 8, 255, 0.03)',
        transition: 'all 0.3s ease',
        height: 38,
        padding: "5px 10px 5px 7px",
    }

    return (
        <Affix position={{ top: 10, right: 80 }} zIndex={2000}>
            {location.pathname === '/chat-ai'
                ? <ActionIcon
                    variant="light"
                    size="xxl"
                    style={styleActionIcon}
                    onClick={() => navigate('//')}
                >
                    <IconPencil style={{ paddingRight: 5 }} size={31} stroke={1.3} /> Write Daily
                </ActionIcon>
                : <ActionIcon
                    variant="light"
                    size="xxl"
                    style={styleActionIcon}
                    onClick={() => navigate('/chat-ai')}
                >
                    <IconRobot style={{ paddingRight: 5 }} size={31} stroke={1.3} /> AI Chat
                </ActionIcon>
            }
        </Affix>
    );
} 
