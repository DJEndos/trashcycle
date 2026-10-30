import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../services/api.js';

export function useFetch(path, params, deps = []) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const run = useCallback(() => api.get(path, { params }).then((r) => { setData(r.data); setError(''); }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, JSON.stringify(params), ...deps]);
  useEffect(() => { run(); }, [run]);
  return { data, setData, error, loading, reload: run };
}
