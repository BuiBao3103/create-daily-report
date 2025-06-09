import {
    Affix,
    Container,
    Title,
} from '@mantine/core';
import ChatBotMessageBox from './components/ChatBotMessageBox';
import ChatBotForm from './components/ChatBotForm';
import { useRef } from 'react';

export default function ChatPage() {
    const messageBoxRef = useRef<{
        updateLoading: (loading: boolean) => void,
        reloadChatBox: () => void,
    }>(null);

    return (
        <Container fluid mx="10%" pb={150} pt={90}>
            <Affix
                w="100%"
                style={{ backgroundColor: 'var(--mantine-color-body)' }}
                position={{ top: 0, left: "10%" }}
                zIndex={99}
            >
                <Title order={3} my="md">
                    Chat với AI
                </Title>
            </Affix>
            <ChatBotMessageBox ref={messageBoxRef} />
            <ChatBotForm messageBoxRef={messageBoxRef} />
        </Container>
    );
}