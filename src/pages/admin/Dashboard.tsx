// src/pages/admin/Dashboard.tsx
// معدل - بدون Supabase - مع إصلاح الأخطاء

import { useEffect, useState } from 'react'
import { useAdmin } from '@/context/AdminContext'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import {
  BarChart3,
  Eye,
  Download,
  Link2,
  TrendingUp,
  Globe,
} from 'lucide-react'

interface DashboardStats {
  totalViews: number
  todayViews: number
  totalDownloads: number
  totalAnalyzed: number
  platformStats: Array<{
    platform: string
    analyzed_count: number
    download_count: number
  }>
}

export function Dashboard() {
  const { admin } = useAdmin()
  const { language } = useSettings()
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    todayViews: 0,
    totalDownloads: 0,
    totalAnalyzed: 0,
    platformStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // جلب عدد الزيارات الكلي
      const totalResult = await query('SELECT COUNT(*) as count FROM analytics') as any[]
      const totalViews = Array.isArray(totalResult) ? (totalResult[0]?.count || 0) : 0

      // جلب زيارات اليوم
      const todayResult = await query(
        "SELECT COUNT(*) as count FROM analytics WHERE DATE(created_at) = CURDATE()"
      ) as any[]
      const todayViews = Array.isArray(todayResult) ? (todayResult[0]?.count || 0) : 0

      // جلب إحصائيات المنصات
      const platformData = await query(
        `SELECT platform, SUM(analyzed_count) as analyzed_count, SUM(download_count) as download_count 
         FROM platform_stats 
         GROUP BY platform 
         ORDER BY analyzed_count DESC 
         LIMIT 10`
      ) as any[]

      // حساب إجمالي التحليلات والتحميلات
      let totalAnalyzed = 0
      let totalDownloads = 0
      
      // التأكد من أن platformData مصفوفة
      const platformStats = Array.isArray(platformData) ? platformData.map((p: any) => {
        totalAnalyzed += Number(p.analyzed_count) || 0
        totalDownloads += Number(p.download_count) || 0
        return {
          platform: p.platform || 'unknown',
          analyzed_count: Number(p.analyzed_count) || 0,
          download_count: Number(p.download_count) || 0,
        }
      }) : []

      setStats({
        totalViews,
        todayViews,
        totalDownloads,
        totalAnalyzed,
        platformStats,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformName = (id: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      youtube: { en: 'YouTube', ar: 'يوتيوب' },
      facebook: { en: 'Facebook', ar: 'فيسبوك' },
      instagram: { en: 'Instagram', ar: 'انستقرام' },
      tiktok: { en: 'TikTok', ar: 'تيكتوك' },
      twitter: { en: 'Twitter', ar: 'تويتر' },
      vimeo: { en: 'Vimeo', ar: 'فيميو' },
      dailymotion: { en: 'Dailymotion', ar: 'دايلي موشن' },
      pinterest: { en: 'Pinterest', ar: 'بنترست' },
      reddit: { en: 'Reddit', ar: 'ريديت' },
      threads: { en: 'Threads', ar: 'ثريدز' },
      twitch: { en: 'Twitch', ar: 'تويتش' },
    }
    return names[id]?.[language] || id
  }

  const statCards = [
    {
      label: language === 'ar' ? 'إجمالي الزيارات' : 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: language === 'ar' ? 'زيارات اليوم' : 'Today Visits',
      value: stats.todayViews,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: language === 'ar' ? 'إجمالي التحليلات' : 'Total Analyzed',
      value: stats.totalAnalyzed,
      icon: Link2,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: language === 'ar' ? 'إجمالي التحميلات' : 'Total Downloads',
      value: stats.totalDownloads,
      icon: Download,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {language === 'ar' ? `مرحباً، ${admin?.name || admin?.email}` : `Welcome, ${admin?.name || admin?.email}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Platform Stats */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إحصائيات المنصات' : 'Platform Statistics'}
          </h2>
        </div>

        {stats.platformStats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {language === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'}
          </p>
        ) : (
          <div className="space-y-4">
            {stats.platformStats.map((platform) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getPlatformName(platform.platform)}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'تحليل:' : 'Analyzed:'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white mr-1">
                      {platform.analyzed_count}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'تحميل:' : 'Downloads:'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white mr-1">
                      {platform.download_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}