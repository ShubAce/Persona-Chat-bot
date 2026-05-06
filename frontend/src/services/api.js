import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000",
});

// Personas API
export const personasAPI = {
	getAll: () => api.get("/personas"),
	getById: (id) => api.get(`/personas/${id}`),
};

// Chat API
export const chatAPI = {
	getSessions: () => api.get("/chat/sessions"),
	getSession: (sessionId) => api.get(`/chat/sessions/${sessionId}`),
	sendMessage: (data) => {
		const formData = new FormData();
		formData.append("persona_id", data.persona_id);
		formData.append("message", data.message);
		if (data.session_id) {
			formData.append("session_id", data.session_id);
		}
		return api.post("/chat", formData);
	},
	streamMessage: (data, abortSignal) => {
		const formData = new FormData();
		formData.append("persona_id", data.persona_id);
		formData.append("message", data.message);
		if (data.session_id) {
			formData.append("session_id", data.session_id);
		}
		return fetch(`${api.defaults.baseURL}/chat/stream`, {
			method: "POST",
			body: formData,
			signal: abortSignal,
			headers: {
				Accept: "text/event-stream",
			},
		});
	},
	deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
};

export default api;
