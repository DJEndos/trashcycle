import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { errMsg, fieldErrs } from '../../services/api.js';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { homePathFor } from '../../utils/navigation.js';

function Field({ k, label, type = 'text', auto, f, set, fe }) {
  return (
    <label className="block text-sm font-medium">{label}
      <input className="input mt-1" type={type} value={f[k]} onChange={set(k)} autoComplete={auto} required={k !== 'phone'} />
      {fe[k] && <span className="text-xs text-red-600">{fe[k][0]}</span>}
    </label>
  );
}

// One consent checkbox. The document opens in a new tab so the half-filled form is not lost.
function Consent({ id, checked, onChange, to, doc, error }) {
  return (
    <div>
      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-eco" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>I have read and agree to the <Link to={to} target="_blank" rel="noopener noreferrer" className="font-semibold text-eco underline">{doc}</Link>.</span>
      </label>
      {error && <span className="mt-1 block text-xs text-red-600">{error[0]}</span>}
    </div>
  );
}

export default function AuthPage({ mode }) {
  const reg = mode === 'register';
  const { login } = useAuth(), nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [terms, setTerms] = useState(false), [privacy, setPrivacy] = useState(false);
  const [err, setErr] = useState(''), [fe, setFe] = useState({}), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const canSubmit = !busy && (!reg || (terms && privacy));
  const submit = async (e) => {
    e.preventDefault();
    if (reg && !(terms && privacy)) { setErr('Please accept the Terms of Use and the Privacy Policy to continue.'); return; }
    setBusy(true); setErr(''); setFe({});
    try {
      const body = reg
        ? { ...f, phone: f.phone || undefined, acceptTerms: terms, acceptPrivacy: privacy }
        : { email: f.email, password: f.password };
      const u = await login(reg ? '/auth/register' : '/auth/login', body);
      nav(homePathFor(u), { replace: true });
    } catch (e2) { setErr(errMsg(e2)); setFe(fieldErrs(e2)); } finally { setBusy(false); }
  };
  const p = { f, set, fe };
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white px-6 pb-10 pt-16">
      <Leaf size={36} className="fill-eco text-eco" />
      <h1 className="mt-4 text-2xl font-bold">{reg ? 'Create your account' : 'Welcome back'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {reg && <Field k="name" label="Full name" auto="name" {...p} />}
        <Field k="email" label="Email" type="email" auto="email" {...p} />
        {reg && <Field k="phone" label="Phone (optional)" type="tel" auto="tel" {...p} />}
        <Field k="password" label={reg ? 'Password (8+ characters)' : 'Password'} type="password" auto={reg ? 'new-password' : 'current-password'} {...p} />
        {reg && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <Consent id="accept-terms" checked={terms} onChange={setTerms} to="/terms" doc="Terms of Use" error={fe.acceptTerms} />
            <Consent id="accept-privacy" checked={privacy} onChange={setPrivacy} to="/privacy" doc="Privacy Policy" error={fe.acceptPrivacy} />
          </div>
        )}
        <ErrorBox msg={err} />
        <button className="btn" disabled={!canSubmit}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {reg ? 'Already registered?' : 'New to EcoCycle?'} <Link className="font-semibold text-eco" to={reg ? '/login' : '/register'}>{reg ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </div>
  );
}
