export const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', assigned: 'Assigned', on_the_way: 'On the way', arrived: 'Arrived', collected: 'Collected', completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected' };
export const fmtDate = (s) => new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
export const catNames = (p) => p.categoryIds?.map((c) => c.name).join(', ');
