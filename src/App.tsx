import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Registration } from './pages/Registration';
import { Examination } from './pages/Examination';
import { Payment } from './pages/Payment';
import { Pharmacy } from './pages/Pharmacy';
import { Report } from './pages/Report';
import { VisitorPortal } from './pages/VisitorPortal';
import { UsersPage } from './pages/Users';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { currentUser } = useClinic();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/visitor" element={<VisitorPortal />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/registration" element={
          <ProtectedRoute allowedRoles={['admin', 'kasir']}>
            <Registration />
          </ProtectedRoute>
        } />
        <Route path="/examination" element={
          <ProtectedRoute allowedRoles={['admin', 'dokter']}>
            <Examination />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['admin', 'kasir']}>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['admin', 'apoteker']}>
            <Pharmacy />
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Report />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ClinicProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClinicProvider>
  );
}

export default App;
