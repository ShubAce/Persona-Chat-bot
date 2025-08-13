import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MessageBubble = ({ message, persona }) => {
	const isUser = message.role === "user";

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className={`chat-message ${isUser ? "message-user" : "message-assistant"}`}>
			<div className={`flex items-end space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
				{!isUser && (
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
				)}

				<div className="flex flex-col max-w-full">
					{!isUser && persona?.name && <span className="text-xs text-gray-500 mb-1 px-1">{persona.name}</span>}

					<div className={`${isUser ? "message-bubble-user" : "message-bubble-assistant"}`}>
						{isUser ? (
							<p className="text-sm leading-relaxed">{message.content}</p>
						) : (
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
												className="rounded-md !my-2"
												{...props}
											>
												{String(children).replace(/\n$/, "")}
											</SyntaxHighlighter>
										) : (
											<code
												className="bg-gray-100 px-1 py-0.5 rounded text-sm"
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
										<blockquote className="border-l-4 border-primary-200 pl-4 italic my-2 bg-gray-50 py-2 rounded-r">
											{children}
										</blockquote>
									),
									h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-800">{children}</h1>,
									h2: ({ children }) => <h2 className="text-md font-bold mb-2 text-gray-800">{children}</h2>,
									h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-800">{children}</h3>,
									strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
									em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
								}}
								className="text-sm prose prose-sm max-w-none"
							>
								{message.content}
							</ReactMarkdown>
						)}
					</div>

					<div className={`text-xs mt-1 opacity-70 px-1 ${isUser ? "text-right text-gray-600" : "text-gray-500"}`}>
						{formatTime(message.created_at)}
					</div>
				</div>

				{isUser && (
					<div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
						<span className="text-white text-xs font-medium">You</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageBubble;
