import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Truck, CheckCircle2, Circle, MapPinOff } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useLive } from '../../hooks/useLive.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { Empty } from '../../components/ui/Empty.jsx';
import { fmtDate, catNames } from '../../utils/format.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

const dot = (c) => L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 1px 4px #0006"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
const STEPS = [['assigned', 'Assigned'], ['on_the_way', 'On the way'], ['arrived', 'Arrived'], ['collected', 'Collected']];
const ORDER = ['pending', 'confirmed', 'assigned', 'on_the_way', 'arrived', 'collected', 'completed'];

export default function TrackPickup() {
  const { id } = useParams();
  const [p, setP] = useState(null), [err, setErr] = useState(''), [loading, setLoading] = useState(true), [live, setLive] = useState(null);
  const load = async () => {
    try {
      let pid = id;
      if (!pid) { const { data } = await api.get('/pickups', { params: { status: 'active', sort: 'upcoming', limit: 1 } }); pid = data.items[0]?._id; }
      if (pid) { const { data } = await api.get(`/pickups/${pid}`); setP(data); setLive(null); } else setP(null);
      setErr('');
    } catch (e) { setErr(errMsg(e)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  useLive('pickup:statusChanged', (d) => d._id === p?._id && setP(d), load);
  useLive('pickup:assigned', (d) => d._id === p?._id && setP(d));
  useLive('driver:locationUpdated', (d) => d.pickupId === p?._id && setLive(d));

  if (loading) return <Spinner />;
  if (err) return <div className="p-4"><ErrorBox msg={err} retry={load} /></div>;
  if (!p) return <><PageHeader title="Track Pickup" /><Empty icon={Truck} title="No active pickup" hint="Schedule a pickup to track it here."><Link to="/schedule" className="btn-sm mt-2">Schedule pickup</Link></Empty></>;

  const drv = p.assignedDriverId, dl = live?.location || drv?.lastKnownLocation, dAt = live?.at || drv?.lastLocationUpdatedAt;
  const at = (s) => p.statusHistory?.find((h) => h.status === s)?.at;
  const idx = ORDER.indexOf(p.status);
  return (
    <>
      <PageHeader title="Track Pickup" />
      <div className="relative h-72 bg-slate-100">
        {p.coordinates?.lat ? (
          <MapContainer center={[p.coordinates.lat, p.coordinates.lng]} zoom={14} scrollWheelZoom={false}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[p.coordinates.lat, p.coordinates.lng]} icon={dot('#168452')}><Popup>Pickup location</Popup></Marker>
            {dl?.lat && <Marker position={[dl.lat, dl.lng]} icon={dot('#2F8FDB')}><Popup>Driver (last reported {dAt ? new Date(dAt).toLocaleTimeString() : ''})</Popup></Marker>}
          </MapContainer>
        ) : <Empty icon={MapPinOff} title="No map location" hint="This address was saved without GPS coordinates." />}
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">{p.requestNumber}</p><p className="font-semibold">{catNames(p)}</p></div><Badge status={p.status} /></div>
        <p className="text-sm text-slate-500">{fmtDate(p.scheduledDate)} · {p.timeSlot.replace('-', ' - ')} · {p.addressSnapshot.street}, {p.addressSnapshot.city}</p>
        {drv ? (
          <div className="card flex items-center gap-3 p-3">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-eco-light font-bold text-eco">{drv.userId?.profileImage ? <img src={drv.userId.profileImage} alt="" className="h-full w-full object-cover" /> : drv.userId?.name?.[0]}</div>
            <div className="flex-1"><p className="font-semibold">{drv.userId?.name}</p><p className="text-xs text-slate-500">Waste Collection Driver{drv.vehicle?.plate ? ` · ${drv.vehicle.plate}` : ''}</p>
              <p className="text-xs text-slate-400">{dl ? `Location updated ${dAt ? new Date(dAt).toLocaleTimeString() : ''}` : 'Live location not available yet'}</p></div>
            {drv.phone && <a href={`tel:${drv.phone}`} aria-label="Call driver" className="grid h-10 w-10 place-items-center rounded-full bg-eco-light text-eco"><Phone size={18} /></a>}
          </div>
        ) : <p className="card p-3 text-sm text-slate-500">A driver will be assigned once your request is confirmed.</p>}
        {['rejected', 'cancelled'].includes(p.status) ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">This request was {p.status}. {p.cancellationReason}</p> : (
          <ol className="flex justify-between pt-2">
            {STEPS.map(([s, label]) => { const done = idx >= ORDER.indexOf(s), t = at(s); return (
              <li key={s} className="flex flex-1 flex-col items-center gap-1 text-center text-xs">
                {done ? <CheckCircle2 className="text-eco" size={22} /> : <Circle className="text-slate-300" size={22} />}
                <span className={done ? 'font-semibold' : 'text-slate-400'}>{label}</span><span className="text-slate-400">{t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </li>); })}
          </ol>)}
        {['pending', 'confirmed'].includes(p.status) && <button className="btn-ghost w-full py-3" onClick={async () => { if (confirm('Cancel this pickup?')) { try { setP((await api.post(`/pickups/${p._id}/cancel`, {})).data); } catch (e) { setErr(errMsg(e)); } } }}>Cancel request</button>}
      </div>
    </>
  );
}
