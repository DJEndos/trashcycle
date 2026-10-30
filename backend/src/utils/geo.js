// Great-circle distance in kilometres between two {lat, lng} points.
export const km = (a, b) => { const R = 6371, t = (x) => (x * Math.PI) / 180, dLa = t(b.lat - a.lat), dLo = t(b.lng - a.lng); const x = Math.sin(dLa / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
