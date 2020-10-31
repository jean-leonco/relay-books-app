import { createContext } from 'react';

interface IAuthContext {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>();

export default AuthContext;
