import React from 'react';
import ErrorState from '../../components/ui/ErrorState';

export default function NotFound() {
    return (
        <ErrorState 
            code="404"
            title="Page Not Found"
            description="The page you are looking for doesn't exist or has been moved."
            actionText="Return Home"
        />
    );
}
