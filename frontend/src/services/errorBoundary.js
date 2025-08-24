import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isServerError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if the error has a response with status >= 500
    if (error?.response?.status >= 500) {
      return { hasError: true, isServerError: true };
    }
    return { hasError: true, isServerError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.isServerError) {
      if (window.location.pathname !== "/") {
        window.location.href = "/"; // redirect only for 500+ errors
      }
      return null;
    }

    // if (this.state.hasError) {
    //   // For non-500 errors, just show fallback
    //   return <h2>Something went wrong. Please try again.</h2>;
    // }

    return this.props.children;
  }
}

export default ErrorBoundary;
