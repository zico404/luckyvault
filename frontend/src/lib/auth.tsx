import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from './api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getProfile()
        .then(res => {
          if (res.success) setUser(res.data)
        })
        .catch(() => api.clearTokens())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }

    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.login(email, password)
      setUser(res.data.user)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please try again.' }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const res = await api.register(email, password, displayName)
      setUser(res.data.user)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Please try again.' }
    }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    api.logout().catch(() => {})
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
