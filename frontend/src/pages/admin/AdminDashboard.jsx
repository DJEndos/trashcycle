import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LayoutDashboard, Inbox, Users, Truck, Tags, MapPin, LogOut, Download, X, Leaf } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useLive } from '../../hooks/useLive.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { fmtDate, catNames, STATUS_LABEL } from '../../utils/format.js';

const TABS = [['overview', 'Overview', LayoutDashboard], ['requests', 'Requests', Inbox], ['users', 'Users', Users], ['drivers', 'Drivers', Truck], ['categories', 'Categories', Tags], ['locations', 'Locations', MapPin]];
const Stat = ({ label, value }) => <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;

function Overview() {
  const { data, error, loading, reload } = useFetch('/admin/dashboard');
  useLive('pickup:created', reload, reload); useLive('pickup:updated', reload);
  if (loading) return <Spinner />;
  const s = data?.byStatus || {};
  return (
    <div className="space-y-4">
      <ErrorBox msg={error} retry={reload} />
      {data && <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Registered users" value={data.totalUsers} /><Stat label="Total requests" value={data.totalRequests} />
          <Stat label="Pending" value={s.pending || 0} /><Stat label="Collected (30 days)" value={`${data.totalKg.toFixed(1)} kg`} />
          <Stat label="Assigned / in progress" value={(s.assigned || 0) + (s.on_the_way || 0) + (s.arrived || 0)} /><Stat label="Completed" value={(s.completed || 0) + (s.collected || 0)} />
          <Stat label="Cancelled / rejected" value={(s.cancelled || 0) + (s.rejected || 0)} /><Stat label="Confirmed" value={s.confirmed || 0} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-4 lg:col-span-2"><p className="mb-2 font-semibold">Daily collections (kg)</p>
            {data.daily.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={data.daily}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="_id" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="kg" fill="#168452" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="py-10 text-center text-sm text-slate-500">No collections recorded in this period.</p>}</div>
          <div className="card p-4"><p className="mb-2 font-semibold">Requests by category</p>
            {data.byCategory.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data.byCategory} dataKey="requests" nameKey="name" outerRadius={80}>{data.byCategory.map((c, i) => <Cell key={i} fill={c.color || '#168452'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <p className="py-10 text-center text-sm text-slate-500">No requests yet.</p>}</div>
        </div>
        <div className="card p-4"><p className="mb-2 font-semibold">Recent activity</p>{data.recentActivity.length ? data.recentActivity.map((a) => <p key={a._id} className="border-t border-slate-100 py-1.5 text-sm text-slate-600">{a.actorId?.name || 'System'} · {a.action} · {new Date(a.createdAt).toLocaleString()}</p>) : <p className="text-sm text-slate-500">Nothing yet.</p>}</div>
      </>}
    </div>
  );
}

function Requests() {
  const [status, setStatus] = useState(''), [search, setSearch] = useState(''), [rows, setRows] = useState([]), [fresh, setFresh] = useState(new Set()), [sel, setSel] = useState(null), [err, setErr] = useState(''), [loading, setLoading] = useState(true);
  const drivers = useFetch('/drivers');
  const load = () => api.get('/pickups', { params: { status: status || undefined, search: search || undefined, limit: 100 } }).then((r) => { setRows(r.data.items); setErr(''); }).catch((e) => setErr(errMsg(e))).finally(() => setLoading(false));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [status, search]);
  useLive('pickup:created', (p) => { setRows((r) => [p, ...r.filter((x) => x._id !== p._id)]); setFresh((f) => new Set(f).add(p._id)); }, load);
  useLive('pickup:updated', (p) => { setRows((r) => r.map((x) => (x._id === p._id ? p : x))); setSel((s) => (s?._id === p._id ? p : s)); });
  const csv = () => {
    const head = ['Request', 'Customer', 'Categories', 'Quantity', 'Address', 'Date', 'Slot', 'Status'];
    const body = rows.map((p) => [p.requestNumber, p.userId?.name, catNames(p), `${p.estimatedQuantity} ${p.unit}`, `${p.addressSnapshot.street} ${p.addressSnapshot.city}`, p.scheduledDate, p.timeSlot, p.status]);
    const text = [head, ...body].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = 'pickups.csv'; a.click();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search request ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[12rem]" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn-ghost flex items-center gap-1" onClick={csv}><Download size={14} />Export CSV</button>
      </div>
      <ErrorBox msg={err} retry={load} />{loading && <Spinner />}
      <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Request', 'Customer', 'Category', 'Qty', 'Date / slot', 'Status'].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p._id} onClick={() => { setSel(p); setFresh((f) => { const n = new Set(f); n.delete(p._id); return n; }); }} className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${fresh.has(p._id) ? 'bg-amber-50' : ''}`}>
            <td className="p-3 font-medium">{p.requestNumber}{fresh.has(p._id) && <span className="ml-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">NEW</span>}</td>
            <td className="p-3">{p.userId?.name}</td><td className="p-3">{catNames(p)}</td><td className="p-3">{p.estimatedQuantity} {p.unit}</td><td className="p-3">{fmtDate(p.scheduledDate)}<br /><span className="text-xs text-slate-500">{p.timeSlot}</span></td><td className="p-3"><Badge status={p.status} /></td>
          </tr>))}</tbody></table>
        {!loading && !rows.length && <p className="p-8 text-center text-sm text-slate-500">No requests match.</p>}</div>
      {sel && <Detail p={sel} drivers={drivers.data || []} onClose={() => setSel(null)} />}
    </div>
  );
}

function Detail({ p, drivers, onClose }) {
  const [drv, setDrv] = useState(p.assignedDriverId?._id || ''), [weight, setWeight] = useState(''), [reason, setReason] = useState(''), [date, setDate] = useState(p.scheduledDate), [slot, setSlot] = useState(p.timeSlot), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
  const act = async (fn) => { setBusy(true); setMsg(''); try { await fn(); } catch (e) { setMsg(errMsg(e)); } finally { setBusy(false); } };
  const status = (s, extra = {}) => act(() => api.patch(`/pickups/${p._id}/status`, { status: s, ...extra }));
  const NEXT = { pending: ['confirmed'], confirmed: [], assigned: ['on_the_way'], on_the_way: ['arrived'], arrived: [], collected: ['completed'] }[p.status] || [];
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <aside className="h-full w-full max-w-md space-y-4 overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{p.requestNumber}</h2><button aria-label="Close" onClick={onClose}><X /></button></div>
        <Badge status={p.status} />
        <div className="space-y-1 text-sm"><p><b>Customer:</b> {p.userId?.name} · {p.userId?.email}{p.userId?.phone ? ` · ${p.userId.phone}` : ''}</p><p><b>Categories:</b> {catNames(p)}</p><p><b>Quantity:</b> {p.estimatedQuantity} {p.unit}{p.actualCollectedWeight ? ` (collected ${p.actualCollectedWeight} kg)` : ''}</p><p><b>Address:</b> {p.addressSnapshot.street}, {p.addressSnapshot.city}</p>{p.notes && <p><b>Notes:</b> {p.notes}</p>}</div>
        <ErrorBox msg={msg} />
        {['pending', 'confirmed'].includes(p.status) && <div className="space-y-2"><input className="input" placeholder="Reason (required to reject)" value={reason} onChange={(e) => setReason(e.target.value)} /><div className="flex gap-2">{p.status === 'pending' && <button className="btn-sm" disabled={busy} onClick={() => status('confirmed')}>Accept</button>}<button className="btn-ghost text-red-600" disabled={busy || !reason} onClick={() => status('rejected', { reason })}>Reject</button></div></div>}
        {['confirmed', 'assigned'].includes(p.status) && <div className="space-y-2"><p className="text-sm font-semibold">Driver</p><div className="flex gap-2"><select className="input" value={drv} onChange={(e) => setDrv(e.target.value)}><option value="">Select driver…</option>{drivers.filter((d) => d.isActive).map((d) => <option key={d._id} value={d._id}>{d.userId?.name} ({d.activeAssignments} active)</option>)}</select><button className="btn-sm" disabled={busy || !drv} onClick={() => act(() => api.post(`/pickups/${p._id}/assign`, { driverId: drv }))}>Assign</button></div></div>}
        {NEXT.filter((s) => s !== 'confirmed').map((s) => <button key={s} className="btn" disabled={busy} onClick={() => status(s)}>Mark {STATUS_LABEL[s].toLowerCase()}</button>)}
        {p.status === 'arrived' && <div className="flex gap-2"><input className="input" type="number" min="0.1" step="0.1" placeholder="Collected weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} /><button className="btn-sm" disabled={busy || !(Number(weight) > 0)} onClick={() => status('collected', { actualCollectedWeight: Number(weight) })}>Confirm collected</button></div>}
        {['pending', 'confirmed', 'assigned'].includes(p.status) && <div className="space-y-2 border-t pt-3"><p className="text-sm font-semibold">Reschedule</p><div className="flex gap-2"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /><select className="input" value={slot} onChange={(e) => setSlot(e.target.value)}>{['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'].map((s) => <option key={s}>{s}</option>)}</select></div><button className="btn-ghost" disabled={busy} onClick={() => act(() => api.patch(`/pickups/${p._id}`, { scheduledDate: date, timeSlot: slot }))}>Save new time</button></div>}
        {['pending', 'confirmed', 'assigned'].includes(p.status) && <button className="btn-ghost w-full text-red-600" disabled={busy} onClick={() => confirm('Cancel this request?') && act(() => api.post(`/pickups/${p._id}/cancel`, { reason: 'Cancelled by admin' }))}>Cancel request</button>}
      </aside>
    </div>
  );
}

function UsersTab() {
  const [q, setQ] = useState('');
  const { data, error, reload } = useFetch('/admin/users', { q: q || undefined });
  const patch = (u, b) => api.patch(`/admin/users/${u._id}`, b).then(reload);
  return <div className="space-y-3"><input className="input max-w-xs" placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} /><ErrorBox msg={error} />
    <div className="card overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Name', 'Email', 'Phone', 'Verified', 'Status', ''].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{data?.map((u) => <tr key={u._id} className="border-t border-slate-100"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.phone || '—'}</td><td className="p-3"><input type="checkbox" className="accent-eco" checked={u.isVerified} onChange={() => patch(u, { isVerified: !u.isVerified })} /></td><td className="p-3">{u.isActive ? 'Active' : 'Suspended'}</td><td className="p-3"><button className="btn-ghost" onClick={() => patch(u, { isActive: !u.isActive })}>{u.isActive ? 'Suspend' : 'Activate'}</button></td></tr>)}</tbody></table></div></div>;
}

function Simple({ title, path, cols, fields, init, map }) {
  const { data, error, reload } = useFetch(path, { all: 1 });
  const [f, setF] = useState(init), [msg, setMsg] = useState('');
  const add = async (e) => { e.preventDefault(); try { await api.post(path, map ? map(f) : f); setF(init); setMsg(''); reload(); } catch (er) { setMsg(errMsg(er)); } };
  return (
    <div className="space-y-3">
      <form onSubmit={add} className="card flex flex-wrap items-end gap-2 p-3">
        {fields.map(([k, label, type = 'text']) => <label key={k} className="text-xs font-medium">{label}<input className="input mt-1 w-40" type={type} step="any" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={k !== 'phone' && k !== 'description' && k !== 'operatingHours' && k !== 'plate'} /></label>)}
        <button className="btn-sm py-3">Add</button></form>
      <ErrorBox msg={msg || error} />
      <div className="card overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{[...cols.map((c) => c[0]), 'Active'].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{data?.map((r) => <tr key={r._id} className="border-t border-slate-100">{cols.map(([h, fn]) => <td key={h} className="p-3">{fn(r)}</td>)}<td className="p-3"><input type="checkbox" className="accent-eco" checked={r.isActive} onChange={() => api.patch(`${path}/${r._id}`, { isActive: !r.isActive }).then(reload)} /></td></tr>)}</tbody></table>
        {data && !data.length && <p className="p-6 text-center text-sm text-slate-500">Nothing here yet.</p>}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState('');
  useLive('pickup:created', (p) => { setToast(`New request ${p.requestNumber}`); setTimeout(() => setToast(''), 4000); });
  const body = useMemo(() => ({
    overview: <Overview />, requests: <Requests />, users: <UsersTab />,
    drivers: <Simple title="Drivers" path="/drivers" init={{ name: '', email: '', password: '', phone: '', plate: '' }} fields={[['name', 'Name'], ['email', 'Email', 'email'], ['password', 'Temp password', 'password'], ['phone', 'Phone'], ['plate', 'Plate']]}
      map={(f) => ({ name: f.name, email: f.email, password: f.password, phone: f.phone || undefined, vehicle: f.plate ? { plate: f.plate } : undefined })}
      cols={[['Driver', (d) => d.userId?.name], ['Vehicle', (d) => d.vehicle?.plate || '—'], ['Active jobs', (d) => d.activeAssignments], ['Last location', (d) => (d.lastLocationUpdatedAt ? new Date(d.lastLocationUpdatedAt).toLocaleString() : 'None reported')]]} />,
    categories: <Simple title="Categories" path="/categories" init={{ name: '', description: '', icon: 'Recycle', color: '#168452' }} fields={[['name', 'Name'], ['description', 'Description'], ['icon', 'Icon (Leaf, Package, FileText, Wine, Container, Monitor, Recycle)'], ['color', 'Color', 'color']]}
      cols={[['Name', (c) => <span style={{ color: c.color }} className="font-semibold">{c.name}</span>], ['Description', (c) => c.description]]} />,
    locations: <Simple title="Locations" path="/locations" init={{ name: '', address: '', lat: '', lng: '', operatingHours: '' }} fields={[['name', 'Name'], ['address', 'Address'], ['lat', 'Latitude', 'number'], ['lng', 'Longitude', 'number'], ['operatingHours', 'Hours']]}
      map={(f) => ({ name: f.name, address: f.address, coordinates: { lat: Number(f.lat), lng: Number(f.lng) }, operatingHours: f.operatingHours || undefined })}
      cols={[['Name', (l) => l.name], ['Address', (l) => l.address], ['Hours', (l) => l.operatingHours || '—']]} />,
  }), []);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="flex gap-1 overflow-x-auto bg-eco-dark p-3 text-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:flex-col lg:p-4">
        <div className="hidden items-center gap-2 pb-4 text-lg font-bold lg:flex"><Leaf className="fill-white" />TrashCycle</div>
        {TABS.map(([k, l, I]) => <button key={k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === k ? 'bg-white/15 font-semibold' : 'opacity-80 hover:bg-white/10'}`}><I size={18} />{l}</button>)}
        <div className="flex-1" />
        <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm opacity-80 hover:bg-white/10"><LogOut size={18} />Log out ({user.name.split(' ')[0]})</button>
      </aside>
      <main className="min-w-0 flex-1 p-4 lg:p-8"><h1 className="mb-4 text-xl font-bold">{TABS.find((t) => t[0] === tab)[1]}</h1>{body[tab]}</main>
      {toast && <div role="status" className="fixed bottom-4 right-4 z-50 rounded-xl bg-eco px-4 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}
