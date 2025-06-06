import { ActionIcon, Menu } from '@mantine/core';
import {
    IconMessageChatbot,
    IconMessageCog
} from '@tabler/icons-react';
import { ChatBotLocalStore_ResetSession } from '../store/ChatBotLocalStore';
import { RefObject } from 'react';


interface ChatBotToolMenuProps {
    messageBoxRef: RefObject<{
        updateLoading: (loading: boolean) => void,
        reloadChatBox: () => void,
    }>,
    loading: boolean
}


export default function ChatBotToolMenu({ loading, messageBoxRef }: ChatBotToolMenuProps) {
    return (
        <Menu shadow="md" width={210} position="top-start" disabled={loading}>
            <Menu.Target>
                <ActionIcon variant="transparent">
                    <IconMessageCog style={{ width: "3.5rem", height: "3.5rem" }} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Công cụ</Menu.Label>
                <Menu.Item
                    leftSection={<IconMessageChatbot size={14} />}
                    onClick={() => {
                        ChatBotLocalStore_ResetSession();;
                        messageBoxRef.current?.reloadChatBox();
                    }}
                >
                    Bắt đầu đoạn chat mới
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}