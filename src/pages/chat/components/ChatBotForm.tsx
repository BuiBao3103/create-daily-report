
import { Affix, Button, Flex, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ChatBotLocalStore_AddMessage, ChatBotLocalStore_GetOrCreateSessionId, ChatMessage } from "../store/ChatBotLocalStore";
import { RefObject, useEffect, useRef } from "react";
import ChatBotToolMenu from "./ChatBotToolMenu";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ChatBoxFormProps {
    messageBoxRef: RefObject<{
        updateLoading: (loading: boolean) => void,
        reloadChatBox: () => void,
    }>
}

export default function ChatBotForm({ messageBoxRef }: ChatBoxFormProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm<ChatMessage>({
        initialValues: {
            message: "",
            sender: "user",
        },
    });

    const mutation = useMutation({
        mutationFn: async (value: ChatMessage) => {
            updateLoading(true);
            ChatBotLocalStore_AddMessage(value);
            form.reset();
            // demo loading KHI GẮN API NHỚ BỎ KẺO TỐN THÊM 2 GIÂY
            // await new Promise(resolve => setTimeout(resolve, 2000));    
            // return {
            //     data: [
            //         {
            //             "text": "Trong *tháng 4/2025* có các sự kiện sau:\n1. **HD\\_NHOM\\_19:** Tham gia thực hiện phiếu phản hồi thông tin về môn học và giảng viên (đánh giá giảng viên trực tuyến), từ 09/04/2025 đến 20/04/2025.\n2. **HD\\_NHOM\\_123:** Ý thức chấp hành các nội quy, quy chế và các quy định của nhà trường, từ 07/04/2025 đến 09/04/2025.\n3. **Da:** test, diễn ra vào 23/04/2025."
            //         },
            //     ]
            // }
            return await axios.post('https://930a-210-245-33-111.ngrok-free.app/webhook/daily-report', {
                message: value.message,
                sessionId: ChatBotLocalStore_GetOrCreateSessionId(),
            });
        },
        onSuccess: (response) => {
            updateLoading(false);
            if (response.data) {
                const messages = response.data;
                messages.forEach((msg: { text: string }) => {
                    ChatBotLocalStore_AddMessage(
                        createBotMessage(msg.text)
                    )
                });
            } else {
                ChatBotLocalStore_AddMessage(
                    createBotMessage("Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.")
                );
            }
        },
        onError: (error: any) => {
            updateLoading(false);
            const isNetworkError = error.isAxiosError && !error.response;
            ChatBotLocalStore_AddMessage(
                createBotMessage(isNetworkError
                    ? "Hiện tại không thể kết nối với máy chủ."
                    : "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
                )
            );
        },
    });

    // create bot message
    const createBotMessage = (message: string): ChatMessage => {
        return {
            message,
            sender: "bot",
        }
    }

    // handle submit
    const handleChatSubmit = form.onSubmit((values) => {
        const message = values.message.trim();
        if (message !== "") {
            values.message = message;
            mutation.mutate(values)
        }
    });

    // udpate loading function
    const updateLoading = (l: boolean) => {
        messageBoxRef.current?.updateLoading(l);
    }

    // handle enter keydown
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    };

    useEffect(() => {
        textareaRef.current?.focus();
    }, [mutation.isPending]);

    return (
        <Affix
            w="100%"
            style={{ backgroundColor: 'var(--mantine-color-body)' }}
            position={{ bottom: 0, left: 0 }}
        >
            <form onSubmit={handleChatSubmit}>
                <Flex
                    justify="center"
                    align="center"
                    direction="row"
                    px="10%"
                    gap={4}
                    mb={20}
                    mt={5}
                >
                    <ChatBotToolMenu loading={mutation.isPending} messageBoxRef={messageBoxRef} />
                    <Textarea
                        ref={textareaRef}
                        autosize
                        minRows={1}
                        maxRows={5}
                        w="90%"
                        placeholder="Nhập tin nhắn..."
                        disabled={mutation.isPending}
                        onKeyDown={handleKeyDown}
                        {...form.getInputProps("message")}
                    />
                    <Button
                        type="submit"
                        loading={mutation.isPending}
                    >
                        Gửi
                    </Button>
                </Flex>
            </form>
        </Affix>
    );
}