import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { login, register } = useAuth();

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isLogin) {
				await login(formData.username, formData.password);
			} else {
				if (formData.password !== formData.confirmPassword) {
					alert("Passwords do not match");
					return;
				}
				const success = await register(formData.username, formData.email, formData.password);
				if (success) {
					setIsLogin(true);
					setFormData({ username: "", email: "", password: "", confirmPassword: "" });
				}
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{isLogin ? "Sign in to your account" : "Create a new account"}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">Chat with history's greatest minds</p>
				</div>

				<form
					className="mt-8 space-y-6"
					onSubmit={handleSubmit}
				>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700"
							>
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								required
								className="input-field"
								placeholder="Enter your username"
								value={formData.username}
								onChange={handleInputChange}
							/>
						</div>

						{!isLogin && (
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									className="input-field"
									placeholder="Enter your email"
									value={formData.email}
									onChange={handleInputChange}
								/>
							</div>
						)}

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="input-field"
								placeholder="Enter your password"
								value={formData.password}
								onChange={handleInputChange}
							/>
						</div>

						{!isLogin && (
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700"
								>
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									className="input-field"
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={handleInputChange}
								/>
							</div>
						)}
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="w-full btn-primary flex justify-center items-center"
						>
							{loading ? <LoadingSpinner size="sm" /> : isLogin ? "Sign In" : "Sign Up"}
						</button>
					</div>

					<div className="text-center">
						<button
							type="button"
							onClick={() => setIsLogin(!isLogin)}
							className="text-primary-600 hover:text-primary-700 text-sm font-medium"
						>
							{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
						</button>
					</div>
				</form>

				<div className="mt-8 p-4 bg-blue-50 rounded-lg">
					<h3 className="text-sm font-medium text-blue-800 mb-2">Demo Account</h3>
					<p className="text-xs text-blue-600">You can create a new account or use the demo features to explore the application.</p>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
