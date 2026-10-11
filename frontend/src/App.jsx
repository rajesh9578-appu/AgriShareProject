import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyOTP from './pages/public/VerifyOTP';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import SeasonalTrends from './pages/public/SeasonalTrends';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProfile from './pages/farmer/FarmerProfile';
import ResourceSearch from './pages/farmer/ResourceSearch';
import ResourceDetails from './pages/farmer/ResourceDetails';
import MyRequests from './pages/farmer/MyRequests';
import MyBookings from './pages/farmer/MyBookings';
import SavedResources from './pages/farmer/SavedResources';
import AIAssistant from './pages/farmer/AIAssistant';
import AIRequirementAnalyzer from './pages/farmer/AIRequirementAnalyzer';
import AIRecommendations from './pages/farmer/AIRecommendations';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyResources from './pages/owner/MyResources';
import AddEditResource from './pages/owner/AddEditResource';
import OwnerRequests from './pages/owner/OwnerRequests';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerIntelligence from './pages/owner/OwnerIntelligence';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerification from './pages/admin/AdminVerification';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBookings from './pages/admin/AdminBookings';

// Protected Route Guard
// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin access bypass
  if (user.role === 'admin') {
    return children;
  }

  // Admin-only route guard
  if (allowedRoles.includes('admin') && user.role !== 'admin') {
    return <Navigate to="/farmer/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/search" element={<ResourceSearch />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/requirement-analyzer" element={<AIRequirementAnalyzer />} />
                <Route path="/seasonal-trends" element={<SeasonalTrends />} />

                {/* Common User Dashboard (Seeker & Provider) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/dashboard"
                  element={
                    <ProtectedRoute>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Resource Seeker Routes */}
                <Route
                  path="/farmer/profile"
                  element={
                    <ProtectedRoute>
                      <FarmerProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/saved"
                  element={
                    <ProtectedRoute>
                      <SavedResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-recommendations"
                  element={
                    <ProtectedRoute>
                      <AIRecommendations />
                    </ProtectedRoute>
                  }
                />

                {/* Resource Provider Routes */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/resources"
                  element={
                    <ProtectedRoute>
                      <MyResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/resources/new"
                  element={
                    <ProtectedRoute>
                      <AddEditResource />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/resources/edit/:id"
                  element={
                    <ProtectedRoute>
                      <AddEditResource />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/requests"
                  element={
                    <ProtectedRoute>
                      <OwnerRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <ProtectedRoute>
                      <OwnerBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/intelligence"
                  element={
                    <ProtectedRoute>
                      <OwnerIntelligence />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminVerification />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminBookings />
                    </ProtectedRoute>
                  }
                />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
