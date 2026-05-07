import React from "react";
import classNames from "classnames";

const LoadingSpinner = ({ size = "md", className = "" }) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};

	return (
		<div className={classNames("flex items-center justify-center", className)}>
			<div
				className={classNames(
					"animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-400",
					sizeClasses[size],
				)}
			/>
		</div>
	);
};

export default LoadingSpinner;