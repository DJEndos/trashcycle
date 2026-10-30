export const str = (v) => (typeof v === 'string' ? v : '');
export const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
