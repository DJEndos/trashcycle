import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { homePathFor } from '../../utils/navigation.js';

// Welcome / login / register: signed-in users are sent on to their home screen.
export default function PublicRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner />;
  return user ? <Navigate to={homePathFor(user)} replace /> : children;
}
