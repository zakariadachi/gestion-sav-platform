import React from 'react';
import ErrorState from './ui/ErrorState';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ height: '100vh', width: '100vw' }}>
                    <ErrorState 
                        code="500"
                        title="System Error"
                        description="Something went wrong on our end. Please try refreshing."
                        actionText="Reload Page"
                        onAction={() => window.location.reload()}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
