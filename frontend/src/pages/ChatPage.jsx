import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { personasAPI, chatAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import MessageBubble from "../components/MessageBubble";
import ChatSidebar from "../components/ChatSidebar";
import { AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, ArrowLeftIcon, Bars3Icon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ChatPage = () => {
	const { personaId, sessionId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [currentSessionId, setCurrentSessionId] = useState(sessionId ? parseInt(sessionId) : null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const streamAbortRef = useRef(null);

	// Validate personaId early
	useEffect(() => {
		if (!personaId || isNaN(parseInt(personaId))) {
			console.error("Invalid persona ID:", personaId);
			toast.error("Invalid persona selected");
			navigate("/");
			return;
		}
	}, [personaId, navigate]);

	useEffect(() => {
		return () => {
			streamAbortRef.current?.abort();
		};
	}, []);

	// Fetch persona
	const {
		data: persona,
		isLoading: personaLoading,
		error: personaError,
	} = useQuery(["persona", personaId], () => personasAPI.getById(parseInt(personaId)).then((res) => res.data), {
		enabled: !!personaId && !isNaN(parseInt(personaId)),
		onError: (error) => {
			console.error("Persona fetch error:", error);
			toast.error("Failed to load persona");
			navigate("/");
		},
	});

	// Fetch session if sessionId exists
	const { data: session, isLoading: sessionLoading } = useQuery(
		["session", currentSessionId],
		() => chatAPI.getSession(currentSessionId).then((res) => res.data),
		{
			enabled: !!currentSessionId && !isNaN(currentSessionId),
			onSuccess: (data) => {
				if (data && data.messages) {
					setMessages(data.messages || []);
				}
			},
			onError: (error) => {
				console.error("Session fetch error:", error);
				toast.error("Failed to load chat session");
				setCurrentSessionId(null); // Reset session ID on error
			},
		},
	);

	const updateMessageById = (messageId, updater) => {
		setMessages((prev) =>
			prev.map((msg) => (msg.id === messageId ? { ...msg, ...(typeof updater === "function" ? updater(msg) : updater) } : msg)),
		);
	};

	const processEventStream = async (response, handlers) => {
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Streaming not supported by the browser");
		}
		const decoder = new TextDecoder("utf-8");
		let buffer = "";

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			let boundaryIndex = buffer.indexOf("\n\n");
			while (boundaryIndex !== -1) {
				const rawEvent = buffer.slice(0, boundaryIndex).trim();
				buffer = buffer.slice(boundaryIndex + 2);
				if (rawEvent) {
					rawEvent.split("\n").forEach((line) => {
						if (!line.startsWith("data:")) return;
						const payloadText = line.replace(/^data:\s*/, "").trim();
						if (!payloadText) return;
						let payload;
						try {
							payload = JSON.parse(payloadText);
						} catch (parseError) {
							return;
						}
						handlers.onEvent?.(payload);
					});
				}
				boundaryIndex = buffer.indexOf("\n\n");
			}
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!message.trim() || isStreaming) return;

		// Validate persona ID before proceeding
		if (!personaId || isNaN(parseInt(personaId))) {
			toast.error("Invalid persona selected");
			navigate("/");
			return;
		}

		const messageText = message.trim();
		setMessage("");

		const nowIso = new Date().toISOString();
		const tempUserId = `temp-user-${Date.now()}`;
		const tempAssistantId = `temp-assistant-${Date.now()}`;
		let activeSessionId = currentSessionId;

		setMessages((prev) => [
			...prev,
			{ id: tempUserId, client_id: tempUserId, role: "user", content: messageText, created_at: nowIso, isTemp: true },
			{ id: tempAssistantId, client_id: tempAssistantId, role: "assistant", content: "", created_at: nowIso, isStreaming: true },
		]);

		setIsStreaming(true);
		const abortController = new AbortController();
		streamAbortRef.current = abortController;

		try {
			const response = await chatAPI.streamMessage(
				{
					message: messageText,
					persona_id: parseInt(personaId),
					session_id: currentSessionId,
				},
				abortController.signal,
			);

			if (!response.ok) {
				throw new Error("Failed to start streaming response");
			}

			await processEventStream(response, {
				onEvent: (payload) => {
					if (payload.type === "meta") {
						if (payload.user_message) {
							updateMessageById(tempUserId, {
								...payload.user_message,
								isTemp: false,
							});
						}

						if (payload.session_id) {
							activeSessionId = payload.session_id;
							setCurrentSessionId(payload.session_id);
							if (!sessionId) {
								navigate(`/chat/${personaId}/${payload.session_id}`, { replace: true });
							}
						}
					}

					if (payload.type === "token" && payload.text) {
						updateMessageById(tempAssistantId, (msg) => ({
							content: `${msg.content}${payload.text}`,
						}));
					}

					if (payload.type === "error") {
						updateMessageById(tempAssistantId, {
							content: "Sorry, I couldn't generate a response right now.",
							isStreaming: false,
						});
						setIsStreaming(false);
						toast.error(payload.message || "Streaming error");
					}

					if (payload.type === "done") {
						if (payload.ai_message) {
							updateMessageById(tempAssistantId, {
								...payload.ai_message,
								isStreaming: false,
							});
						}
						setIsStreaming(false);
						queryClient.invalidateQueries("recent-sessions");
						if (payload.ai_message?.id && activeSessionId) {
							queryClient.invalidateQueries(["session", activeSessionId]);
						}
					}
				},
			});
			setIsStreaming(false);
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("Streaming error:", error);
				toast.error("Failed to stream response");
				updateMessageById(tempAssistantId, {
					content: "Sorry, I couldn't generate a response right now.",
					isStreaming: false,
				});
			}
			setIsStreaming(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(e);
		}
	};

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [message]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
	}, [messages, isStreaming]);

	// Initialize with greeting if new session
	useEffect(() => {
		if (persona && !sessionId && messages.length === 0) {
			setMessages([
				{
					id: "greeting",
					role: "assistant",
					content: `Greetings! I am ${persona.name}. I am delighted to make your acquaintance. What would you like to discuss with me?`,
					created_at: new Date().toISOString(),
				},
			]);
		}
	}, [persona, sessionId, messages.length]);

	if (personaLoading || (sessionId && sessionLoading)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!persona) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-slate-500 dark:text-slate-400">Persona not found</p>
					<button
						onClick={() => navigate("/")}
						className="mt-4 btn-primary"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen flex bg-transparent chat-shell">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed lg:relative lg:flex flex-col w-80 bg-white/95 border-r border-slate-200/70 dark:bg-slate-950/95 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				}`}
			>
				<ChatSidebar
					currentPersonaId={personaId ? parseInt(personaId) : null}
					currentSessionId={currentSessionId}
					onClose={() => setSidebarOpen(false)}
				/>
			</div>

			{/* Main chat area */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="bg-white/90 border-b border-slate-200/70 px-4 py-3 flex items-center backdrop-blur dark:bg-slate-950/80 dark:border-slate-800 shadow-sm">
					<button
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
					>
						<Bars3Icon className="h-5 w-5" />
					</button>

					<button
						onClick={() => navigate("/")}
						className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
					>
						<ArrowLeftIcon className="h-5 w-5" />
					</button>

					<div className="flex items-center flex-1">
						{personaLoading ? (
							<>
								<div className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-slate-800 animate-pulse shadow-inner"></div>
								<div>
									<div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-32 mb-1 animate-pulse"></div>
									<div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-24 animate-pulse"></div>
								</div>
							</>
						) : persona ? (
							<>
								<div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-white/50 dark:ring-slate-800">
									{persona.image_url ? (
										<img
											src={persona.image_url}
											alt={persona.name || "Persona"}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.style.display = "none";
												e.target.nextElementSibling.style.display = "flex";
											}}
										/>
									) : null}
									<span
										className="text-white text-sm font-medium"
										style={{ display: persona.image_url ? "none" : "flex" }}
									>
										{persona.name?.[0] || "P"}
									</span>
								</div>
								<div>
									<h1 className="font-semibold text-slate-900 dark:text-slate-100">{persona.name || "Unknown Persona"}</h1>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										{persona.profession || "Unknown"} • {persona.nationality || "Unknown"}
									</p>
								</div>
							</>
						) : (
							<div>
								<h1 className="font-semibold text-slate-900 dark:text-slate-100">Persona Not Found</h1>
								<p className="text-sm text-slate-500 dark:text-slate-400">Unable to load persona details</p>
							</div>
						)}
					</div>
				</header>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto px-4 py-6 bg-transparent chat-panel">
					<div className="max-w-4xl mx-auto space-y-1">
						<AnimatePresence initial={false}>
							{messages.map((msg, index) => (
								<MessageBubble
									key={msg.client_id || msg.id || index}
									message={msg}
									persona={persona}
								/>
							))}
						</AnimatePresence>
					</div>

					<div ref={messagesEndRef} />
				</div>

				{/* Message input */}
				<div className="border-t border-slate-200/70 bg-white/90 px-4 py-4 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
					<div className="max-w-4xl mx-auto">
						<form
							onSubmit={handleSendMessage}
							className="flex items-end space-x-3"
						>
							<div className="flex-1 relative">
								<textarea
									ref={textareaRef}
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder={persona?.name ? `Ask ${persona.name} something...` : "Type your message..."}
									className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32 bg-gray-50/80 focus:bg-white transition-colors dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-400 dark:focus:bg-slate-900/80 shadow-inner"
									rows="1"
									disabled={isStreaming}
								/>
								{message.trim() && (
									<div className="absolute right-3 top-3 text-xs text-slate-400 dark:text-slate-500">{message.length}/1000</div>
								)}
							</div>
							<button
								type="submit"
								disabled={!message.trim() || isStreaming}
								className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none dark:from-primary-500 dark:to-primary-400 dark:hover:from-primary-400 dark:hover:to-primary-300"
							>
								{isStreaming ? (
									<span className="loading-dots text-white">
										<div></div>
										<div></div>
										<div></div>
									</span>
								) : (
									<PaperAirplaneIcon className="h-5 w-5" />
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
