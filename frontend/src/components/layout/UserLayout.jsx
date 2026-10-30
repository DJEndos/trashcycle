import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Clock, MapPin, User } from 'lucide-react';

const TABS = [['/home', 'Home', Home], ['/history', 'History', Clock], ['/map', 'Map', MapPin], ['/profile', 'Profile', User]];

export default function UserLayout() {
  const { pathname } = useLocation();
  const showNav = TABS.some(([p]) => p === pathname);
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-xl">
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}><Outlet /></main>
      {showNav && (
        <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white pb-[env(safe-area-inset-bottom)]">
          {TABS.map(([to, label, I]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-eco' : 'text-slate-400'}`}>
              <I size={21} />{label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
