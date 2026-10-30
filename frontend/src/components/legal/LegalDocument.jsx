import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LEGAL } from '../../config/legal.js';

// Shared layout for the Terms of Use and Privacy Policy pages.
export default function LegalDocument({ title, intro, sections, other }) {
  const nav = useNavigate();
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/'));
  return (
    <div className="min-h-screen bg-white">
      <article className="mx-auto max-w-2xl px-6 pb-16 pt-8">
        <button onClick={back} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-eco"><ArrowLeft size={18} />Back</button>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">Effective {LEGAL.effectiveDate} · Version {LEGAL.version}</p>
        {intro && <p className="mt-4 text-sm text-slate-600">{intro}</p>}
        <div className="mt-6 space-y-6">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold">{i + 1}. {s.title}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
                {s.blocks.map((b, j) => typeof b === 'string'
                  ? <p key={j}>{b}</p>
                  : <ul key={j} className="list-disc space-y-1.5 pl-5">{b.list.map((li) => <li key={li}>{li}</li>)}</ul>)}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-slate-100 pt-4 text-sm text-slate-500">
          See also: <Link className="font-semibold text-eco" to={other.to}>{other.label}</Link>
        </p>
      </article>
    </div>
  );
}
