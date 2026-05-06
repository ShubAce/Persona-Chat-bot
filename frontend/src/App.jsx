import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import ErrorBoundary from "./components/ErrorBoundary";

const THEME_STORAGE_KEY = "persona-theme";

const getInitialTheme = () => {
	if (typeof window === "undefined") return "light";
	const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	if (storedTheme === "light" || storedTheme === "dark") {
		return storedTheme;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
	const [theme, setTheme] = useState(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	const handleThemeToggle = () => {
		setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
	};

	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
				<div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-500 text-white shadow-lg dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
					<div className="pointer-events-none absolute inset-0 opacity-60">
						<div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
						<div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
					</div>
					<div className="container mx-auto flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<div>
							<h1 className="text-2xl font-bold sm:text-3xl">Persona Chat Bot</h1>
							<p className="text-sm text-white/90 sm:text-base">Chat with historical figures and explore their stories</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="hidden rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white sm:inline-flex">
								54+ personas
							</div>
							<button
								type="button"
								onClick={handleThemeToggle}
								className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
								aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
								title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
							>
								{theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
								<span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} mode</span>
							</button>
						</div>
					</div>
				</div>

				<Routes>
					<Route
						path="/"
						element={<Dashboard />}
					/>
					<Route
						path="/chat/:personaId"
						element={<ChatPage />}
					/>
					<Route
						path="/chat/:personaId/:sessionId"
						element={<ChatPage />}
					/>
					<Route
						path="*"
						element={
							<Navigate
								to="/"
								replace
							/>
						}
					/>
				</Routes>
			</div>
		</ErrorBoundary>
	);
}

export default App;
