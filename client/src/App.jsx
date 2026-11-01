import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import { useAuth } from './AuthContext.jsx';

// Practical 8: each page becomes its own JS chunk, downloaded only when visited
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const Assistant = lazy(() => import('./pages/Assistant.jsx'));
const AuthForm = lazy(() => import('./pages/AuthForm.jsx'));

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container">
        <Suspense fallback={<Spinner text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Navigate to={user ? '/tasks' : '/login'} replace />} />
            <Route path="/login" element={user ? <Navigate to="/tasks" replace /> : <AuthForm mode="login" />} />
            <Route path="/register" element={user ? <Navigate to="/tasks" replace /> : <AuthForm mode="register" />} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="*" element={<p>404 - Page not found</p>} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
