// src/components/LinkCard.tsx
// هظدن - بدèو Supabase

import { useEffect, useState } from 'react'
import { query } from '@/lib/database'
import type { Link } from '@/types'
import { useSettings } from '@/context/SettingsContext'
import { ExternalLink } from 'lucide-react'

interface LinkCardsProps {
  placement: string
  className?: string
}

export function LinkCards({ placement, className = '' }: LinkCardsProps) {
  const { language } = useSettings()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLinks()
  }, [placement])

  const loadLinks = async () => {
    try {
      // جنب انرèاب× هظ أهاموçا
      const results = await query(
        `SELECT l.* FROM links l
         INNER JOIN link_placements lp ON lp.link_id = l.id
         WHERE l.is_active = 1 AND lp.placement = ?
         ORDER BY lp.sort_order ASC, l.sort_order ASC`,
        [placement]
      )

      if (results && Array.isArray(results)) {
        setLinks(results as Link[])
      }
    } catch (error) {
      console.error('Error loading links:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || links.length === 0) return null

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {links.map((link) => {
        const title = language === 'ar' && link.title_ar ? link.title_ar : link.title
        const description = language === 'ar' && link.description_ar ? link.description_ar : link.description

        return (
          <a
            key={link.id}
            href={link.link_url}
            target={link.open_in_new_tab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="card p-4 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              {link.image_url && (
                <img
                  src={link.image_url}
                  alt={title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </div>
          </a>
        )
      })}
    </div>
  )
}