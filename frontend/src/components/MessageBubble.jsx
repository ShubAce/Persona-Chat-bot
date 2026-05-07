import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

const MessageBubble = ({ message, persona }) => {
	const isUser = message.role === "user";

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.2 }}
			className={`chat-message ${isUser ? "message-user" : "message-assistant"}`}
		>
			<div className={`flex items-end space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
				{!isUser && (
					<div className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden ring-2 ring-white/50 dark:ring-slate-800">
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
				)}

				<div className="flex flex-col max-w-full">
					{!isUser && persona?.name && <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 px-1 font-medium">{persona.name}</span>}

					<div className={`${isUser ? "message-bubble-user" : "message-bubble-assistant"}`}>
						{isUser ? (
							<p className="text-sm leading-relaxed">{message.content}</p>
						) : (
							<>
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										code({ node, inline, className, children, ...props }) {
											const match = /language-(\w+)/.exec(className || "");
											return !inline && match ? (
												<SyntaxHighlighter
													style={tomorrow}
													language={match[1]}
													PreTag="div"
													className="rounded-md !my-2 shadow-lg"
													{...props}
												>
													{String(children).replace(/\n$/, "")}
												</SyntaxHighlighter>
											) : (
												<code
													className="bg-slate-100 dark:bg-slate-800 dark:text-slate-100 px-1.5 py-0.5 rounded text-sm font-medium"
													{...props}
												>
													{children}
												</code>
											);
										},
										p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
										ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
										ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
										li: ({ children }) => <li className="mb-1">{children}</li>,
										blockquote: ({ children }) => (
											<blockquote className="border-l-4 border-primary-300 pl-4 italic my-2 bg-slate-50 dark:bg-slate-800/60 py-2 rounded-r">
												{children}
											</blockquote>
										),
										h1: ({ children }) => (
											<h1 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100">{children}</h1>
										),
										h2: ({ children }) => (
											<h2 className="text-md font-bold mb-2 text-slate-800 dark:text-slate-100">{children}</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-sm font-bold mb-1 text-slate-800 dark:text-slate-100">{children}</h3>
										),
										strong: ({ children }) => (
											<strong className="font-semibold text-slate-800 dark:text-slate-100">{children}</strong>
										),
										em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
									}}
									className="text-sm prose prose-sm max-w-none dark:prose-invert"
								>
									{message.content || ""}
								</ReactMarkdown>
								{message.isStreaming ? (
									message.content ? (
										<span className="streaming-cursor" />
									) : (
										<span className="loading-dots text-slate-400 dark:text-slate-500">
											<div></div>
											<div></div>
											<div></div>
										</span>
									)
								) : null}
							</>
						)}
					</div>

					<div
						className={`text-xs mt-1 opacity-70 px-1 ${
							isUser ? "text-right text-slate-600 dark:text-slate-400" : "text-slate-500 dark:text-slate-400"
						}`}
					>
						{formatTime(message.created_at)}
					</div>
				</div>

				{isUser && (
					<div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white/50 dark:ring-slate-800">
						<span className="text-white text-xs font-medium">You</span>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default MessageBubble;
