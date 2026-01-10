// import React, { createContext, useContext, useState } from 'react';

// type AuthContextType = {
//   isLoggedIn: boolean;
//   setIsLoggedIn: (v: boolean) => void;
// };

// const AuthContext = createContext<AuthContextType>({
//   isLoggedIn: false,
//   setIsLoggedIn: () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import React, { createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }: any) => {
  return children;
};
