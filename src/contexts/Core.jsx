import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Core = createContext();

export const CoreProvider = ({ children }) => {
  const [loading, setLoading] = useState(/* true */ false);

  useEffect(() => {}, []);

  const coreValue = useMemo(
    () => ({
      loading
    }),
    [loading]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Core.Provider value={coreValue}>{children}</Core.Provider>;
};

export const useCore = () => useContext(Core);
