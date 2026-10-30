import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, CheckCircle2, Plus } from 'lucide-react';
import { api, errMsg, fieldErrs } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { CatIcon } from '../../components/ui/CatIcon.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Calendar({ value, onChange }) {
  const [m, setM] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const first = m.getDay(), days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const todayS = iso(new Date()), max = iso(new Date(Date.now() + 90 * 864e5));
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1))];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold">{m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" className="p-1" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Next month" className="p-1" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-slate-400">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d}>{d}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const s = iso(d), off = s < todayS || s > max || d.getDay() === 0;
          return <button key={i} type="button" disabled={off} onClick={() => onChange(s)}
            className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${s === value ? 'bg-eco font-semibold text-white' : off ? 'text-slate-300' : 'hover:bg-eco-light'}`}>{d.getDate()}</button>;
        })}
      </div>
    </div>
  );
}

export default function SchedulePickup() {
  const { state } = useLocation();
  const cats = useFetch('/categories'), addrs = useFetch('/users/me/addresses');
  const [sel, setSel] = useState(state?.categoryId ? [state.categoryId] : []);
  const [date, setDate] = useState(''), [slot, setSlot] = useState(''), [avail, setAvail] = useState(null);
  const [addressId, setAddressId] = useState(''), [qty, setQty] = useState(''), [unit, setUnit] = useState('kg'), [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false), [na, setNa] = useState({ label: 'Home', street: '', city: '' });
  const [err, setErr] = useState(''), [fe, setFe] = useState({}), [busy, setBusy] = useState(false), [done, setDone] = useState(null);

  useEffect(() => { if (!addressId && addrs.data?.length) setAddressId(addrs.data.find((a) => a.isDefault)?._id || addrs.data[0]._id); }, [addrs.data, addressId]);
  useEffect(() => {
    if (!date) return; setSlot(''); setAvail(null);
    api.get('/pickups/availability', { params: { date } }).then((r) => setAvail(r.data.slots)).catch((e) => setErr(errMsg(e)));
  }, [date]);

  const saveAddress = async () => {
    try {
      const body = { ...na };
      if (navigator.geolocation && na.useGps) {
        const pos = await new Promise((ok, no) => navigator.geolocation.getCurrentPosition(ok, no, { timeout: 8000 }));
        body.coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
      delete body.useGps;
      const { data } = await api.post('/users/me/addresses', body);
      await addrs.reload(); setAddressId(data._id); setAdding(false); setErr('');
    } catch (e) { setErr(e.code === 1 ? 'Location permission was denied. Save the address without GPS instead.' : errMsg(e)); }
  };
  const submit = async () => {
    setBusy(true); setErr(''); setFe({});
    try {
      const { data } = await api.post('/pickups', { categoryIds: sel, addressId, scheduledDate: date, timeSlot: slot, estimatedQuantity: Number(qty), unit, notes: notes || undefined });
      setDone(data);
    } catch (e) { setErr(errMsg(e)); setFe(fieldErrs(e)); if (e.response?.status === 409 && date) api.get('/pickups/availability', { params: { date } }).then((r) => setAvail(r.data.slots)); } finally { setBusy(false); }
  };

  if (done) return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div><CheckCircle2 size={56} className="mx-auto text-eco" /><h2 className="mt-3 text-xl font-bold">Pickup requested</h2>
        <p className="mt-1 text-sm text-slate-500">Your reference</p><p className="text-lg font-bold tracking-wide">{done.requestNumber}</p>
        <p className="mt-2 text-sm text-slate-500">We'll notify you when it's confirmed.</p>
        <Link to={`/track/${done._id}`} className="btn mt-6 block">Track this pickup</Link><Link to="/home" className="mt-3 block text-sm font-medium text-eco">Back to home</Link></div>
    </div>
  );
  const ready = sel.length && date && slot && addressId && Number(qty) > 0;
  return (
    <>
      <PageHeader title="Schedule Pickup" />
      <div className="space-y-6 p-4 pb-10">
        <section><h2 className="mb-2 font-semibold">Waste type</h2>
          {cats.loading && <Spinner />}
          <div className="flex flex-wrap gap-2">{cats.data?.map((c) => (
            <button key={c._id} type="button" onClick={() => setSel(sel.includes(c._id) ? sel.filter((x) => x !== c._id) : [...sel, c._id])}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${sel.includes(c._id) ? 'border-eco bg-eco-light font-semibold text-eco' : 'border-slate-200'}`}><CatIcon cat={c} size={14} boxed={false} />{c.name}</button>
          ))}</div>{fe.categoryIds && <p className="mt-1 text-xs text-red-600">{fe.categoryIds[0]}</p>}
        </section>
        <section><h2 className="mb-2 font-semibold">Select date</h2><Calendar value={date} onChange={setDate} /></section>
        <section><h2 className="mb-2 font-semibold">Select time</h2>
          {!date ? <p className="text-sm text-slate-500">Pick a date to see available slots.</p> : !avail ? <Spinner /> : (
            <div className="grid grid-cols-2 gap-2">{avail.map((s) => (
              <button key={s.slot} type="button" disabled={!s.remaining} onClick={() => setSlot(s.slot)}
                className={`rounded-xl border py-3 text-sm ${slot === s.slot ? 'border-eco bg-eco-light font-semibold text-eco' : 'border-slate-200'} disabled:bg-slate-50 disabled:text-slate-300`}>
                {s.slot.replace('-', ' - ')}{!s.remaining && <span className="block text-[10px]">Full</span>}</button>
            ))}</div>)}
        </section>
        <section><h2 className="mb-2 font-semibold">Address</h2>
          {addrs.data?.map((a) => (
            <label key={a._id} className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${addressId === a._id ? 'border-eco bg-eco-light/50' : 'border-slate-200'}`}>
              <input type="radio" name="addr" checked={addressId === a._id} onChange={() => setAddressId(a._id)} className="accent-eco" />
              <MapPin size={18} className="text-eco" /><span className="text-sm"><b>{a.label}</b><br /><span className="text-slate-500">{a.street}, {a.city}</span></span>
            </label>))}
          {adding ? (
            <div className="space-y-2 rounded-xl border border-slate-200 p-3">
              <input className="input" placeholder="Label (e.g. Home)" value={na.label} onChange={(e) => setNa({ ...na, label: e.target.value })} />
              <input className="input" placeholder="Street address" value={na.street} onChange={(e) => setNa({ ...na, street: e.target.value })} />
              <input className="input" placeholder="City" value={na.city} onChange={(e) => setNa({ ...na, city: e.target.value })} />
              <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" className="accent-eco" onChange={(e) => setNa({ ...na, useGps: e.target.checked })} />Save my current location for map tracking</label>
              <div className="flex gap-2"><button type="button" className="btn-sm" onClick={saveAddress}>Save address</button><button type="button" className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button></div>
            </div>
          ) : <button type="button" className="flex items-center gap-1 text-sm font-medium text-eco" onClick={() => setAdding(true)}><Plus size={16} />Add new address</button>}
        </section>
        <section className="grid grid-cols-3 gap-2">
          <label className="col-span-2 text-sm font-medium">Estimated quantity<input className="input mt-1" type="number" min="0.1" step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} />{fe.estimatedQuantity && <span className="text-xs text-red-600">Enter a valid quantity.</span>}</label>
          <label className="text-sm font-medium">Unit<select className="input mt-1" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="kg">kg</option><option value="bags">bags</option></select></label>
        </section>
        <label className="block text-sm font-medium">Notes (optional)<textarea className="input mt-1" rows={3} maxLength={500} placeholder="e.g. Large items, special handling" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <ErrorBox msg={err} />
        <button className="btn" disabled={!ready || busy} onClick={submit}>{busy ? 'Submitting…' : 'Confirm Schedule'}</button>
      </div>
    </>
  );
}
