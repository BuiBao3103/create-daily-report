const LOCAL_KEY = 'local_message_chat_bot';

// message inteface
export interface ChatMessage {
	sender: 'user' | 'bot';
	message: string;
}

// chat session inteface
export interface ChatSession {
	session_id: string;
	message: ChatMessage[];
}

// init value chat session
const defaultMessage: ChatMessage = {
	sender: 'bot',
	message:
		'Chào bạn! Trò chuyện này được thiết kế để hỗ trợ các câu hỏi liên quan đến báo cáo hàng ngày về nhiệm vụ, thực tập sinh và vắng mặt. Bạn có muốn truy vấn thông tin gì từ báo cáo hàng ngày?',
};

// get chat sesstion from local storage
export function LoadChatBotLocalSession(): ChatSession {
	const raw = localStorage.getItem(LOCAL_KEY);
	if (raw) {
		try {
			return JSON.parse(raw) as ChatSession;
		} catch {
			// Dữ liệu hỏng → reset
		}
	}

	return {
		session_id: '',
		message: [defaultMessage],
	};
}

// save chat session to local storage
function SaveSession(session: ChatSession) {
	localStorage.setItem(LOCAL_KEY, JSON.stringify(session));
}

// add new message to chat session
export function ChatBotLocalStore_AddMessage(newMessage: ChatMessage) {
	const session = LoadChatBotLocalSession();

	const updatedMessages =
		session.message.length >= 50
			? [...session.message.slice(1), newMessage]
			: [...session.message, newMessage];

	SaveSession({
		...session,
		message: updatedMessages,
	});
}

// get or create chat session id
export function ChatBotLocalStore_GetOrCreateSessionId(): string {
	const session = LoadChatBotLocalSession();

	if (!session.session_id) {
		session.session_id = crypto.randomUUID();
		SaveSession(session);
	}

	return session.session_id;
}

// reset message and new session id => new chat session
export function ChatBotLocalStore_ResetSession() {
	const newSession: ChatSession = {
		session_id: crypto.randomUUID(),
		message: [defaultMessage],
	};

	SaveSession(newSession);
}

// reset all chat session data
export function ChatBotLocalStore_ResetData() {
	const session: ChatSession = {
		session_id: '',
		message: [defaultMessage],
	};

	SaveSession(session);
}

// only reset message
export function ChatBotLocalStore_JustClearMessage() {
	const session = LoadChatBotLocalSession();
	session.message = [];
	SaveSession(session);
}
