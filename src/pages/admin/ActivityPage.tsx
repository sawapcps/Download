// src/pages/admin/ActivityPage.tsx
// مع إصلاح خطأ activities.map

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import { History, User, Clock, LogIn, LogOut, Edit, Trash2, Plus } from 'lucide-react'

interface Activity {
  id: string
  admin_id: string | null
  action: string
  details: any
  created_at: string
}

export function ActivityPage() {
  const { language } = useSettings()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const data = await query(`
        SELECT a.*, admins.email 
        FROM activity_logs a
        LEFT JOIN admins ON admins.id = a.admin_id
        ORDER BY a.created_at DESC
        LIMIT 50
      `) as Activity[]
      
      // ✅ التأكد من أن البيانات مصفوفة
      setActivities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading activities:', error)
      setActivities([]) // ✅ في حالة الخطأ، نضع مصفوفة فارغة
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="w-4 h-4 text-green-500" />
      case 'logout': return <LogOut className="w-4 h-4 text-red-500" />
      case 'create': return <Plus className="w-4 h-4 text-blue-500" />
      case 'update': return <Edit className="w-4 h-4 text-yellow-500" />
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />
      default: return <History className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      login: { ar: 'تسجيل دخول', en: 'Login' },
      logout: { ar: 'تسجيل خروج', en: 'Logout' },
      create: { ar: 'إضافة', en: 'Create' },
      update: { ar: 'تعديل', en: 'Update' },
      delete: { ar: 'حذف', en: 'Delete' },
    }
    return labels[action]?.[language] || action
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'سجل النشاط' : 'Activity Log'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'سجل جميع أنشطة المشرفين' : 'All admin activities'}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {!activities || activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد سجلات' : 'No activities found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === 'ar' ? 'ستظهر هنا أنشطة المشرفين' : 'Admin activities will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'الإجراء' : 'Action'}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'المشرف' : 'Admin'}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'التفاصيل' : 'Details'}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(activity.action)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getActionLabel(activity.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {(activity as any).email || (activity.admin_id ? activity.admin_id : 'System')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.details ? JSON.stringify(activity.details) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.created_at ? new Date(activity.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}