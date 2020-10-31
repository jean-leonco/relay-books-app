import { useContext } from 'react';

import AuthContext from './AuthContext';

const useRouterAuth = () => {
  const authContext = useContext(AuthContext);

  return authContext;
};

export default useRouterAuth;
