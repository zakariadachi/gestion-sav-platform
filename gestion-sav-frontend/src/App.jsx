import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import ClientManagement from './pages/ClientManagement';
import DashboardTechnicien from './pages/DashboardTechnicien';
import DashboardClient from './pages/DashboardClient';
import ClientKnowledgeBase from './pages/ClientKnowledgeBase';
import ClientReports from './pages/ClientReports';
import TicketDetail from './pages/TicketDetail';
import Tickets from './pages/Tickets';
import KnowledgeBaseManagement from './pages/KnowledgeBaseManagement';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AwaitingVerification from './pages/auth/AwaitingVerification';
import NotFound from './pages/errors/NotFound';
import Forbidden from './pages/errors/Forbidden';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { ROLES } from './constants/enums';
import { useAuth } from './context/AuthContext';

const RootRedirect = () => {
    const { user, isAuthenticated, isInitializing } = useAuth();
    
    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Chargement...</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'Admin') return <Navigate to="/dashboard" replace />;
    if (user?.role === 'Technician') return <Navigate to="/technicien" replace />;
    if (user?.role === 'Client') return <Navigate to="/client" replace />;
    
    return <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <ErrorBoundary>
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--dc-surface)',
                        color: 'var(--dc-text)',
                        border: '1px solid var(--dc-border)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 500,
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                }}
            />
            <Routes>
            {/* Root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/awaiting-verification" element={<AwaitingVerification />} />

            {/* Error Pages */}
            <Route path="/403" element={<Forbidden />} />

            {/* Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/equipe" element={<TeamManagement />} />
                <Route path="/clients" element={<ClientManagement />} />
                <Route path="/knowledge-base" element={<KnowledgeBaseManagement />} />
            </Route>

            {/* Technician Only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.TECHNICIAN]} />}>
                <Route path="/technicien" element={<DashboardTechnicien />} />
            </Route>

            {/* Admin & Technician Shared */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TECHNICIAN]} />}>
                <Route path="/tickets" element={<Tickets />} />
            </Route>

            {/* Client Only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
                <Route path="/client" element={<DashboardClient />} />
                <Route path="/client/knowledge-base" element={<ClientKnowledgeBase />} />
                <Route path="/client/reports" element={<ClientReports />} />
                <Route path="/client/ticket/:id" element={<TicketDetail />} />
            </Route>

            {/* Shared for all Authenticated Users */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.CLIENT]} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
            </Routes>
        </ErrorBoundary>
    );
};

export default App;
