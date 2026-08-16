// src/worker.js
// ============================================
// 🚀 Worker مع خدمات تحميل بديلة
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
// 📥 الحصول على رابط التحميل (طريقة جديدة)
// ============================================
async function getDirectDownloadUrl(videoUrl, quality) {
  const videoId = getYoutubeId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');
  
  // 🎯 الخدمة 1: Convert2MP3 (يدعم الفيديو)
  try {
    const response = await fetch(`https://api.convert2mp3s.com/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        format: 'mp4',
        quality: quality || '720',
      }),
    });
    
    const data = await response.json();
    if (data && data.downloadUrl) {
      return {
        url: data.downloadUrl,
        filename: `${videoId}.mp4`,
      };
    }
  } catch (e) {
    console.log('Convert2MP3 failed:', e.message);
  }
  
  // 🎯 الخدمة 2: YouTube MP3 Downloader (يدعم الفيديو أيضاً)
  try {
    const response = await fetch(`https://youtube-mp3-downloader2.vercel.app/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: videoId,
        quality: quality || '720',
      }),
    });
    
    const data = await response.json();
    if (data && data.url) {
      return {
        url: data.url,
        filename: `${videoId}.mp4`,
      };
    }
  } catch (e) {
    console.log('YouTube MP3 failed:', e.message);
  }
  
  // 🎯 الخدمة 3: 9convert (بديل)
  try {
    const response = await fetch(`https://9convert.com/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=https://www.youtube.com/watch?v=${videoId}&format=mp4&quality=${quality}`,
    });
    
    const data = await response.json();
    if (data && data.downloadUrl) {
      return {
        url: data.downloadUrl,
        filename: `${videoId}.mp4`,
      };
    }
  } catch (e) {
    console.log('9convert failed:', e.message);
  }
  
  throw new Error('جميع خدمات التحميل فشلت');
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