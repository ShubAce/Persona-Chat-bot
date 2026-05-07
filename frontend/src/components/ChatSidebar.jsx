import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { chatAPI, personasAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import { PlusIcon, ChatBubbleLeftRightIcon, TrashIcon, XMarkIcon, HomeIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ChatSidebar = ({ currentPersonaId, currentSessionId, onClose }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

	// Fetch chat sessions
	const { data: sessions = [], isLoading: sessionsLoading } = useQuery("chat-sessions", () => chatAPI.getSessions().then((res) => res.data), {
		onError: () => {
			toast.error("Failed to load chat sessions");
		},
	});

	// Fetch personas for new chat options
	const { data: personas = [] } = useQuery(
		"personas-sidebar",
		() => personasAPI.getAll().then((res) => res.data.slice(0, 10)), // Show top 10
		{
			onError: () => {
				console.error("Failed to load personas for sidebar");
			},
		},
	);

	// Delete session mutation
	const deleteSessionMutation = useMutation((sessionId) => chatAPI.deleteSession(sessionId), {
		onSuccess: () => {
			queryClient.invalidateQueries("chat-sessions");
			queryClient.invalidateQueries("recent-sessions");
			toast.success("Chat deleted successfully");
			setShowDeleteConfirm(null);

			// If we deleted the current session, navigate to home
			if (currentSessionId === showDeleteConfirm) {
				navigate("/");
			}
		},
		onError: () => {
			toast.error("Failed to delete chat");
			setShowDeleteConfirm(null);
		},
	});

	const handleNewChat = (personaId) => {
		navigate(`/chat/${personaId}`);
		onClose?.();
	};

	const handleSessionClick = (session) => {
		navigate(`/chat/${session.persona.id}/${session.id}`);
		onClose?.();
	};

	const handleDeleteSession = (sessionId) => {
		deleteSessionMutation.mutate(sessionId);
	};

	const handleGoHome = () => {
		navigate("/");
		onClose?.();
	};

	// Group sessions by persona
	const sessionsByPersona = sessions.reduce((acc, session) => {
		const personaId = session.persona.id;
		if (!acc[personaId]) {
			acc[personaId] = {
				persona: session.persona,
				sessions: [],
			};
		}
		acc[personaId].sessions.push(session);
		return acc;
	}, {});

	return (
		<div className="h-full flex flex-col bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
			{/* Header */}
			<div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
						<div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-2">
							<ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
						</div>
						Chats
					</h2>
					<button
						onClick={onClose}
						className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				<button
					onClick={handleGoHome}
					className="w-full mt-3 btn-secondary flex items-center justify-center text-sm shadow-sm"
				>
					<HomeIcon className="h-4 w-4 mr-2" />
					Back to Home
				</button>
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto">
				{/* Quick start new chats */}
				<div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
					<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Start New Chat</h3>
					<div className="space-y-2">
						{personas.slice(0, 5).map((persona) => (
							<button
								key={persona.id}
								onClick={() => handleNewChat(persona.id)}
								className="w-full flex items-center p-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/70 rounded-lg transition-all duration-200 group hover:shadow-md"
							>
								<div className="w-6 h-6 rounded-full mr-3 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden shadow-sm">
									{persona.image_url ? (
										<img
											src={persona.image_url}
											alt={persona.name}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.style.display = "none";
												e.target.nextElementSibling.style.display = "flex";
											}}
										/>
									) : null}
									<span
										className="text-white text-xs font-medium"
										style={{ display: persona.image_url ? "none" : "flex" }}
									>
										{persona.name[0]}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{persona.name}</p>
									<p className="text-xs text-slate-500 dark:text-slate-400 truncate">{persona.profession}</p>
								</div>
								<PlusIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2 transition-transform group-hover:scale-110" />
							</button>
						))}
					</div>
				</div>

				{/* Chat history */}
				<div className="p-4">
					<h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Chat History</h3>

					{sessionsLoading ? (
						<div className="flex justify-center py-4">
							<LoadingSpinner size="sm" />
						</div>
					) : sessions.length === 0 ? (
						<p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No chat history yet. Start a conversation!</p>
					) : (
						<div className="space-y-4">
							{Object.values(sessionsByPersona).map(({ persona, sessions: personaSessions }) => (
								<div key={persona.id}>
									<div className="flex items-center mb-2">
										<div className="w-5 h-5 rounded-full mr-2 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden shadow-sm">
											{persona.image_url ? (
												<img
													src={persona.image_url}
													alt={persona.name}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.target.style.display = "none";
														e.target.nextElementSibling.style.display = "flex";
													}}
												/>
											) : null}
											<span
												className="text-white text-xs font-medium"
												style={{ display: persona.image_url ? "none" : "flex" }}
											>
												{persona.name[0]}
											</span>
										</div>
										<h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{persona.name}</h4>
									</div>

									<div className="space-y-1 ml-7">
										{personaSessions.map((session) => (
											<div
												key={session.id}
												className={`group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:shadow-sm ${
													session.id === currentSessionId
														? "bg-primary-50/80 border border-primary-200 dark:bg-primary-500/10 dark:border-primary-400/40"
														: ""
												}`}
											>
												<div
													onClick={() => handleSessionClick(session)}
													className="flex-1 min-w-0"
												>
													<p
														className={`text-sm truncate ${
															session.id === currentSessionId
																? "text-primary-700 font-medium"
																: "text-slate-700 dark:text-slate-200"
														}`}
													>
														{session.title}
													</p>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														{session.message_count || 0} messages • {new Date(session.updated_at).toLocaleDateString()}
													</p>
												</div>

												<button
													onClick={(e) => {
														e.stopPropagation();
														setShowDeleteConfirm(session.id);
													}}
													className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
												>
													<TrashIcon className="h-4 w-4 text-red-500" />
												</button>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Delete confirmation modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
					<div className="bg-white/95 rounded-lg p-6 max-w-sm mx-4 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Delete Chat</h3>
						<p className="text-slate-600 dark:text-slate-300 mb-4">
							Are you sure you want to delete this chat? This action cannot be undone.
						</p>
						<div className="flex space-x-3">
							<button
								onClick={() => setShowDeleteConfirm(null)}
								className="flex-1 btn-secondary"
								disabled={deleteSessionMutation.isLoading}
							>
								Cancel
							</button>
							<button
								onClick={() => handleDeleteSession(showDeleteConfirm)}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
								disabled={deleteSessionMutation.isLoading}
							>
								{deleteSessionMutation.isLoading ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatSidebar;
