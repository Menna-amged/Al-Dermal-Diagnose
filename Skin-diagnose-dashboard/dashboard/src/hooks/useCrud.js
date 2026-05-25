// hooks/useCrud.js

import { useState, useEffect, useCallback } from 'react';

export function useCrud(service) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setItems(await service.getAll()); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, [service]);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const item = await service.create(data);
    setItems(prev => [item, ...prev]);
    return item;
  };

  const update = async (id, data) => {
    const item = await service.update(id, data);
    setItems(prev => prev.map(x => x.id === id ? item : x));
    return item;
  };

  const remove = async (id) => {
    await service.remove(id);
    setItems(prev => prev.filter(x => x.id !== id));
  };

  return { items, setItems, loading, error, reload: load, create, update, remove };
}
