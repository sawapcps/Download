// src/types/index.ts -  Ÿ—Í·«  «‰√ÊË«Ÿ ·‚◊

export interface SiteSettings {
  id: string
  site_name: string
  site_name_ar: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  dark_mode_default: boolean
  default_language: 'ar' | 'en'
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  google_analytics_id: string | null
  custom_header_code: string | null
  custom_footer_code: string | null
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Ad {
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
  icon: string | null
  sort_order: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  open_in_new_tab: boolean
  ad_type: 'banner' | 'popup' | 'floating' | 'inline'
  placement_slot: string | null
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  title: string
  title_ar: string | null
  description: string | null
  description_ar: string | null
  image_url: string | null
  link_url: string
  button_color: string
  icon: string | null
  sort_order: number
  is_active: boolean
  open_in_new_tab: boolean
  created_at: string
  updated_at: string
}

export interface PlatformStats {
  id: string
  platform: string
  analyzed_count: number
  download_count: number
  video_downloads: number
  audio_downloads: number
  date: string
  created_at: string
}

export interface ActivityLog {
  id: string
  admin_id: string | null
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  title_ar: string | null
  content: string | null
  content_ar: string | null
  meta_title: string | null
  meta_title_ar: string | null
  meta_description: string | null
  meta_description_ar: string | null
  is_published: boolean
  show_in_menu: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  title_ar: string | null
  content: string | null
  content_ar: string | null
  excerpt: string | null
  excerpt_ar: string | null
  featured_image: string | null
  category_id: string | null
  meta_title: string | null
  meta_title_ar: string | null
  meta_description: string | null
  meta_description_ar: string | null
  author_id: string | null
  is_published: boolean
  published_at: string | null
  views: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface MediaInfo {
  platform: string
  title: string
  thumbnail: string
  duration: string
  author: string
  videoFormats: VideoFormat[]
  audioFormats: AudioFormat[]
}

export interface VideoFormat {
  quality: string
  resolution: string
  format: string
  size: string
  url: string
}

export interface AudioFormat {
  quality: string
  bitrate: string
  size: string
  url: string
}

export type PlacementSlot =
  | 'header'
  | 'footer'
  | 'homepage_top'
  | 'homepage_middle'
  | 'before_analyze'
  | 'after_results'
  | 'before_type_select'
  | 'after_type_select'
  | 'between_qualities'
  | 'before_download'
  | 'after_download'
  | 'sidebar'
  | 'popup'
  | 'floating'

export const SUPPORTED_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', nameAr: 'ÍË ÍË»', color: '#ff0000', icon: 'youtube' },
  { id: 'facebook', name: 'Facebook', nameAr: '·Í”»Ë„', color: '#1877f2', icon: 'facebook' },
  { id: 'instagram', name: 'Instagram', nameAr: '«Ê” ‚—«Â', color: '#e4405f', icon: 'instagram' },
  { id: 'tiktok', name: 'TikTok', nameAr: ' Í„ Ë„', color: '#000000', icon: 'tiktok' },
  { id: 'twitter', name: 'X (Twitter)', nameAr: ' ËÍ —', color: '#1da1f2', icon: 'twitter' },
  { id: 'vimeo', name: 'Vimeo', nameAr: '·ÍÂÍË', color: '#1ab7ea', icon: 'vimeo' },
  { id: 'dailymotion', name: 'Dailymotion', nameAr: 'œ«Í‰Í ÂË‘Ê', color: '#0066dc', icon: 'play' },
  { id: 'pinterest', name: 'Pinterest', nameAr: '»Ê —” ', color: '#bd081c', icon: 'pinterest' },
  { id: 'reddit', name: 'Reddit', nameAr: '—ÍœÍ ', color: '#ff4500', icon: 'reddit' },
  { id: 'threads', name: 'Threads', nameAr: ' À—Íœ“', color: '#000000', icon: 'at-sign' },
  { id: 'twitch', name: 'Twitch', nameAr: ' ËÍ ‘', color: '#9146ff', icon: 'twitch' },
]

export const AD_PLACEMENTS: { id: PlacementSlot; name: string; nameAr: string }[] = [
  { id: 'header', name: 'Header Banner', nameAr: '»«Ê— √Ÿ‰È «‰’·Õ…' },
  { id: 'footer', name: 'Footer Banner', nameAr: '»«Ê— √”·‰ «‰’·Õ…' },
  { id: 'homepage_top', name: 'Homepage Top', nameAr: '√Ÿ‰È «‰’·Õ… «‰—∆Í”Í…' },
  { id: 'homepage_middle', name: 'Homepage Middle', nameAr: 'Ë”◊ «‰’·Õ… «‰—∆Í”Í…' },
  { id: 'before_analyze', name: 'Before Analyze Button', nameAr: '‚»‰ “— «‰ Õ‰Í‰' },
  { id: 'after_results', name: 'After Results', nameAr: '»Ÿœ Ê «∆Ã «‰ Õ‰Í‰' },
  { id: 'before_type_select', name: 'Before Type Selection', nameAr: '‚»‰ «Œ Í«— «‰ÊËŸ' },
  { id: 'after_type_select', name: 'After Type Selection', nameAr: '»Ÿœ «Œ Í«— «‰ÊËŸ' },
  { id: 'between_qualities', name: 'Between Quality Options', nameAr: '»ÍÊ ŒÍ«—«  «‰ÃËœ…' },
  { id: 'before_download', name: 'Before Download Button', nameAr: '‚»‰ “— «‰ ÕÂÍ‰' },
  { id: 'after_download', name: 'After Download Button', nameAr: '»Ÿœ “— «‰ ÕÂÍ‰' },
  { id: 'sidebar', name: 'Sidebar', nameAr: '«‰‘—Í◊ «‰Ã«Ê»Í' },
  { id: 'popup', name: 'Popup', nameAr: 'Ê«·–… ÂÊ»À‚…' },
  { id: 'floating', name: 'Floating Ad', nameAr: '≈Ÿ‰«Ê Ÿ«∆Â' },
]