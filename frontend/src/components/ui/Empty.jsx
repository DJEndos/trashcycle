import { Recycle } from 'lucide-react';

export const Empty = ({ icon: I = Recycle, title, hint, children }) => (
  <div className="grid place-items-center gap-2 px-6 py-12 text-center"><I className="text-slate-300" size={40} /><p className="font-semibold">{title}</p>{hint && <p className="text-sm text-slate-500">{hint}</p>}{children}</div>
);
