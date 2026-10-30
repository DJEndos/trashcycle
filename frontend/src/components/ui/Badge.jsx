import { STATUS_LABEL } from '../../utils/format.js';

const TONE = { pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-sky-50 text-sky-700', assigned: 'bg-sky-50 text-sky-700', on_the_way: 'bg-indigo-50 text-indigo-700', arrived: 'bg-indigo-50 text-indigo-700', collected: 'bg-eco-light text-eco', completed: 'bg-eco-light text-eco', cancelled: 'bg-slate-100 text-slate-500', rejected: 'bg-red-50 text-red-600' };
export const Badge = ({ status }) => <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE[status]}`}>{STATUS_LABEL[status]}</span>;
