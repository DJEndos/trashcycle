import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api, errMsg, setToken } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ErrorBox } from '../../components/ui/ErrorBox.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

export default function DeleteAccount() {
  const { setUser } = useAuth(), nav = useNavigate();
  const [password, setPassword] = useState(''), [sure, setSure] = useState(false);
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api.delete('/users/me', { data: { password } }); setDone(true); }
    catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  const finish = () => { setToken(null); setUser(null); nav('/', { replace: true }); };

  if (done) {
    return (
      <div className="grid place-items-center gap-3 px-6 py-20 text-center">
        <CheckCircle2 size={44} className="text-eco" />
        <h1 className="text-lg font-bold">Your account has been deleted</h1>
        <p className="text-sm text-slate-500">Thank you for using EcoCycle. You have been signed out everywhere.</p>
        <button className="btn mt-2" onClick={finish}>Done</button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Delete account" />
      <form onSubmit={submit} className="space-y-4 p-4">
        <div className="space-y-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} />This is permanent and cannot be undone.</p>
          <p><b>Deleted:</b> your saved addresses, notifications, Green Points and rewards history. Your name, email, phone number and profile picture are removed from your account.</p>
          <p><b>Kept:</b> past collection records, without your name, street address, exact location or notes, because we need them for operations and legal reasons.</p>
          <p>You will not be able to sign in again. You can register again later as a new customer. You must have no pickup in progress.</p>
        </div>
        <label className="block text-sm font-medium">Enter your password to confirm
          <input className="input mt-1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-red-600" checked={sure} onChange={(e) => setSure(e.target.checked)} />
          <span>I understand that my account will be permanently deleted.</span>
        </label>
        <ErrorBox msg={err} />
        <button className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || !password || !sure}>
          {busy ? 'Deleting…' : 'Delete my account'}
        </button>
      </form>
    </div>
  );
}
