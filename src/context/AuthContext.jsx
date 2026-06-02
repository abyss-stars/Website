import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getCurrentUser, saveSession, clearSession,
  findUserByUsername, createUser as createUserInStorage,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 启动时从 session 恢复登录状态
  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const user = findUserByUsername(username);
    if (!user) return { error: '用户名不存在' };
    if (user.password !== password) return { error: '密码错误' };
    saveSession(user.id);
    setCurrentUser(user);
    return { success: true };
  }, []);

  const register = useCallback(({ username, password, nickname }) => {
    const result = createUserInStorage({ username, password, nickname });
    if (result.error) return result;
    saveSession(result.user.id);
    setCurrentUser(result.user);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
