import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { personasAPI, chatAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import MessageBubble from "../components/MessageBubble";
import ChatSidebar from "../components/ChatSidebar";
import { PaperAirplaneIcon, ArrowLeftIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ChatPage = () => {
	const { personaId, sessionId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [currentSessionId, setCurrentSessionId] = useState(sessionId ? parseInt(sessionId) : null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	// Validate personaId early
	useEffect(() => {
		if (!personaId || isNaN(parseInt(personaId))) {
			console.error("Invalid persona ID:", personaId);
			toast.error("Invalid persona selected");
			navigate("/");
			return;
		}
	}, [personaId, navigate]);

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
		}
	);

	// Send message mutation
	const sendMessageMutation = useMutation((messageData) => chatAPI.sendMessage(messageData), {
		onSuccess: (response) => {
			// Replace the temporary user message with the one from database (with correct timestamp)
			if (response.data && response.data.user_message) {
				setMessages((prev) => {
					// Remove the temporary user message (last one) and add both messages from database
					const withoutTemp = prev.slice(0, -1);
					const newMessages = [];

					// Add user message with database timestamp
					newMessages.push(response.data.user_message);

					// Add AI message with database timestamp
					if (response.data.ai_message) {
						newMessages.push(response.data.ai_message);
					}

					return [...withoutTemp, ...newMessages];
				});
			}

			// Update session ID if provided
			if (response.data && response.data.session_id) {
				setCurrentSessionId(response.data.session_id);

				// Update URL if this is a new session
				if (!sessionId) {
					navigate(`/chat/${personaId}/${response.data.session_id}`, { replace: true });
				}

				// Invalidate queries to refresh sidebar
				queryClient.invalidateQueries("recent-sessions");
				queryClient.invalidateQueries(["session", response.data.session_id]);
			}
		},
		onError: (error) => {
			toast.error("Failed to send message");
			console.error("Send message error:", error);
		},
	});

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!message.trim() || sendMessageMutation.isLoading) return;

		// Validate persona ID before proceeding
		if (!personaId || isNaN(parseInt(personaId))) {
			toast.error("Invalid persona selected");
			navigate("/");
			return;
		}

		const messageText = message.trim();
		setMessage("");

		// Add user message immediately
		const userMessage = {
			id: Date.now(),
			role: "user",
			content: messageText,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, userMessage]);

		// Send to API
		sendMessageMutation.mutate({
			message: messageText,
			persona_id: parseInt(personaId),
			session_id: currentSessionId,
		});
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
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

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
					<p className="text-gray-500">Persona not found</p>
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
		<div className="h-screen flex bg-gray-50">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed lg:relative lg:flex flex-col w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
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
				<header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
					<button
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden mr-3 p-2 rounded-md hover:bg-gray-100"
					>
						<Bars3Icon className="h-5 w-5" />
					</button>

					<button
						onClick={() => navigate("/")}
						className="mr-3 p-2 rounded-md hover:bg-gray-100"
					>
						<ArrowLeftIcon className="h-5 w-5" />
					</button>

					<div className="flex items-center flex-1">
						{personaLoading ? (
							<>
								<div className="w-10 h-10 rounded-full mr-3 bg-gray-200 animate-pulse"></div>
								<div>
									<div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
									<div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
								</div>
							</>
						) : persona ? (
							<>
								<div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
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
									<h1 className="font-semibold text-gray-900">{persona.name || "Unknown Persona"}</h1>
									<p className="text-sm text-gray-500">
										{persona.profession || "Unknown"} • {persona.nationality || "Unknown"}
									</p>
								</div>
							</>
						) : (
							<div>
								<h1 className="font-semibold text-gray-900">Persona Not Found</h1>
								<p className="text-sm text-gray-500">Unable to load persona details</p>
							</div>
						)}
					</div>
				</header>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-gray-50 to-white">
					<div className="max-w-4xl mx-auto space-y-1">
						{messages.map((msg, index) => (
							<MessageBubble
								key={msg.id || index}
								message={msg}
								persona={persona}
							/>
						))}

						{sendMessageMutation.isLoading && (
							<div className="flex justify-start mb-6">
								<div className="flex items-end space-x-3">
									<div className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow-sm bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
										{persona?.image_url ? (
											<img
												src={persona.image_url}
												alt={persona?.name || "AI"}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = "none";
													e.target.nextElementSibling.style.display = "flex";
												}}
											/>
										) : null}
										<span
											className="text-white text-sm font-medium"
											style={{ display: persona?.image_url ? "none" : "flex" }}
										>
											{persona?.name?.[0] || "AI"}
										</span>
									</div>
									<div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
										<div className="flex items-center space-x-1">
											<div className="flex space-x-1">
												<div
													className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
													style={{ animationDelay: "0ms" }}
												></div>
												<div
													className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
													style={{ animationDelay: "150ms" }}
												></div>
												<div
													className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
													style={{ animationDelay: "300ms" }}
												></div>
											</div>
											<span className="text-xs text-gray-500 ml-2">{persona?.name} is typing...</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					<div ref={messagesEndRef} />
				</div>

				{/* Message input */}
				<div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
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
									className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32 bg-gray-50 focus:bg-white transition-colors"
									rows="1"
									disabled={sendMessageMutation.isLoading}
								/>
								{message.trim() && <div className="absolute right-3 top-3 text-xs text-gray-400">{message.length}/1000</div>}
							</div>
							<button
								type="submit"
								disabled={!message.trim() || sendMessageMutation.isLoading}
								className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
							>
								<PaperAirplaneIcon className="h-5 w-5" />
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
