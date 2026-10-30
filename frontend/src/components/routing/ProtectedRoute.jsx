import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { homePathFor } from '../../utils/navigation.js';

// Only lets signed-in users with the given role through.
export default function ProtectedRoute({ role }) {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
}
