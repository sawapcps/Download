import { useState } from 'react'
import { useAdmin } from '@/context/AdminContext'
import { useSettings } from '@/context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function AdminLogin() {
  const { login, isAuthenticated } = useAdmin()
  const { language } = useSettings()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'))
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {language === 'ar' ? 'سجل الدخول للمتابعة' : 'Sign in to continue'}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-primary pl-10 rtl:pl-4 rtl:pr-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-primary pl-10 rtl:pl-4 rtl:pr-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}