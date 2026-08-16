// src/worker.js
// ============================================
// 🚀 Worker مع دعم السيرفر الخارجي على Render
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
// 📥 الحصول على رابط التحميل من السيرفر الخارجي
// ============================================
const BACKEND_URL = 'https://youtube-downloader-opwf.onrender.com';

async function getDirectDownloadUrl(videoUrl, quality) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/download?url=${encodeURIComponent(videoUrl)}&quality=${quality}`
    );
    
    const data = await response.json();
    
    if (data && data.downloadUrl) {
      return {
        url: data.downloadUrl,
        filename: data.filename || `video_${Date.now()}.mp4`,
        title: data.title || 'فيديو يوتيوب',
        author: data.author || 'يوتيوب',
        duration: data.duration || 0,
      };
    }
    
    throw new Error(data.error || 'فشل الحصول على رابط التحميل');
  } catch (error) {
    console.error('Backend error:', error);
    throw new Error('فشل الاتصال بخادم التحميل');
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
        backend: BACKEND_URL,
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
      
      // جلب المعلومات من السيرفر الخارجي
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/analyze?url=${encodeURIComponent(videoUrl)}`
        );
        const data = await response.json();
        
        if (data && data.success) {
          return jsonResponse({
            success: true,
            platform: 'youtube',
            videoId: getYoutubeId(videoUrl),
            url: videoUrl,
            title: data.title || 'فيديو يوتيوب',
            author: data.author || 'يوتيوب',
            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${getYoutubeId(videoUrl)}/hqdefault.jpg`,
            duration: data.duration || '0:00',
            formats: [
              { quality: '1080', resolution: '1920x1080', format: 'MP4', type: 'video' },
              { quality: '720', resolution: '1280x720', format: 'MP4', type: 'video' },
              { quality: '480', resolution: '854x480', format: 'MP4', type: 'video' },
              { quality: '360', resolution: '640x360', format: 'MP4', type: 'video' },
              { quality: 'audio', bitrate: '320', format: 'MP3', type: 'audio' },
            ],
          });
        }
      } catch (error) {
        console.error('Backend analyze error:', error);
      }
      
      // رد احتياطي في حال فشل السيرفر الخارجي
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
          { quality: '1080', resolution: '1920x1080', format: 'MP4', type: 'video' },
          { quality: '720', resolution: '1280x720', format: 'MP4', type: 'video' },
          { quality: '480', resolution: '854x480', format: 'MP4', type: 'video' },
          { quality: '360', resolution: '640x360', format: 'MP4', type: 'video' },
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