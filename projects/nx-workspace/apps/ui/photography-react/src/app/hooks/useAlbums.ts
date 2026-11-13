import { useEffect, useState } from 'react';
import { fetchAlbums } from '../../lib/photography.api';
import { PHOTOGRAPHY_STATE } from '../../lib/photography.consts';
import { Album, PhotographyState } from '../../lib/photography.types';

export const useAlbums = () => {
  const [state, setState] = useState<PhotographyState>(
    PHOTOGRAPHY_STATE.LOADING,
  );
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAlbums(controller.signal)
      .then(loaded => {
        setAlbums(loaded);
        setState(PHOTOGRAPHY_STATE.READY);
      })
      .catch(() => {
        if (!controller.signal.aborted) setState(PHOTOGRAPHY_STATE.ERROR);
      });
    return () => controller.abort();
  }, []);

  return { state, albums };
};
