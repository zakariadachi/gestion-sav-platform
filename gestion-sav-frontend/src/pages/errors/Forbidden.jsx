import React from 'react';
import ErrorState from '../../components/ui/ErrorState';

export default function Forbidden() {
    return (
        <ErrorState 
            code="403"
            title="Access Denied"
            description="You do not have permission to view this page."
            actionText="Go Back"
        />
    );
}
