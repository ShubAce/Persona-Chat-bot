import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-gray-50">
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
					<div className="container mx-auto">
						<h1 className="text-2xl font-bold">Persona Chat Bot - College Project</h1>
						<p className="text-blue-100">Chat with historical figures and famous personalities</p>
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
