// src/components/AdBanner.tsx
// Ê”Œ…  œŸÂ ÃÂÍŸ √Â«„Ê «‰≈Ÿ‰«Ê« 

import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { X, ExternalLink } from 'lucide-react'

interface Ad {
  id: string
  title: string
  title_ar: string | null
  description: string | null
  description_ar: string | null
  image_url: string | null
  link_url: string
  button_text: string
  button_text_ar: string
  button_color: string
  sort_order: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  open_in_new_tab: boolean
  ad_type: 'banner' | 'popup' | 'floating' | 'inline'
  placement_slot: string
  created_at: string
}

const STORAGE_KEY = 'local_ads'

interface AdBannerProps {
  placement: string
  className?: string
}

export function AdBanner({ placement, className = '' }: AdBannerProps) {
  const { language } = useSettings()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadAds()
  }, [placement])

  const loadAds = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allAds = JSON.parse(stored) as Ad[]
        console.log(`?? Ã‰» ≈Ÿ‰«Ê«  ‰‰Â„«Ê: ${placement}`, allAds)
        
        // ·‰ —… «‰≈Ÿ‰«Ê«  Õ”» «‰Â„«Ê Ë«‰Ê‘«◊
        const filtered = allAds.filter(ad => 
          ad.placement_slot === placement && 
          ad.is_active === true
        )
        console.log(`?? «‰≈Ÿ‰«Ê«  «‰Â «Õ…:`, filtered)
        setAds(filtered)
      }
    } catch (error) {
      console.error('Error loading ads:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || dismissed || ads.length === 0) return null

  const ad = ads[0]
  const title = language === 'ar' && ad.title_ar ? ad.title_ar : ad.title
  const description = language === 'ar' && ad.description_ar ? ad.description_ar : ad.description
  const buttonText = language === 'ar' && ad.button_text_ar ? ad.button_text_ar : ad.button_text

  // Popup style
  if (ad.ad_type === 'popup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={title}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {description}
              </p>
            )}
            <a
              href={ad.link_url}
              target={ad.open_in_new_tab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: ad.button_color }}
            >
              {buttonText}
              {ad.open_in_new_tab && <ExternalLink className="w-4 h-4" />}
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Floating style
  if (ad.ad_type === 'floating') {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={title}
              className="w-full h-32 object-cover"
            />
          )}

          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h4>
            <a
              href={ad.link_url}
              target={ad.open_in_new_tab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: ad.button_color }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Default banner style
  return (
    <div className={`card overflow-hidden ${className}`}>
      <a
        href={ad.link_url}
        target={ad.open_in_new_tab ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row items-stretch gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        {ad.image_url && (
          <img
            src={ad.image_url}
            alt={title}
            className="w-full sm:w-48 h-32 sm:h-32 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {description}
            </p>
          )}
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium w-fit"
            style={{ backgroundColor: ad.button_color }}
          >
            {buttonText}
            {ad.open_in_new_tab && <ExternalLink className="w-3 h-3" />}
          </span>
        </div>
      </a>
    </div>
  )
}