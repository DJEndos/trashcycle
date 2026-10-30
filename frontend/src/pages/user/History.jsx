import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, ClipboardList } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useLive } from '../../hooks/useLive.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { CatIcon } from '../../components/ui/CatIcon.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { Empty } from '../../components/ui/Empty.jsx';
import { fmtDate, catNames } from '../../utils/format.js';

export default function History() {
  const [type, setType] = useState(''), [items, setItems] = useState([]), [page, setPage] = useState(1), [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true), [err, setErr] = useState(''), [open, setOpen] = useState(null);
  const load = async (pg = 1, replace = true) => {
    setLoading(true);
    try {
      const { data } = await api.get('/pickups', { params: { type: type || undefined, page: pg, limit: 10 } });
      setItems((cur) => (replace ? data.items : [...cur, ...data.items])); setPage(pg); setPages(data.pages); setErr('');
    } catch (e) { setErr(errMsg(e)); } finally { setLoading(false); }
  };
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [type]);
  useLive('pickup:statusChanged', () => load(1), () => load(1));
  return (
    <div className="p-4">
      <h1 className="mb-3 text-lg font-semibold">History</h1>
      <div className="mb-4 flex rounded-full bg-slate-100 p-1 text-sm font-medium">
        {[['', 'All'], ['pickup', 'Pickup'], ['dropoff', 'Drop Off']].map(([v, l]) => (
          <button key={l} onClick={() => setType(v)} className={`flex-1 rounded-full py-1.5 ${type === v ? 'bg-eco text-white' : 'text-slate-500'}`}>{l}</button>))}
      </div>
      <ErrorBox msg={err} retry={() => load(1)} />
      {!loading && !items.length && !err && <Empty icon={ClipboardList} title="No collections yet" hint="Your pickups will appear here."><Link to="/schedule" className="btn-sm mt-2">Schedule a pickup</Link></Empty>}
      <div className="space-y-3">{items.map((p) => (
        <button key={p._id} onClick={() => setOpen(p)} className="card flex w-full items-center gap-3 p-3 text-left">
          <CatIcon cat={p.categoryIds[0]} />
          <div className="flex-1"><p className="font-semibold">{catNames(p)}</p><p className="text-xs text-slate-500">{fmtDate(p.scheduledDate)} · {p.timeSlot.split('-')[0]}</p></div>
          <div className="text-right"><p className="text-sm font-semibold">{p.actualCollectedWeight ? `${p.actualCollectedWeight} kg` : '—'}</p><Badge status={p.status} /></div><ChevronRight size={16} className="text-slate-400" />
        </button>))}
      </div>
      {loading && <Spinner />}
      {page < pages && !loading && <button className="btn-ghost mt-4 w-full py-3" onClick={() => load(page + 1, false)}>Load more</button>}
      {open && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={() => setOpen(null)}>
          <div className="mx-auto w-full max-w-md space-y-2 rounded-t-3xl bg-white p-5 text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-base font-bold">{open.requestNumber}</h2><button aria-label="Close" onClick={() => setOpen(null)}><X /></button></div>
            <Badge status={open.status} />
            <p><b>Categories:</b> {catNames(open)}</p><p><b>When:</b> {fmtDate(open.scheduledDate)}, {open.timeSlot.replace('-', ' - ')}</p>
            <p><b>Address:</b> {open.addressSnapshot.street}, {open.addressSnapshot.city}</p>
            <p><b>Estimated:</b> {open.estimatedQuantity} {open.unit}</p>{open.actualCollectedWeight && <p><b>Collected:</b> {open.actualCollectedWeight} kg</p>}
            {open.notes && <p><b>Notes:</b> {open.notes}</p>}{open.cancellationReason && <p><b>Reason:</b> {open.cancellationReason}</p>}
            {['pending', 'confirmed', 'assigned', 'on_the_way', 'arrived'].includes(open.status) && <Link to={`/track/${open._id}`} className="btn mt-2 block text-center">Track pickup</Link>}
          </div>
        </div>)}
    </div>
  );
}
