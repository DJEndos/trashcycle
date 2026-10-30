import { useNavigate } from 'react-router-dom';
import { ChevronRight, Leaf } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { CatIcon } from '../../components/ui/CatIcon.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

export default function WasteCategories() {
  const nav = useNavigate();
  const { data, loading, error, reload } = useFetch('/categories');
  return (
    <>
      <PageHeader title="Waste Categories" />
      <div className="space-y-3 p-4">
        {loading && <Spinner />}<ErrorBox msg={error} retry={reload} />
        {data?.map((c) => (
          <button key={c._id} onClick={() => nav('/schedule', { state: { categoryId: c._id } })} className="card flex w-full items-center gap-3 p-3 text-left">
            <CatIcon cat={c} /><div className="flex-1"><p className="font-semibold">{c.name}</p><p className="text-xs text-slate-500">{c.description}</p></div><ChevronRight size={18} className="text-slate-400" />
          </button>
        ))}
        <div className="flex items-center gap-3 rounded-2xl bg-eco-light p-4 text-xs text-slate-600"><Leaf className="text-eco" size={20} />Sort your waste correctly. Help us recycle and protect the environment.</div>
      </div>
    </>
  );
}
