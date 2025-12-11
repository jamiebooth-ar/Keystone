import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import PredictionTool from './components/PredictionTool';
import CurrentCampaigns from './components/CurrentCampaigns';
import Locations from './pages/Locations';
import Orders from './pages/Orders';
import Marketing from './pages/Marketing';
import Analytics from './pages/Analytics';
import Emailer from './pages/Emailer';
import ContentBuilder from './pages/ContentBuilder';
import Contacts from './pages/Contacts';
import PlaceholderPage from './pages/PlaceholderPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout>
              <Events />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/predictor"
        element={
          <ProtectedRoute>
            <Layout>
              <PredictionTool />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Layout>
              <CurrentCampaigns />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <Layout>
              <Locations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing"
        element={
          <ProtectedRoute>
            <Layout>
              <Marketing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/emailer"
        element={
          <ProtectedRoute>
            <Layout>
              <Emailer />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <Layout>
              <ContentBuilder />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Contacts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Contacts />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Placeholder Pages for Subheaders */}
      <Route
        path="/fam"
        element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fap"
        element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
