import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, Truck, MapPin, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useLive } from '../../hooks/useLive.js';
import { CatIcon } from '../../components/ui/CatIcon.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { fmtDate } from '../../utils/format.js';

export default function Home() {
  const { user } = useAuth(), nav = useNavigate();
  const stats = useFetch('/pickups/stats/me');
  const cats = useFetch('/categories');
  const next = useFetch('/pickups', { status: 'active', sort: 'upcoming', limit: 1 });
  const notes = useFetch('/notifications');
  const refresh = () => { next.reload(); stats.reload(); notes.reload(); };
  useLive('pickup:statusChanged', refresh);
  useLive('notification:new', () => notes.reload(), refresh);
  const n = next.data?.items?.[0];
  const quick = [['Schedule', Calendar, '/schedule'], ['Pickup', Truck, n ? `/track/${n._id}` : '/track'], ['Drop Off', MapPin, '/map'], ['Tutorial', BookOpen, '/tutorial']];
  return (
    <div className="space-y-5 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-eco-light font-bold text-eco">
          {user.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : user.name[0]}
        </div>
        <div className="flex-1"><p className="font-semibold">Hello, {user.name.split(' ')[0]}</p><p className="text-xs text-slate-500">Let's keep our environment clean!</p></div>
        <Link to="/notifications" aria-label="Notifications" className="relative p-2">
          <Bell size={22} />{notes.data?.unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
        </Link>
      </div>
      <section className="rounded-2xl bg-eco p-5 text-white">
        <p className="text-sm opacity-90">Total Waste Collected</p>
        {stats.loading ? <div className="mt-2 h-9 w-24 animate-pulse rounded bg-white/20" /> : (
          <p className="mt-1 text-4xl font-bold">{(stats.data?.thisMonthKg ?? 0).toFixed(1)} <span className="text-xl font-medium">kg</span></p>
        )}
        <div className="mt-1 flex items-center justify-between text-sm"><span>This month</span>
          {stats.data?.changePct != null && <span className="flex items-center gap-1"><TrendingUp size={14} />{stats.data.changePct}%</span>}
        </div>
      </section>
      <div className="grid grid-cols-4 gap-2">
        {quick.map(([l, I, to]) => (
          <button key={l} onClick={() => nav(to)} className="flex flex-col items-center gap-1.5 text-xs font-medium">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-eco-light text-eco"><I size={24} /></span>{l}
          </button>
        ))}
      </div>
      <section>
        <div className="mb-2 flex justify-between"><h2 className="font-semibold">Waste Categories</h2><Link to="/categories" className="text-xs font-medium text-eco">See all</Link></div>
        {cats.loading && <Spinner />}<ErrorBox msg={cats.error} retry={cats.reload} />
        <div className="grid grid-cols-3 gap-3">
          {cats.data?.slice(0, 6).map((c) => (
            <button key={c._id} onClick={() => nav('/schedule', { state: { categoryId: c._id } })} className="flex flex-col items-center gap-2 rounded-2xl p-3 text-xs font-medium" style={{ background: c.color + '1A' }}>
              <CatIcon cat={c} boxed={false} size={28} />{c.name}
            </button>
          ))}
        </div>
      </section>
      {n ? (
        <button onClick={() => nav(`/track/${n._id}`)} className="card flex w-full items-center gap-3 p-4 text-left">
          <Truck className="text-eco" /><div className="flex-1"><p className="text-xs text-slate-500">Next Collection</p><p className="text-sm font-semibold">{fmtDate(n.scheduledDate)}, {n.timeSlot.replace('-', ' - ')}</p></div><ChevronRight size={18} className="text-slate-400" />
        </button>
      ) : !next.loading && <p className="card p-4 text-center text-sm text-slate-500">No upcoming collection. <Link className="font-semibold text-eco" to="/schedule">Schedule one</Link></p>}
    </div>
  );
}
