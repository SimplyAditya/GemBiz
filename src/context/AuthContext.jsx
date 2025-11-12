import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config'; // Assuming API_URL is defined here

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login'); // Redirect to login after logout
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const { error: meError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      if (!token) return null;
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query Me { me { id } }`,
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.me;
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (meError) {
      logout();
    }
  }, [meError]);

  const login = async (email, password) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation ValidateUser($email: String!, $password: String!) {
              validateUser(input: { email: $email, password: $password }) {
                token
                id
                email
                name
                role
              }
            }
          `,
          variables: { email, password },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { token, id, name, role } = result.data.validateUser;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, email, name, role }));
      setToken(token);
      setUser({ id, email, name, role });
      navigate('/'); // Redirect to home after login
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateUser($name: String!, $email: String!, $password: String!, $phone: String) {
              createUser(input: { name: $name, email: $email, password: $password, phone: $phone }) {
                id
                email
                name
              }
            }
          `,
          variables: { name, email, password, phone },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      // Optionally log in the user directly after signup, or just redirect to login
      navigate('/login'); // Redirect to login page after signup
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
