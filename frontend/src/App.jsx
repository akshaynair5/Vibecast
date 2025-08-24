import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import Register from './pages/register';
import { useContext, useEffect, useState } from 'react';
import axiosInstance from './services/axiosInstance';
import { Authcontext } from './contextProvider';
import Profile from './pages/profile';
import logout from './services/logout';
import MusicPlayer from './components/currentPlayer';
import UserProfile from './pages/userProfile';
import LiveStream from './components/liveStreamLocal';
import LiveStreamListener from './components/liveStreamRemote';
import SettingsPage from './pages/settings';
import LandingPage from './pages/landingPage';

export default function App() {
  const { currentUser, setCurrentUser, loading, setLoading, currentAudio, currentLiveStream, setCurrentLiveStream, currentRemoteAudio } = useContext(Authcontext);
  const [apiHealthy, setApiHealthy] = useState(true); // Assume healthy until checked

  // Health check on app load
  useEffect(() => {
    const healthCheck = async () => {
      try {
        await axiosInstance.get('/health-check');
        console.log("API is healthy");
        setApiHealthy(true);
      } catch (error) {
        console.error("API is not reachable", error);
        setApiHealthy(false);
      }
    };
    healthCheck();
  }, []);

  // Refresh tokens and initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await axiosInstance.post('/users/refresh-token');
        const user = response.data.message.user;
        setCurrentUser(user);
      } catch (error) {
        console.error("Session initialization failed:", error);
        setCurrentUser(null);
        localStorage.removeItem('userData');
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser && !loading) {
      initializeSession();
    }
  }, [currentUser]);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300 text-sm font-medium">Loading...</p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return <Navigate to="/Login" />;
    }

    return children;
  };

  // If API is down, always redirect to landing
  if (!apiHealthy && window.location.pathname !== '/') {
    return <LandingPage />;
  }

  return (
    <BrowserRouter basename="/">
      <div>
        {/* Conditionally render the MusicPlayer */}
        {currentAudio.audio && <MusicPlayer />}
        {currentLiveStream?.description && <LiveStream />}
        {currentRemoteAudio?.description && <LiveStreamListener stream={currentRemoteAudio} />}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route
            path="/Home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":username"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
