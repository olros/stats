import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { useState } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};
