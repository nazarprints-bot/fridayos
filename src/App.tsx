import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';

// Pages (to be created)
import { Login } from './pages/Login';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { AddSchool } from './pages/AddSchool';
import { SchoolDashboard } from './pages/SchoolDashboard';
import { Students } from './pages/Students';
import { StudentLedger } from './pages/StudentLedger';
import { CollectFee } from './pages/CollectFee';
import { Receipt } from './pages/Receipt';
import { PendingFees } from './pages/PendingFees';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'super_admin' | 'school_admin' }) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/" replace />;

  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'super_admin' ? '/super-admin' : '/school-admin'} replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRole="super_admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/add-school" element={
          <ProtectedRoute allowedRole="super_admin">
            <AddSchool />
          </ProtectedRoute>
        } />

        {/* School Admin Routes */}
        <Route path="/school-admin" element={
          <ProtectedRoute allowedRole="school_admin">
            <SchoolDashboard />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/students" element={
          <ProtectedRoute allowedRole="school_admin">
            <Students />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/students/:id" element={
          <ProtectedRoute allowedRole="school_admin">
            <StudentLedger />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/collect-fee" element={
          <ProtectedRoute allowedRole="school_admin">
            <CollectFee />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/receipt/:id" element={
          <ProtectedRoute allowedRole="school_admin">
            <Receipt />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/pending-fees" element={
          <ProtectedRoute allowedRole="school_admin">
            <PendingFees />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/reports" element={
          <ProtectedRoute allowedRole="school_admin">
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/school-admin/settings" element={
          <ProtectedRoute allowedRole="school_admin">
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
