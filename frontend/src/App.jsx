import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import PublicRoute from './components/routing/PublicRoute.jsx';
import UserLayout from './components/layout/UserLayout.jsx';
import Welcome from './pages/public/Welcome.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import TermsOfUse from './pages/legal/TermsOfUse.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import Home from './pages/user/Home.jsx';
import SchedulePickup from './pages/user/SchedulePickup.jsx';
import WasteCategories from './pages/user/WasteCategories.jsx';
import TrackPickup from './pages/user/TrackPickup.jsx';
import History from './pages/user/History.jsx';
import DropOffMap from './pages/user/DropOffMap.jsx';
import Profile from './pages/user/Profile.jsx';
import Notifications from './pages/user/Notifications.jsx';
import Tutorial from './pages/user/Tutorial.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
      {/* Legal pages are open to everyone, signed in or not */}
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<UserLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/schedule" element={<SchedulePickup />} />
          <Route path="/categories" element={<WasteCategories />} />
          <Route path="/track/:id?" element={<TrackPickup />} />
          <Route path="/history" element={<History />} />
          <Route path="/map" element={<DropOffMap />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tutorial" element={<Tutorial />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="admin" />}><Route path="/admin" element={<AdminDashboard />} /></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
