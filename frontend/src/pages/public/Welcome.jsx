import { Link } from 'react-router-dom';
import { Leaf, Recycle } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-eco-light to-white px-6 pb-8 pt-14">
      <div className="flex items-center gap-3">
        <Leaf size={44} className="fill-eco text-eco" />
        <div><p className="text-2xl font-bold text-eco-dark">TrashCycle</p><p className="text-xs text-slate-500">Less Waste, A Greener Future</p></div>
      </div>
      <h1 className="mt-10 text-[2rem] font-bold leading-tight">Manage Your Waste for a Cleaner Tomorrow</h1>
      <p className="mt-3 text-sm text-slate-500">Sort, schedule, and track your waste collection — all in one app.</p>
      <div className="relative mt-8 flex flex-1 items-end justify-center" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-32 rounded-t-[50%] bg-eco/10" />
        <div className="relative mb-4 flex h-44 w-36 items-center justify-center rounded-b-3xl rounded-t-lg bg-eco shadow-lg">
          <div className="absolute -top-3 h-4 w-40 rounded-md bg-eco-dark" />
          <Recycle size={64} className="text-white" />
        </div>
      </div>
      <Link to="/register" className="btn mt-6 text-center">Get Started</Link>
      <Link to="/login" className="mt-4 text-center text-sm font-medium text-eco">I already have an account</Link>
      <p className="mt-6 text-center text-xs text-slate-400"><Link to="/terms" className="underline">Terms of Use</Link> · <Link to="/privacy" className="underline">Privacy Policy</Link></p>
    </div>
  );
}
