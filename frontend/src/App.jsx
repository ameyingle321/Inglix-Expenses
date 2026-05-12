import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './features/auth/LandingPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ExpensesPage from './features/expenses/ExpensesPage';
import ContactsPage from './features/contacts/ContactsPage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import Layout from './components/Layout';

import { ProtectedRoute, AuthRoute } from './components/ui/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Landing / Auth Page */}
          <Route 
            path="/" 
            element={
              <AuthRoute>
                <LandingPage />
              </AuthRoute>
            } 
          />
          
          {/* Protected App Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
