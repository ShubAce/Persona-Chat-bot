import React, { useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { personasAPI, chatAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
	MagnifyingGlassIcon,
	UserCircleIcon,
	ChatBubbleLeftRightIcon,
	ClockIcon,
	ArrowRightOnRectangleIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Dashboard = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [showSearchDropdown, setShowSearchDropdown] = useState(false);
	const personaGridRef = useRef(null);
	const navigate = useNavigate();

	// Fetch personas
	const {
		data: personas = [],
		isLoading: personasLoading,
		error: personasError,
	} = useQuery("personas", () => personasAPI.getAll().then((res) => res.data), {
		onError: (error) => {
			toast.error("Failed to load personas. Please check if the backend is running.");
		},
		retry: 3,
		retryDelay: 1000,
	});

	// Fetch recent chat sessions
	const { data: recentSessions = [] } = useQuery("recent-sessions", () => chatAPI.getSessions().then((res) => res.data.slice(0, 5)), {
		enabled: true,
		retry: 1,
	});

	// Get unique categories/professions
	const categories = ["All", ...new Set(personas.map((p) => p.profession).filter(Boolean))];

	// Filter personas
	const filteredPersonas = personas.filter((persona) => {
		const matchesSearch =
			persona.name.toLowerCase().includes(searchTerm.toLowerCase()) || persona.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === "All" || persona.profession === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	// Search suggestions (show when typing)
	const searchSuggestions =
		searchTerm.length > 0 ? personas.filter((persona) => persona.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8) : [];

	// Popular personas for quick access
	const popularPersonas = personas
		.filter((persona) => ["Albert Einstein", "William Shakespeare", "Leonardo da Vinci", "Marie Curie", "Mahatma Gandhi"].includes(persona.name))
		.slice(0, 6);

	const professionCount = Math.max(categories.length - 1, 0);
	const recentSessionCount = recentSessions.length;

	const handleScrollToPersonas = () => {
		personaGridRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const startRandomChat = () => {
		if (personas.length === 0) return;
		const randomPersona = personas[Math.floor(Math.random() * personas.length)];
		if (randomPersona?.id) {
			startChat(randomPersona.id);
		}
	};

	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
		setShowSearchDropdown(true);
	};

	const selectSearchSuggestion = (persona) => {
		setSearchTerm(persona.name);
		setShowSearchDropdown(false);
	};

	const clearSearch = () => {
		setSearchTerm("");
		setShowSearchDropdown(false);
	};

	const startChat = (personaId) => {
		navigate(`/chat/${personaId}`);
	};

	const continueChat = (personaId, sessionId) => {
		if (personaId && sessionId) {
			navigate(`/chat/${personaId}/${sessionId}`);
		} else {
			toast.error("Unable to continue chat - invalid session");
		}
	};

	if (personasLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-transparent">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="mt-4 text-slate-600 dark:text-slate-300">Loading historical figures...</p>
				</div>
			</div>
		);
	}

	if (personasError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-transparent">
				<div className="text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Unable to Load Personas</h2>
					<p className="text-slate-600 dark:text-slate-300 mb-4">Please check if the backend server is running on port 8000.</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-transparent">
			{/* Header */}
			<header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
								<ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
							</div>
							<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Persona Chat</h1>
						</div>

						<div className="flex items-center space-x-4">
							<div className="hidden items-center text-sm text-slate-600 sm:flex dark:text-slate-300">
								<UserCircleIcon className="h-5 w-5 mr-2" />
								<span>Historical Figure Chat Bot</span>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<section className="mb-10">
					<div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
						<div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/20" />
						<div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />
						<div className="relative grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
							<div className="space-y-5">
								<div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
									<SparklesIcon className="h-4 w-4 text-primary-500" />
									Interactive historical chat
								</div>
								<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">Talk to history, not just about it.</h2>
								<p className="max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
									Explore iconic minds through short, focused conversations. Each persona stays in character and within their
									historical era.
								</p>
								<div className="flex flex-wrap gap-3">
									<button
										type="button"
										onClick={startRandomChat}
										disabled={personas.length === 0}
										className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
									>
										Start a random chat
									</button>
									<button
										type="button"
										onClick={handleScrollToPersonas}
										className="btn-secondary shadow-sm hover:shadow transform hover:scale-105 transition-all duration-200"
									>
										Browse all personas
									</button>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-md dark:border-slate-800 dark:bg-slate-950/70 hover:shadow-lg transition-shadow">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Personas</p>
									<p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{personas.length}</p>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across science, art, and politics</p>
								</div>
								<div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-md dark:border-slate-800 dark:bg-slate-950/70 hover:shadow-lg transition-shadow">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Professions</p>
									<p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{professionCount}</p>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Curated with context</p>
								</div>
								<div className="col-span-2 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-md dark:border-slate-800 dark:bg-slate-950/70 hover:shadow-lg transition-shadow">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recent chats</p>
									<p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{recentSessionCount}</p>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Resume past conversations anytime</p>
								</div>
							</div>
						</div>
					</div>
				</section>
				{/* Recent Chats Section */}
				{recentSessions.length > 0 && (
					<div className="mb-8">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
							<ClockIcon className="h-5 w-5 mr-2" />
							Recent Conversations
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{recentSessions
								.filter((session) => session && session.persona) // Filter out sessions without personas
								.map((session) => (
									<div
										key={session.id}
										onClick={() =>
											session.persona?.id ? continueChat(session.persona.id, session.id) : toast.error("Invalid session data")
										}
										className="persona-card"
									>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
													{session.persona?.name || "Unknown Persona"}
												</h3>
												<p className="text-sm text-slate-600 dark:text-slate-300 truncate">
													{session.title || "Untitled Chat"}
												</p>
												<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
													{session.message_count || 0} messages •{" "}
													{session.updated_at ? new Date(session.updated_at).toLocaleDateString() : "Unknown date"}
												</p>
											</div>
											<div className="ml-3 flex-shrink-0">
												<ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Search and Filter */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
							<input
								type="text"
								placeholder="Search personas (e.g., Einstein, Shakespeare, Gandhi)..."
								className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-400"
								value={searchTerm}
								onChange={handleSearchChange}
								onFocus={() => setShowSearchDropdown(true)}
								onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
							/>
							{searchTerm && (
								<button
									onClick={clearSearch}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300"
								>
									×
								</button>
							)}

							{/* Search Dropdown */}
							{showSearchDropdown && (
								<div className="search-dropdown">
									{searchTerm.length > 0 ? (
										// Show search results
										searchSuggestions.length > 0 ? (
											searchSuggestions.map((persona) => (
												<div
													key={persona.id}
													className="search-dropdown-item"
												>
													<div className="flex items-center justify-between">
														<div
															className="flex-1"
															onClick={() => selectSearchSuggestion(persona)}
														>
															<div className="font-medium text-slate-900 dark:text-slate-100">{persona.name}</div>
															<div className="text-sm text-slate-600 dark:text-slate-300">
																{persona.profession}
																{persona.birth_year && persona.death_year && (
																	<span className="ml-2">
																		({persona.birth_year} - {persona.death_year})
																	</span>
																)}
															</div>
														</div>
														<button
															onClick={() => {
																setShowSearchDropdown(false);
																startChat(persona.id);
															}}
															className="ml-3 chat-button"
														>
															Chat Now
														</button>
													</div>
												</div>
											))
										) : (
											<div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
												No personas found matching "{searchTerm}". Try searching for names like Einstein, Shakespeare, or
												Gandhi.
											</div>
										)
									) : (
										// Show popular personas when no search term
										<>
											<div className="search-dropdown-header">Popular Historical Figures</div>
											{popularPersonas.length > 0 ? (
												popularPersonas.map((persona) => (
													<div
														key={persona.id}
														className="search-dropdown-item"
													>
														<div className="flex items-center justify-between">
															<div
																className="flex-1"
																onClick={() => selectSearchSuggestion(persona)}
															>
																<div className="font-medium text-slate-900 dark:text-slate-100">{persona.name}</div>
																<div className="text-sm text-slate-600 dark:text-slate-300">
																	{persona.profession}
																	{persona.birth_year && persona.death_year && (
																		<span className="ml-2">
																			({persona.birth_year} - {persona.death_year})
																		</span>
																	)}
																</div>
															</div>
															<button
																onClick={() => {
																	setShowSearchDropdown(false);
																	startChat(persona.id);
																}}
																className="ml-3 chat-button"
															>
																Chat Now
															</button>
														</div>
													</div>
												))
											) : (
												<div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
													No popular personas available. Database might be empty.
												</div>
											)}
										</>
									)}
								</div>
							)}
						</div>
						<select
							className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
						>
							{categories.map((category) => (
								<option
									key={category}
									value={category}
								>
									{category}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Personas Grid */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
						Choose a Historical Figure ({filteredPersonas.length} available)
					</h2>

					{filteredPersonas.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-slate-500 dark:text-slate-400">No personas found matching your search.</p>
						</div>
					) : (
						<div
							ref={personaGridRef}
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						>
							{filteredPersonas.map((persona) => (
								<div
									key={persona.id}
									onClick={() => startChat(persona.id)}
									className="persona-card group transform hover:scale-105 transition-all duration-200"
								>
									<div className="relative mb-4">
										<div className="w-full h-48 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md group-hover:shadow-lg transition-shadow flex items-center justify-center overflow-hidden">
											{persona.image_url ? (
												<>
													<img
														src={persona.image_url}
														alt={persona.name}
														className="w-full h-full object-cover"
														onLoad={(e) => {
															e.target.nextElementSibling.style.display = "none";
														}}
														onError={(e) => {
															e.target.style.display = "none";
															e.target.nextElementSibling.style.display = "flex";
														}}
													/>
													<div className="text-white text-4xl font-bold flex items-center justify-center w-full h-full">
														{persona.name[0]}
													</div>
												</>
											) : (
												<div className="text-white text-4xl font-bold flex items-center justify-center w-full h-full">
													{persona.name[0]}
												</div>
											)}
										</div>
										<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
									</div>

									<div className="space-y-2">
										<h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
											{persona.name}
										</h3>

										<div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
											<span>{persona.profession}</span>
											{persona.birth_year && persona.death_year && (
												<span className="ml-2">
													({persona.birth_year} - {persona.death_year})
												</span>
											)}
										</div>

										{persona.nationality && <p className="text-sm text-slate-500 dark:text-slate-400">{persona.nationality}</p>}

										<p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{persona.description}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
					<p>Chat with AI simulations of history's most influential figures.</p>
					<p className="mt-1">Powered by advanced language models and historical knowledge.</p>
				</footer>
			</div>
		</div>
	);
};

export default Dashboard;
