import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Log the error details
		console.error("Error caught by boundary:", error, errorInfo);
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});
	}

	render() {
		if (this.state.hasError) {
			// Custom error UI
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="max-w-md mx-auto text-center">
						<div className="text-red-500 text-6xl mb-4">😱</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
						<p className="text-gray-600 mb-4">We encountered an unexpected error. This might be due to:</p>
						<ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
							<li>• Backend server not running</li>
							<li>• Network connection issues</li>
							<li>• Missing or invalid data</li>
						</ul>
						<div className="space-y-3">
							<button
								onClick={() => window.location.reload()}
								className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
							>
								Reload Page
							</button>
							<button
								onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
								className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
							>
								Try Again
							</button>
						</div>
						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="mt-6 text-left">
								<summary className="text-sm font-medium text-gray-700 cursor-pointer">Technical Details (Development Mode)</summary>
								<pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-red-600">
									{this.state.error && this.state.error.toString()}
									<br />
									{this.state.errorInfo.componentStack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
