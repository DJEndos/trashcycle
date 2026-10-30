import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation, LocateFixed } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { Empty } from '../../components/ui/Empty.jsx';

const pin = (c) => L.divIcon({ className: '', html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${c};border:2px solid #fff;box-shadow:0 1px 4px #0006"></div>`, iconSize: [22, 22], iconAnchor: [11, 22] });
const FILTERS = [['', 'All'], ['recycling_center', 'Recycling Center'], ['transfer_station', 'TPS'], ['ewaste', 'E-Waste']];
const Fly = ({ to }) => { const m = useMap(); useEffect(() => { if (to) m.flyTo(to, 14); }, [to, m]); return null; };

export default function DropOffMap() {
  const [q, setQ] = useState(''), [type, setType] = useState(''), [me, setMe] = useState(null), [items, setItems] = useState([]);
  const [sel, setSel] = useState(null), [err, setErr] = useState(''), [geoMsg, setGeoMsg] = useState('');
  const load = () => api.get('/locations', { params: { q: q || undefined, type: type || undefined, lat: me?.lat, lng: me?.lng } })
    .then((r) => { setItems(r.data); setErr(''); }).catch((e) => setErr(errMsg(e)));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q, type, me]);
  const locate = () => navigator.geolocation?.getCurrentPosition(
    (p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg(''); },
    () => setGeoMsg('Location unavailable. Allow location access to see distances.'), { timeout: 8000 });
  const center = me ? [me.lat, me.lng] : items[0] ? [items[0].coordinates.lat, items[0].coordinates.lng] : [0, 0];
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      <div className="space-y-2 p-4 pb-2">
        <h1 className="text-lg font-semibold">Drop Off Locations</h1>
        <div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="input pl-9" placeholder="Search location…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex gap-2 overflow-x-auto">{FILTERS.map(([v, l]) => <button key={l} onClick={() => setType(v)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${type === v ? 'border-eco bg-eco text-white' : 'border-slate-200'}`}>{l}</button>)}</div>
        <ErrorBox msg={err || geoMsg} />
      </div>
      <div className="relative flex-1">
        {items.length === 0 && !err ? <Empty icon={Search} title="No locations found" hint="Try another search or filter." /> : (
          <MapContainer center={center} zoom={items.length ? 12 : 2} key={items.length ? 'has' : 'none'}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Fly to={sel ? [sel.coordinates.lat, sel.coordinates.lng] : me ? [me.lat, me.lng] : null} />
            {items.map((l) => <Marker key={l._id} position={[l.coordinates.lat, l.coordinates.lng]} icon={pin('#168452')} eventHandlers={{ click: () => setSel(l) }} />)}
            {me && <Marker position={[me.lat, me.lng]} icon={L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 3px #2563eb44"></div>' })} />}
          </MapContainer>)}
        <button aria-label="Use my location" onClick={locate} className="absolute right-3 top-3 z-[500] grid h-10 w-10 place-items-center rounded-full bg-white shadow"><LocateFixed size={20} /></button>
        {sel && (
          <div className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl bg-white p-4 shadow-lg">
            <p className="font-semibold">{sel.name}</p>
            <p className="text-xs text-slate-500">{sel.distanceKm != null ? `${sel.distanceKm} km · ` : ''}{sel.address}</p>
            {sel.operatingHours && <p className="text-xs text-slate-500">Hours: {sel.operatingHours}</p>}
            <a className="btn mt-3 flex items-center justify-center gap-2" target="_blank" rel="noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&destination=${sel.coordinates.lat},${sel.coordinates.lng}`}><Navigation size={16} />Get Directions</a>
          </div>)}
      </div>
    </div>
  );
}
