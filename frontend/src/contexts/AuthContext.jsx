import { createContext, useContext, useState, useEffect } from 'react';
import { client } from '../Supabase/client'; // 👈 asegúrate de tener esta importación

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 🔹 Intentar obtener usuario actual de Supabase
      const { data, error } = await client.auth.getUser();
      if (data?.user) {
        console.log('✅ User loaded from Supabase:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('streetcred_auth', JSON.stringify({ user: data.user }));
      } else {
        console.log('❌ No Supabase user session found:', error);
        // Intentar cargar del localStorage como fallback
        const savedAuth = localStorage.getItem('streetcred_auth');
        if (savedAuth) {
          try {
            const authData = JSON.parse(savedAuth);
            setUser(authData.user);
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Error parsing saved auth:', e);
            localStorage.removeItem('streetcred_auth');
          }
        }
      }

      setLoading(false);
    };

    initAuth();

    // 🔹 Escuchar cambios en la sesión (login, logout)
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      if (session?.user) {
        localStorage.setItem('streetcred_auth', JSON.stringify({ user: session.user }));
      } else {
        localStorage.removeItem('streetcred_auth');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('streetcred_auth', JSON.stringify({ user: userData }));
  };

  const logout = async () => {
    await client.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('streetcred_auth');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading session...</div> : children}
    </AuthContext.Provider>
  );
};

