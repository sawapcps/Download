/// <reference types="vite/client" />

// src/context/AdminContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { 
  getAdminByEmail, 
  updateAdminLastLogin, 
  logAdminActivity,
  getAdminById 
} from '@/lib/database'
import type { Admin } from '@/types'

interface AdminContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  sessionExpiring: boolean
  extendSession: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const SESSION_KEY = 'admin_session'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SESSION_WARNING = 5 * 60 * 1000 // 5 minutes before expiry

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiring, setSessionExpiring] = useState(false)
  
  // استخدام ref لمنع التكرار
  const isChecking = useRef(false)
  const lastCheckTime = useRef(0)
  const checkInterval = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return computedHash === storedHash
  }

  const logout = useCallback(async () => {
    if (admin) {
      await logAdminActivity(admin.id, 'logout', {})
    }
    localStorage.removeItem(SESSION_KEY)
    setAdmin(null)
    setSessionExpiring(false)
  }, [admin])

  const checkSession = useCallback(async () => {
    // منع التكرار
    if (isChecking.current) return
    
    const now = Date.now()
    // التحقق كل 5 ثواني فقط
    if (now - lastCheckTime.current < 5000) return
    lastCheckTime.current = now
    
    isChecking.current = true
    
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        const nowTime = Date.now()

        if (session.expires > nowTime) {
          if (session.expires - nowTime < SESSION_WARNING) {
            setSessionExpiring(true)
          }

          const adminData = await getAdminById(session.adminId)

          if (adminData && adminData.is_active === 1) {
            // تحديث admin فقط إذا تغير
            setAdmin(prev => {
              if (prev?.id === adminData.id) return prev
              return adminData as Admin
            })
          } else {
            localStorage.removeItem(SESSION_KEY)
            setAdmin(null)
          }
        } else {
          localStorage.removeItem(SESSION_KEY)
          setAdmin(null)
        }
      }
    } catch (error) {
      console.error('Session check error:', error)
    } finally {
      isChecking.current = false
      setLoading(false)
    }
  }, [])

  // التحقق الأولي
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // إعداد الـ Interval للتحقق الدوري
  useEffect(() => {
    // تنظيف الـ Interval القديم
    if (checkInterval.current) {
      clearInterval(checkInterval.current)
      checkInterval.current = null
    }
    
    // التحقق كل 30 ثانية بدلاً من 60
    checkInterval.current = setInterval(checkSession, 30000)

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current)
        checkInterval.current = null
      }
    }
  }, [checkSession])

  // إدارة الـ Inactivity Timer
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
        inactivityTimer.current = null
      }
      
      if (admin) {
        inactivityTimer.current = setTimeout(() => {
          logout()
        }, SESSION_TIMEOUT)
      }
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer)
    })

    // بدء التايمر إذا كان هناك مدير
    if (admin) {
      resetInactivityTimer()
    }

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer)
      })
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
        inactivityTimer.current = null
      }
    }
  }, [admin, logout, SESSION_TIMEOUT])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const adminData = await getAdminByEmail(email)

      if (!adminData) {
        return { success: false, error: 'Invalid email or password' }
      }

      const isValid = await verifyPassword(password, adminData.password_hash)

      if (!isValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      await updateAdminLastLogin(adminData.id)

      const session = {
        adminId: adminData.id,
        expires: Date.now() + SESSION_TIMEOUT,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))

      const { password_hash, ...adminWithoutPassword } = adminData
      setAdmin(adminWithoutPassword as Admin)
      setSessionExpiring(false)

      await logAdminActivity(adminData.id, 'login', { email })

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const extendSession = () => {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (sessionData) {
      const session = JSON.parse(sessionData)
      session.expires = Date.now() + SESSION_TIMEOUT
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setSessionExpiring(false)
    }
  }

  return (
    <AdminContext.Provider value={{
      admin,
      loading,
      login,
      logout,
      isAuthenticated: !!admin,
      sessionExpiring,
      extendSession,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}