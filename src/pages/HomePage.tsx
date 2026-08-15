import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/context/SettingsContext'
import { AdBanner } from '@/components/AdBanner'
import { LinkCards } from '@/components/LinkCard'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Download,
  Link2,
} from 'lucide-react'

// Platform icons as SVG components
const PlatformIcons: Record<string, React.FC<{ className?: string; color?: string }>> = {
  youtube: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126S3.35 23.065 4.14 23.37c.765.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384s1.084-1.338 1.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126S20.65.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.56.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.422 2.227-.224.56-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.422-.56-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.44 1.44-1.44.794-.001 1.44.646 1.44 1.44z"/>
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.16-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.55-.27 1.15-.17 1.73.21 1.37 1.31 2.54 2.67 2.77.93.17 1.92-.07 2.68-.69.58-.47.95-1.17 1.06-1.9.13-.89.05-1.78.07-2.67.01-4.49 0-8.98.02-13.47z"/>
    </svg>
  ),
  twitter: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-10.533L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  vimeo: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.977 6.416c-.105 2.34-1.739 5.542-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.66C4.603 9.08 3.835 7.784 3.01 7.784c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.04 2.351-2.08 3.501-3.12C5.081 2.766 6.246 2.129 7.131 2.073c1.867-.18 3.016 1.097 3.443 3.831.465 2.941.786 4.771.966 5.489.536 2.437 1.126 3.656 1.77 3.656.498 0 1.246-.789 2.243-2.367.997-1.578 1.531-2.779 1.604-3.603.143-1.354-.391-2.033-1.604-2.033-.571 0-1.158.132-1.762.394 1.171-3.838 3.407-5.703 6.708-5.597 2.449.072 3.603 1.659 3.462 4.766z"/>
    </svg>
  ),
  dailymotion: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.02 0C8.57-.01 5.6 1.31 3.46 3.56 1.27 5.82-.05 8.97 0 12.22c-.05 3.28 1.27 6.44 3.46 8.69C5.6 23.16 8.57 24.48 12.02 24c3.44.01 6.4-1.31 8.56-3.56 2.19-2.25 3.51-5.41 3.46-8.69.05-3.28-1.27-6.44-3.46-8.69C18.43 1.31 15.46-.01 12.02 0zM12 2.16c5.57-.03 9.83 4.34 9.82 9.84 0 5.5-4.25 9.87-9.82 9.84-5.58.03-9.83-4.34-9.82-9.84 0-5.5 4.25-9.87 9.82-9.84zm-3 5.38v8.92h2.5v-3.79h1.69l1.68 3.79h2.81l-1.93-4.17c1.26-.48 2.06-1.58 2.06-2.92 0-1.95-1.44-3.21-3.62-3.21h-5.2v1.38zm2.5 1.52h2.13c1.08 0 1.71.48 1.71 1.31s-.63 1.31-1.71 1.31H11.5V9.06z"/>
    </svg>
  ),
  pinterest: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.497 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.462-6.227 7.462-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146.9.28 1.862.432 2.86.432 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
    </svg>
  ),
  reddit: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.945 0 1.715.769 1.715 1.715 0 .686-.406 1.275-.99 1.548.03.186.046.374.046.564 0 2.447-2.653 4.435-5.928 4.435-3.275 0-5.93-1.988-5.93-4.435 0-.192.015-.379.047-.564-.58-.273-.984-.862-.984-1.548 0-.945.768-1.715 1.713-1.715.478 0 .901.182 1.208.49 1.195-.856 2.85-1.418 4.675-1.488l.832-3.89c.056-.214.25-.36.47-.36.027 0 .055.002.082.007l2.782.583c.18-.364.55-.614.97-.614zm-8.8 7.483a1.25 1.25 0 0 0-1.248 1.248 1.25 1.25 0 0 0 1.248 1.249 1.25 1.25 0 0 0 1.249-1.249 1.25 1.25 0 0 0-1.249-1.248zm5.788 0a1.25 1.25 0 0 0-1.248 1.248 1.25 1.25 0 0 0 1.248 1.249 1.25 1.25 0 0 0 1.249-1.249 1.25 1.25 0 0 0-1.249-1.248zm-3.894 2.547c-.47.047-.92.156-1.343.319-.446.172-.806.4-1.066.67-.26.267-.398.566-.398.896 0 .329.139.629.398.896.26.27.62.498 1.066.67.423.163.874.272 1.343.319.475.046.97.046 1.445 0 .47-.047.92-.158 1.343-.32.486-.188.88-.474 1.123-.807.18-.245.288-.515.318-.797a1.36 1.36 0 0 0-.063-.58 1.38 1.38 0 0 0-.249-.464c-.23-.292-.59-.547-1.042-.724-.47-.19-.984-.302-1.53-.33-.546-.027-.957.003-1.345.143z"/>
    </svg>
  ),
  threads: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.309C2.35 18.601 1.5 15.736 1.5 12.088v-.49c.003-3.641.853-6.504 2.502-8.505C5.835 1.01 8.575-.061 12.132-.061c.009 0 .018 0 .027 0 2.94.007 5.416.747 7.348 2.197 1.905 1.428 3.207 3.509 3.871 6.18-.274-.011-.55-.016-.826-.016-1.323 0-2.61.156-3.828.462-.536-1.852-1.532-3.267-2.899-4.114-1.387-.86-3.129-1.12-5.176-.771-2.451.417-4.252 1.633-5.354 3.613-1.111 2.001-1.437 4.565-.937 7.38.47 2.628 1.587 4.862 3.229 6.459 1.63 1.586 3.646 2.464 5.834 2.536-.098-.312-.18-.633-.248-.96-.35-1.709-.33-3.14.059-4.249.386-1.1 1.146-1.932 2.259-2.471.878-.426 1.789-.64 2.708-.64.456 0 .912.05 1.36.151 1.693.379 2.988 1.303 3.748 2.673.768 1.384.89 3.058.359 4.881-.08.27-.178.533-.294.79 2.004-.605 3.569-1.826 4.658-3.629 1.115-1.846 1.678-4.175 1.678-6.924 0-.166-.002-.333-.007-.5-.05-2.353-.67-4.47-1.842-6.29l.002-.001c-1.23-1.905-3.035-3.383-5.215-4.27l-.015-.006c.127.375.235.758.325 1.15.083.37.148.74.193 1.109 1.625.68 2.96 1.756 3.87 3.128.924 1.393 1.393 2.997 1.393 4.768v.006c0 2.297-.482 4.228-1.433 5.737-.964 1.533-2.405 2.65-4.281 3.32-.069.024-.14.045-.21.068.084-.288.156-.581.215-.877.346-1.733.265-3.14-.238-4.181-.47-.974-1.31-1.694-2.465-2.118-.942-.353-1.93-.534-2.935-.534-.6 0-1.195.063-1.77.19-1.63.358-2.854 1.165-3.543 2.334-.7 1.186-.812 2.648-.33 4.343.37 1.312 1.006 2.502 1.889 3.536.889 1.04 1.98 1.862 3.239 2.44 1.276.583 2.676.888 4.16.907z"/>
    </svg>
  ),
  twitch: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286H15l7.714-7.714V0zm14.571 11.143l-3.428 3.428H14.43l-3 3v-3H6.857V1.714H20.57z"/>
    </svg>
  ),
}

export function HomePage() {
  const { t, language } = useSettings()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const platforms = [
    { id: 'youtube', name: 'YouTube', nameAr: 'يوتيوب', color: '#FF0000' },
    { id: 'facebook', name: 'Facebook', nameAr: 'فيسبوك', color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', nameAr: 'انستقرام', color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', nameAr: 'تيكتوك', color: '#000000' },
    { id: 'twitter', name: 'X (Twitter)', nameAr: 'تويتر', color: '#000000' },
    { id: 'vimeo', name: 'Vimeo', nameAr: 'فيميو', color: '#1AB7EA' },
    { id: 'dailymotion', name: 'Dailymotion', nameAr: 'دايلي موشن', color: '#0066DC' },
    { id: 'pinterest', name: 'Pinterest', nameAr: 'بنترست', color: '#BD081C' },
    { id: 'reddit', name: 'Reddit', nameAr: 'ريديت', color: '#FF4500' },
    { id: 'threads', name: 'Threads', nameAr: 'ثريدز', color: '#000000' },
    { id: 'twitch', name: 'Twitch', nameAr: 'تويتش', color: '#9146FF' },
  ]

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setLoading(true)

    // Detect platform
    const urlLower = url.toLowerCase()
    let detectedPlatform = 'unknown'
    if (urlLower.includes('youtube') || urlLower.includes('youtu.be')) detectedPlatform = 'youtube'
    else if (urlLower.includes('facebook') || urlLower.includes('fb.watch')) detectedPlatform = 'facebook'
    else if (urlLower.includes('instagram')) detectedPlatform = 'instagram'
    else if (urlLower.includes('tiktok')) detectedPlatform = 'tiktok'
    else if (urlLower.includes('twitter') || urlLower.includes('x.com')) detectedPlatform = 'twitter'
    else if (urlLower.includes('vimeo')) detectedPlatform = 'vimeo'
    else if (urlLower.includes('dailymotion') || urlLower.includes('dai.ly')) detectedPlatform = 'dailymotion'
    else if (urlLower.includes('pinterest')) detectedPlatform = 'pinterest'
    else if (urlLower.includes('reddit')) detectedPlatform = 'reddit'
    else if (urlLower.includes('threads')) detectedPlatform = 'threads'
    else if (urlLower.includes('twitch')) detectedPlatform = 'twitch'

    navigate(`/analyze?url=${encodeURIComponent(url)}&platform=${detectedPlatform}`)
  }

  const features = [
    {
      icon: Zap,
      title: language === 'ar' ? 'سريع جداً' : 'Super Fast',
      description: language === 'ar' ? 'تحميل سريع بدون انتظار' : 'Fast downloads without waiting',
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'آمن 100%' : '100% Safe',
      description: language === 'ar' ? 'بدون فيروسات أو إعلانات مزعجة' : 'No viruses or annoying ads',
    },
    {
      icon: Download,
      title: language === 'ar' ? 'جميع الجودات' : 'All Qualities',
      description: language === 'ar' ? 'من 144p إلى 4K' : 'From 144p to 4K',
    },
    {
      icon: Sparkles,
      title: language === 'ar' ? 'مجاني للأبد' : 'Free Forever',
      description: language === 'ar' ? 'لا حاجة للتسجيل أو الدفع' : 'No registration or payment needed',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              {language === 'ar' ? (
                <>
                  حمّل الفيديوهات والصوتيات
                  <span className="block mt-3 text-primary-600 dark:text-primary-400">
                    من أي منصة
                  </span>
                </>
              ) : (
                <>
                  Download Videos & Audio
                  <span className="block mt-3 text-primary-600 dark:text-primary-400">
                    from any platform
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {language === 'ar'
                ? 'أداة مجانية وسريعة لتحميل الفيديوهات والصوتيات من جميع المنصات بجودات متعددة'
                : 'Free and fast tool to download videos and audio from all platforms in multiple qualities'}
            </p>
          </div>

          {/* URL Input */}
          <div className="animate-slide-up">
            <AdBanner placement="before_analyze" className="mb-6" />

            <div className="card p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder={t('pasteLink', 'الصق الرابط هنا', 'Paste link here')}
                    className="input-primary pl-12 rtl:pl-4 rtl:pr-12 text-lg py-4"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim()}
                  className="btn-primary flex items-center justify-center gap-2 min-w-[160px] py-4 text-lg"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('analyzeLink', 'تحليل', 'Analyze')}</span>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <AdBanner placement="after_results" className="mt-6" />
          </div>
        </div>
      </section>

      {/* Platform icons */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-8">
            {t('supportedPlatforms', 'Supported Platforms', 'المنصات المدعومة')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4">
            {platforms.map((platform) => {
              const Icon = PlatformIcons[platform.id]
              return (
                <div
                  key={platform.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: platform.color + '15' }}
                  >
                    {Icon && (
                      <Icon
                        className={`w-7 h-7 sm:w-8 sm:h-8`}
                        color={platform.color}
                      />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {language === 'ar' ? platform.nameAr : platform.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:scale-105 transition-transform"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LinkCards placement="homepage" />
        </div>
      </section>
    </div>
  )
}