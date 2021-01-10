import { useCallback } from 'react';

const useKeyExtractor = () => {
  const keyExtractor = useCallback((item) => item?.node?.id as string, []);

  return keyExtractor;
};

export default useKeyExtractor;
