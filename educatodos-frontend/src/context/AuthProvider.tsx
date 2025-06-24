import React, { useState, createContext, useEffect } from 'react';
import api from '../services/api';
import useLocalStorage from '../hooks/useLocalStorage';
import { useTheme } from './ThemeContext';
import { toast } from 'react-toastify';

type Props = {
  children?: React.ReactNode;
}

type IAuthContext = {
  role: string;
  setRole: (newState: string) => void;
  authenticated: boolean;
  setAuthenticated: (newState: boolean) => void;
  accessibilityType: string;
  themeOptions: any;
  setThemeOptions: (options: any) => void;
  user: any;
  setAccessibilityType: (newState: any) => void;
  setUser: (newState: any) => void;
  login: (email: string, password: string, remember?: boolean) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const initialValue = {
  role: JSON.parse(localStorage.getItem('role')),
  setRole: () => {},
  authenticated: !!JSON.parse(localStorage.getItem('access_token')),
  setAuthenticated: () => {},
  user: null,
  themeOptions: null,
  setThemeOptions: () => {},
  setUser: () => {},
  setToken: () => {},
  login: () => {},
  logout: () => {}
}

export const AuthContext = createContext<IAuthContext>(initialValue);

export const AuthProvider = ({ children }: Props) => {

  const [ authenticated, setAuthenticated ] = useState(initialValue.authenticated);
  const [ user, setUser ] = useState(initialValue.user);
  const [ themeOptions, setThemeOptions ] = useLocalStorage('theme_options', '');
  const [ role, setRole ] = useLocalStorage('role', '');
  const [ accessibilityType, setAccessibilityType ] = useLocalStorage('accessibility_type', '');
  const [ token, setToken ] = useLocalStorage('access_token', '');

  useEffect(() => {
    setAuthenticated(!!token);
  }, [token]);


  useEffect(() => {
    const loadUser = async () => {
      if(token){
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data);
        } catch (err) {
          console.log('Failed to load user', err.response);
        }
      }
      
    };
    loadUser();
  }, [token]);

  const login = async (email: string, password: string, pre_auth: boolean = false) => {
    
    try{
      const { data } = await api.post('/auth/login', {
        role,
        email,
        password
      })

      toast('Logado com sucesso', { type: 'success' })

      setUser(data.data.user);
      if(!pre_auth){
        setToken(data.data.token);
        setAuthenticated(true);
        // if(!accessibilityType && !token){
          // window.location.href = '/';
        // }
      }

      return {
        token: data.data.token
      }


    }catch(e) {
      toast(e.response.data.message, { type: 'error' })
    }

  };

  const { setTheme } = useTheme();

  const logout = () => {
    // setToken('');
    window.localStorage.removeItem('accessibility_type')
    window.localStorage.removeItem('access_token')
    setUser(null);
    // setAccessibilityType('');
    setThemeOptions(null);
    setTheme('light')
    window.location.href = '/'
  };

  return (
    <AuthContext.Provider value={{ role, token, setRole, authenticated, setToken, setAuthenticated, themeOptions, setThemeOptions, accessibilityType, setAccessibilityType, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};