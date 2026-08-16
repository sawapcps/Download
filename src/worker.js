// src/worker.js
// ============================================
// 🚀 Worker مع خدمة y2mate للتحميل
// ============================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

// ============================================
// 🎬 استخراج YouTube ID
// ============================================
function getYoutubeId(videoUrl) {
  try {
    const parsed = new URL(videoUrl);
    if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' && parts[1]) return parts[1];
      if (parts[0] === 'embed' && parts[1]) return parts[1];
    }
  } catch (_) {}
  return null;
}

// ============================================
// 📥 الحصول على رابط التحميل من y2mate
// ============================================
async function getDirectDownloadUrl(videoUrl, quality) {
  const videoId = getYoutubeId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');
  
  // استخدام y2mate
  const formData = new URLSearchParams();
  formData.append('url', `https://www.youtube.com/watch?v=${videoId}`);
  formData.append('q', 'mp4');
  
  const response = await fetch('https://www.y2mate.com/mates/en68/analyzeV2/ajax', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.y2mate.com/',
      'Origin': 'https://www.y2mate.com',
    },
    body: formData.toString(),
  });
  
  const text = await response.text();
  
  try {
    const data = JSON.parse(text);
    
    if (data && data.links) {
      const links = JSON.parse(data.links);
      const qualityMap = {
        '1080': '1080',
        '720': '720',
        '480': '480',
        '360': '360'
      };
      const q = qualityMap[quality] || '720';
      
      // محاولة الحصول على الفيديو بالجودة المطلوبة
      let videoLink = null;
      
      if (links.mp4) {
        if (links.mp4[q] && links.mp4[q].d) {
          videoLink = links.mp4[q].d;
        } else {
          // جلب أي جودة متاحة
          const keys = Object.keys(links.mp4);
          for (const key of keys) {
            if (links.mp4[key].d) {
              videoLink = links.mp4[key].d;
              break;
            }
          }
        }
      }
      
      if (videoLink) {
        const url = videoLink.startsWith('http') ? videoLink : `https:${videoLink}`;
        return {
          url: url,
          filename: `${videoId}.mp4`,
          title: data.title || 'فيديو يوتيوب',
          author: data.author || 'يوتيوب',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: data.duration || '0:00',
        };
      }
    }
    
    throw new Error('No video link found');
  } catch (error) {
    console.error('Parse error:', text);
    throw new Error('فشل تحليل استجابة الخادم');
  }
}

// ============================================
// 🚀 Cloudflare Worker الرئيسي
// ============================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // ===== OPTIONS =====
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }
    
    // ===== /api/health =====
    if (path === '/api/health') {
      return jsonResponse({
        status: 'healthy',
        time: new Date().toISOString(),
      });
    }
    
    // ===== /api/query =====
    if (path === '/api/query' && request.method === 'POST') {
      return jsonResponse([]);
    }
    
    // ===== /api/analyze =====
    if (path === '/api/analyze' && request.method === 'GET') {
      const videoUrl = url.searchParams.get('url');
      
      if (!videoUrl) {
        return jsonResponse({
          success: false,
          error: 'URL parameter required',
        }, 400);
      }
      
      try {
        new URL(videoUrl);
      } catch (_) {
        return jsonResponse({
          success: false,
          error: 'Invalid URL format',
        }, 400);
      }
      
      const videoId = getYoutubeId(videoUrl);
      
      return jsonResponse({
        success: true,
        platform: 'youtube',
        videoId: videoId,
        url: videoUrl,
        title: 'فيديو يوتيوب',
        author: 'يوتيوب',
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
        duration: '0:00',
        formats: [
          { quality: '1080p', resolution: '1920x1080', format: 'MP4', type: 'video' },
          { quality: '720p', resolution: '1280x720', format: 'MP4', type: 'video' },
          { quality: '480p', resolution: '854x480', format: 'MP4', type: 'video' },
          { quality: '360p', resolution: '640x360', format: 'MP4', type: 'video' },
          { quality: 'audio', bitrate: '320', format: 'MP3', type: 'audio' },
        ],
      });
    }
    
    // ===== /api/download =====
    if (path === '/api/download' && request.method === 'GET') {
      const videoUrl = url.searchParams.get('url');
      const format = url.searchParams.get('format') || 'video';
      const quality = url.searchParams.get('quality') || '720';
      
      if (!videoUrl) {
        return jsonResponse({
          success: false,
          error: 'URL parameter required',
        }, 400);
      }
      
      try {
        const result = await getDirectDownloadUrl(videoUrl, quality);
        
        return jsonResponse({
          success: true,
          downloadUrl: result.url,
          filename: result.filename,
          title: result.title,
          author: result.author,
          thumbnail: result.thumbnail,
          duration: result.duration,
          format: format,
          quality: quality,
        });
      } catch (error) {
        console.error('Download error:', error);
        return jsonResponse({
          success: false,
          error: error.message || 'فشل تحميل الفيديو',
        }, 502);
      }
    }
    
    // ===== SPA =====
    try {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) {
        return asset;
      }
    } catch (_) {}
    
    try {
      return await env.ASSETS.fetch(
        new Request(`${url.origin}/index.html`, request)
      );
    } catch (error) {
      return jsonResponse({
        error: 'Application assets unavailable',
      }, 500);
    }
  },
};