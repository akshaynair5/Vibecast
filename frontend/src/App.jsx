import './App.css';
import {BrowserRouter,Navigate,Route, Routes} from 'react-router-dom'
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

export default function App() {
  const { currentUser, setCurrentUser, loading, setLoading, currentAudio, currentLiveStream, setCurrentLiveStream, currentRemoteAudio} = useContext(Authcontext);
  const [apiHealthy, setApiHealthy] = useState(false); // To check API health

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
        // Attempt to refresh the access token
        const response = await axiosInstance.post('/users/refresh-token');
        const user = response.data.message.user;
        setCurrentUser(user);
      } catch (error) {
        console.error("Session initialization failed:", error);
        setCurrentUser(null);
        localStorage.removeItem('userData');
        logout();
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    if (!currentUser && !loading) {
      initializeSession();
    }
  }, [currentUser]);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!currentUser) {
      return <Navigate to="/Login" />;
    }

    return children;
  };

  if (!apiHealthy) {
    return <div>API is currently unavailable. Please try again later.</div>;
  }

  return (
    <BrowserRouter basename="/">
      <div>
        {/* Conditionally render the MusicPlayer */}
        {currentAudio.audio && <MusicPlayer />}
        {currentLiveStream?.description && <LiveStream /> }
        {currentRemoteAudio?.description && <LiveStreamListener stream={currentRemoteAudio} />}

        {/* Routes */}
        <Routes>
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
                <SettingsPage/>
              </ProtectedRoute>
            }
          />
          <Route path=":username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}