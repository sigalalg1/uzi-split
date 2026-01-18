import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as userService from '../services/userService';

interface UserContextType {
  currentUser: string | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
  createUser: (username: string, avatar?: string) => void;
  deleteUser: (username: string) => void;
  getAllUsers: () => userService.User[];
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Load current user on mount
    const user = userService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const login = (username: string) => {
    try {
      userService.setCurrentUser(username);
      setCurrentUser(username);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  const createUser = (username: string, avatar?: string) => {
    try {
      userService.createUser(username, avatar);
      login(username);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  };

  const deleteUser = (username: string) => {
    try {
      userService.deleteUser(username);
      if (currentUser === username) {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  };

  const getAllUsers = () => {
    return userService.getAllUsers();
  };

  const refreshUser = () => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        createUser,
        deleteUser,
        getAllUsers,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};



