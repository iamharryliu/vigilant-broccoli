import { useEffect, useState } from 'react';

const VISIBILITY_EVENT = 'visibilitychange';

export const usePageVisible = () => {
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener(VISIBILITY_EVENT, sync);
    return () => document.removeEventListener(VISIBILITY_EVENT, sync);
  }, []);

  return visible;
};
