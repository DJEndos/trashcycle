import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PageHeader = ({ title, back = true, right }) => {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/95 px-4 py-3.5 backdrop-blur">
      {back && <button aria-label="Back" onClick={() => nav(-1)} className="-ml-1 p-1"><ArrowLeft size={22} /></button>}
      <h1 className="flex-1 text-base font-semibold">{title}</h1>{right}
    </header>
  );
};
