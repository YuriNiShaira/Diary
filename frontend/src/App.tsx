import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinPage from './pages/JoinPage';
import Dashboard from './pages/Dashboard';
import YearDetailPage from './pages/YearDetailPage';
import BucketListPage from './pages/BucketListPage';
import MemoryCalendarPage from './pages/MemoryCalendarPage'; // If you have this
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // ✅ ADD THIS
import RomanticBackground from './components/RomanticBackground';
import './index.css';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> 
        <AuthProvider>
          <Router>
            <div className="relative min-h-screen">
              <RomanticBackground />
              <div className="relative z-10">
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: '#FFF5F5',
                      color: '#FF6B6B',
                      border: '1px solid #FFB7B2',
                    },
                  }}
                />
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/join" element={<JoinPage />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/year/:yearId" element={
                    <PrivateRoute>
                      <YearDetailPage />
                    </PrivateRoute>
                  } />
                  <Route path="/bucketlist" element={
                    <PrivateRoute>
                      <BucketListPage />
                    </PrivateRoute>
                  } />
                  <Route path="/calendar" element={
                    <PrivateRoute>
                      <MemoryCalendarPage />
                    </PrivateRoute>
                  } />
                </Routes>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>  
    </QueryClientProvider>
  );
}

export default App;