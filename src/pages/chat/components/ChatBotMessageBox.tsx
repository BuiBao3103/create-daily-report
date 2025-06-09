import { Stack, Paper, Group, Loader, Text, TypographyStylesProvider, useMantineColorScheme } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { LoadChatBotLocalSession } from "../store/ChatBotLocalStore";
import ButtonCopyMessage from "./ButtonCopyMessage";

const ChatBotMessageBox = forwardRef((_props, ref) => {
    // state
    const [isLoading, setLoading] = useState(false);
    const [reloadChatBox, setReloadChatBox] = useState(false);
    // ref
    const scrollRef = useRef<HTMLDivElement>(null);
    const copyButtonRefs = useRef<any[]>([]);
    // other
    const { colorScheme } = useMantineColorScheme();
    const messages = LoadChatBotLocalSession().message;

    useImperativeHandle(ref, () => ({
        updateLoading: (loading: boolean) => setLoading(loading),
        reloadChatBox: () => setReloadChatBox(!reloadChatBox)
    }));

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    return (
        <Stack display="flex" gap="xl">
            {messages.map((msg, i) => (
                <Group
                    key={i}
                    justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                >
                    <Paper
                        radius="md"
                        shadow="xs"
                        p="lg"
                        withBorder
                        maw="75%"
                        bg={colorScheme === 'dark'
                            ? msg.sender === 'user' ? '#323232d9' : '#303339a3'
                            : ''
                        }
                        style={{
                            position: 'relative',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                        }}
                        onMouseEnter={() => copyButtonRefs.current[i]?.setVisible(true)}
                        onMouseLeave={() => copyButtonRefs.current[i]?.setVisible(false)}
                    >
                        <ButtonCopyMessage key={i} value={msg.message} ref={(el) => (copyButtonRefs.current[i] = el)} />
                        <TypographyStylesProvider>
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <div>{children}</div>,
                                    ol: ({ children }) => <ol style={{ paddingLeft: "2rem", marginTop: 2, marginBottom: 2 }}>{children}</ol>,
                                    li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                                }}
                            >
                                {msg.message.replace(/\n/g, "  \n")}
                            </ReactMarkdown>
                        </TypographyStylesProvider>
                    </Paper>
                </Group>
            ))}
            {isLoading &&
                <Group>
                    <Paper
                        shadow="xs"
                        p="md"
                        withBorder
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                        <Loader size="sm" mr={10} />
                        <Text>AI đang trả lời...</Text>
                    </Paper>
                </Group>
            }
            <div ref={scrollRef} />
        </Stack>
    )
});

ChatBotMessageBox.displayName = "ChatBotMessageBox";
export default ChatBotMessageBox;