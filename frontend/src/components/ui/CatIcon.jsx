import { Leaf, Package, FileText, Wine, Container, Monitor, Recycle } from 'lucide-react';

const ICONS = { Leaf, Package, FileText, Wine, Container, Monitor, Recycle };
export const CatIcon = ({ cat, size = 22, boxed = true }) => {
  const I = ICONS[cat?.icon] || Recycle, c = cat?.color || '#168452';
  return boxed
    ? <span className="grid shrink-0 place-items-center rounded-xl" style={{ background: c, width: size * 2, height: size * 2 }}><I size={size} color="#fff" /></span>
    : <I size={size} color={c} />;
};
