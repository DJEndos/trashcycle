import { PageHeader } from '../../components/layout/PageHeader.jsx';

export default function Tutorial() {
  const steps = [['Pick your waste type', 'Choose the categories you want collected, such as plastic or paper.'], ['Choose a date and time', 'Select a day and one of the available time slots.'], ['Confirm your address', 'Use a saved address or add a new one.'], ['Track your pickup', 'Follow the status from assigned to collected, then earn points.']];
  return (
    <>
      <PageHeader title="How it works" />
      <ol className="space-y-3 p-4">{steps.map(([t, d], i) => <li key={t} className="card flex gap-3 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-eco text-sm font-bold text-white">{i + 1}</span><div><p className="font-semibold">{t}</p><p className="text-sm text-slate-500">{d}</p></div></li>)}</ol>
    </>
  );
}
