import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FacebookLoginComponent from './components/FacebookLogin';
import FacebookLoginStatic from './components/FacebookLoginStatic';
import AuthCallback from './components/AuthCallback';
import CreateGiveaway from './components/CreateGiveaway';
import GiveawayPage from './components/GiveawayPage';
import Dashboard from './components/Dashboard';
import ResultPage from './components/ResultPage';
import LoadingSpinner from './components/LoadingSpinner';
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletionInstructions from './components/DataDeletionInstructions';
import MyGiveaways from './components/MyGiveaways';
import Footer from './components/Footer';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/create" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <main>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <FacebookLoginStatic />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/auth/callback" 
                element={<AuthCallback />} 
              />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreateGiveaway />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-giveaways" 
                element={
                  <ProtectedRoute>
                    <MyGiveaways />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/giveaway/:hash" 
                element={<GiveawayPage />} 
              />
              <Route 
                path="/giveaway/:hash/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/giveaway/:hash/result" 
                element={<ResultPage />} 
              />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/data-deletion-instructions" element={<DataDeletionInstructions />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
