// src/worker.js
// ============================================
// 🚀 Worker مع دعم التحميل المباشر باستخدام ytdl-core
// ============================================

import ytdl from 'ytdl-core';

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
// 📥 الحصول على رابط التحميل المباشر
// ============================================
async function getDirectDownloadUrl(videoUrl, quality) {
  try {
    const info = await ytdl.getInfo(videoUrl);
    
    // خريطة الجودة
    const qualityMap = {
      '1080p': '1080',
      '720p': '720',
      '480p': '480',
      '360p': '360',
      'audio': 'audio'
    };
    
    const qualityValue = qualityMap[quality] || '720';
    
    let format;
    if (qualityValue === 'audio') {
      // جلب الصوت
      format = ytdl.chooseFormat(info.formats, { 
        quality: 'highestaudio',
        filter: 'audioonly'
      });
    } else {
      // جلب الفيديو مع الصوت
      format = ytdl.chooseFormat(info.formats, { 
        quality: qualityValue,
        filter: 'audioandvideo'
      });
    }
    
    if (!format) {
      throw new Error('No format found for quality: ' + quality);
    }
    
    return {
      url: format.url,
      filename: `${info.videoDetails.title}.${format.container || 'mp4'}`,
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[0]?.url || null,
      duration: info.videoDetails.lengthSeconds,
    };
  } catch (error) {
    console.error('ytdl error:', error);
    throw new Error('Failed to get download URL: ' + error.message);
  }
}

// ============================================
// 📊 جلب معلومات YouTube (بدون ytdl)
// ============================================
async function getYoutubeMetadata(videoUrl) {
  const videoId = getYoutubeId(videoUrl);
  
  if (!videoId) {
    return { videoId: null, title: 'فيديو يوتيوب', author: 'يوتيوب', thumbnail: null };
  }
  
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        videoId,
        title: data.title || 'فيديو يوتيوب',
        author: data.author_name || 'يوتيوب',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (error) {
    console.error('YouTube metadata error:', error);
  }
  
  return {
    videoId,
    title: 'فيديو يوتيوب',
    author: 'يوتيوب',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
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
      
      const metadata = await getYoutubeMetadata(videoUrl);
      
      return jsonResponse({
        success: true,
        platform: 'youtube',
        videoId: metadata.videoId,
        url: videoUrl,
        title: metadata.title || 'فيديو',
        author: metadata.author || 'يوتيوب',
        thumbnail: metadata.thumbnail || null,
        duration: '0:00',
        formats: [
          { quality: '1080p', resolution: '1920x1080', format: 'MP4', type: 'video', size: 'Auto' },
          { quality: '720p', resolution: '1280x720', format: 'MP4', type: 'video', size: 'Auto' },
          { quality: '480p', resolution: '854x480', format: 'MP4', type: 'video', size: 'Auto' },
          { quality: '360p', resolution: '640x360', format: 'MP4', type: 'video', size: 'Auto' },
          { quality: 'audio', bitrate: '320', format: 'MP3', type: 'audio', size: 'Auto' },
        ],
      });
    }
    
    // ===== /api/download ===== (رابط تحميل مباشر)
    if (path === '/api/download' && request.method === 'GET') {
      const videoUrl = url.searchParams.get('url');
      const format = url.searchParams.get('format') || 'video';
      const quality = url.searchParams.get('quality') || '720p';
      
      if (!videoUrl) {
        return jsonResponse({
          success: false,
          error: 'URL parameter required',
        }, 400);
      }
      
      try {
        // إذا كان audio، استخدم quality = 'audio'
        const qualityParam = format === 'audio' ? 'audio' : quality;
        const result = await getDirectDownloadUrl(videoUrl, qualityParam);
        
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
    
    // ===== /api/watch ===== (صفحة مشاهدة - احتياطي)
    if (path === '/api/watch' && request.method === 'GET') {
      const videoUrl = url.searchParams.get('url');
      
      if (!videoUrl) {
        return new Response('URL parameter required', { status: 400 });
      }
      
      const videoId = getYoutubeId(videoUrl);
      if (!videoId) {
        return new Response('Invalid YouTube URL', { status: 400 });
      }
      
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      return new Response(`
<!DOCTYPE html>
<html>
<head><title>مشاهدة الفيديو</title></head>
<body style="margin:0;background:#000;">
  <iframe src="${embedUrl}" style="width:100vw;height:100vh;border:none;" allowfullscreen></iframe>
</body>
</html>
      `, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...CORS_HEADERS,
        },
      });
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