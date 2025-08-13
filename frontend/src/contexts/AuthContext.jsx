// This file is no longer used in the simplified college project version
// All authentication has been removed for educational purposes

export const useAuth = () => {
	throw new Error("Authentication has been removed for this college project version");
};

export const AuthProvider = ({ children }) => {
	return children;
};
