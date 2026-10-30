import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useLive } from '../../hooks/useLive.js';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { Empty } from '../../components/ui/Empty.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

export default function Notifications() {
  const { data, loading, error, reload } = useFetch('/notifications');
  useLive('notification:new', reload, reload);
  const read = async (n) => { if (!n.isRead) { await api.patch(`/notifications/${n._id}/read`).catch(() => {}); reload(); } };
  return (
    <>
      <PageHeader title="Notifications" />
      <div className="space-y-2 p-4">
        {loading && <Spinner />}<ErrorBox msg={error} retry={reload} />
        {data && !data.items.length && <Empty icon={Bell} title="You're all caught up" hint="Pickup updates will show up here." />}
        {data?.items.map((n) => (
          <Link key={n._id} to={n.relatedPickupId ? `/track/${n.relatedPickupId}` : '#'} onClick={() => read(n)} className={`card block p-3 ${n.isRead ? '' : 'border-eco/40 bg-eco-light/40'}`}>
            <p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-slate-600">{n.message}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
          </Link>))}
      </div>
    </>
  );
}
