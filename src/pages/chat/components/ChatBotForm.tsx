
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
            //             "text": "# Tiêu đề cấp 1\n\n## Tiêu đề cấp 2\n\n### Tiêu đề cấp 3" +
            //                 "\n\n---\n\n**Đây là chữ đậm**\n\n*Đây là chữ nghiêng*\n\n" +
            //                 "***Đây là chữ vừa đậm vừa nghiêng***\n\n~~Đây là chữ bị gạch ngang~~\n\n" +
            //                 "[Đây là một liên kết](https://example.com)\n\n---\n\n" +
            //                 "### 🔢 Danh sách có thứ tự (Ordered List)\n\n" +
            //                 "1. Mục số một\n2. Mục số hai\n3. Mục số ba\n   1. Mục con 1\n   2. Mục con 2\n\n---\n\n" +
            //                 "### 🔘 Danh sách không thứ tự (Unordered List)\n\n" +
            //                 "- Táo\n- Chuối\n- Cam\n  - Cam sành\n  - Cam xoàn\n\n---\n\n" +
            //                 "### 📋 Trích dẫn\n\n> Đây là một đoạn trích dẫn.\n> Nó có thể dài nhiều dòng.\n\n" +
            //                 "---\n\n### 🧱 Code nội dòng\n\nCâu lệnh `npm install` dùng để cài đặt gói." +
            //                 "\n\n---\n\n### 🧩 Khối code (Code block)\n\n```js\nfunction sayHello(name) {\n  console.log(\"Hello, \" + name);\n}\n```" +
            //                 "\n\n---\n\n### 📊 Bảng\n\n| Tên   | Tuổi | Nghề nghiệp     |\n|--------|------|----------------|" +
            //                 "\n| An     | 25   | Kỹ sư phần mềm |\n| Bình   | 30   | Thiết kế UI/UX |\n| Chi    | 28   | Marketing       |" +
            //                 "\n\n---\n\n### 📌 Hình ảnh\n\n![OpenAI Logo](https://storage.googleapis.com/support-kms-prod/5Af3SzwJLJ3lRVhBbtUjZbzPtXuIUj7xzeJw)" +
            //                 "\n\n---\n\n### ✅ Task list\n\n- [x] Viết tài liệu\n- [ ] Tạo giao diện\n- [ ] Kiểm thử\n\n---\n\n" +
            //                 "### 🔣 HTML trong Markdown\n\n<div style=\"color: red; font-weight: bold;\">Bạn có thể dùng HTML nếu trình phân tích hỗ trợ</div>"
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