import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, HelpCircle, Info, LogOut, ChevronRight, Trash2, Leaf } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useLive } from '../../hooks/useLive.js';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';

const Row = ({ icon: I, title, sub, onClick }) => (
  <button onClick={onClick} className="flex w-full items-center gap-3 py-3.5 text-left"><I size={20} className="text-slate-600" /><span className="flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-slate-400">{sub}</span></span><ChevronRight size={16} className="text-slate-300" /></button>
);
export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const rew = useFetch('/rewards/me'), addrs = useFetch('/users/me/addresses'), me = useFetch('/users/me');
  const [panel, setPanel] = useState(''), [err, setErr] = useState('');
  useLive('pickup:statusChanged', () => rew.reload());
  const prefs = me.data?.notificationPreferences || {};
  const toggle = async (k) => {
    try { const { data } = await api.patch('/users/me', { notificationPreferences: { [k]: !prefs[k] } }); me.setData(data); setUser({ ...user, notificationPreferences: data.notificationPreferences }); } catch (e) { setErr(errMsg(e)); }
  };
  const del = async (id) => { try { await api.delete(`/users/me/addresses/${id}`); addrs.reload(); } catch (e) { setErr(errMsg(e)); } };
  const P = (k) => setPanel(panel === k ? '' : k);
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-eco-light text-xl font-bold text-eco">{user.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : user.name[0]}</div>
        <div><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-eco p-4 text-white"><Leaf className="fill-white/30" /><div><p className="text-xs opacity-90">Green Points</p><p className="text-xl font-bold">{rew.data?.points ?? 0} pts</p><p className="text-xs opacity-90">Keep recycling to get more points!</p></div></div>
      <ErrorBox msg={err} />
      <div className="mt-2 divide-y divide-slate-100">
        <Row icon={MapPin} title="My Address" sub={addrs.data?.[0] ? `${addrs.data[0].street}, ${addrs.data[0].city}` : 'No saved addresses'} onClick={() => P('addr')} />
        {panel === 'addr' && <div className="space-y-2 py-3">{addrs.data?.length ? addrs.data.map((a) => <div key={a._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span><b>{a.label}</b> · {a.street}, {a.city}</span><button aria-label="Delete address" onClick={() => del(a._id)}><Trash2 size={16} className="text-red-500" /></button></div>) : <p className="text-sm text-slate-500">Add an address when you schedule a pickup.</p>}</div>}
        <Row icon={Bell} title="Notification" sub="Collection reminders, updates" onClick={() => P('notif')} />
        {panel === 'notif' && <div className="space-y-3 py-3 text-sm">{[['pickupUpdates', 'Pickup updates'], ['reminders', 'Collection reminders'], ['promotions', 'Tips and offers']].map(([k, l]) => (
          <label key={k} className="flex items-center justify-between">{l}<input type="checkbox" className="h-5 w-5 accent-eco" checked={!!prefs[k]} onChange={() => toggle(k)} /></label>))}</div>}
        <Row icon={HelpCircle} title="Help & Support" sub="FAQ, contact us" onClick={() => P('help')} />
        {panel === 'help' && <div className="space-y-2 py-3 text-sm text-slate-600"><p><b>Can I cancel a pickup?</b> Yes, while it is pending or confirmed.</p><p><b>When are points added?</b> After your waste is collected and weighed.</p><p>Need more help? Contact your EcoCycle administrator.</p></div>}
        <Row icon={Info} title="About" sub="App version 1.0.0" onClick={() => P('about')} />
        {panel === 'about' && <div className="space-y-2 py-3 text-sm text-slate-600"><p>EcoCycle — Less Waste, A Greener Future.</p><p><Link to="/terms" className="font-semibold text-eco underline">Terms of Use</Link> · <Link to="/privacy" className="font-semibold text-eco underline">Privacy Policy</Link></p></div>}
      </div>
      <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600"><LogOut size={16} />Log Out</button>
    </div>
  );
}
