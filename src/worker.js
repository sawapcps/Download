// src/worker.js
// ============================================
// 🚀 Worker الكامل مع دعم API و SPA
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
// 📊 جلب معلومات YouTube
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
// 🌐 صفحة عرض الفيديو
// ============================================
function videoPage(videoUrl, videoId, title) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - تحميل فيديو</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 900px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; text-align: center; margin-bottom: 20px; font-size: 24px; }
        .video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            border-radius: 12px;
            overflow: hidden;
            background: #000;
            margin-bottom: 20px;
        }
        .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .info p { color: #555; margin: 5px 0; }
        .info .title { font-size: 18px; font-weight: bold; color: #333; }
        .info .author { color: #667eea; }
        .download-section {
            text-align: center;
            padding: 20px;
            background: #f0f4ff;
            border-radius: 12px;
            border: 2px dashed #667eea;
        }
        .download-section .icon { font-size: 48px; margin-bottom: 10px; }
        .download-section .highlight {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-weight: bold;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
            transition: background 0.3s;
        }
        .btn:hover { background: #5a67d8; }
        .steps { text-align: right; margin: 15px 0; padding-right: 20px; }
        .steps li { margin: 8px 0; color: #444; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 14px; }
        .note {
            background: #fff3cd;
            padding: 12px;
            border-radius: 8px;
            color: #856404;
            margin-top: 15px;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container { padding: 15px; }
            h1 { font-size: 18px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 مشاهدة وتحميل الفيديو</h1>
        
        <div class="video-wrapper">
            <iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe>
        </div>
        
        <div class="info">
            <p class="title">📹 ${title}</p>
            <p class="author">👤 YouTube</p>
        </div>
        
        <div class="download-section">
            <div class="icon">⬇️</div>
            <h3>كيفية تحميل الفيديو</h3>
            <ol class="steps">
                <li>🖱️ <strong>اضغط كليك يمين</strong> على الفيديو أعلاه</li>
                <li>📂 اختر <span class="highlight">"حفظ الفيديو باسم..."</span></li>
                <li>💾 اختر المكان واحفظ الفيديو على جهازك</li>
            </ol>
            <p style="margin-top:10px;color:#888;font-size:14px;">
                ⚠️ ملاحظة: هذه الطريقة تعمل على متصفحات سطح المكتب
            </p>
            <div class="note">
                💡 إذا لم يعمل التحميل، استخدم زر "فتح في يوتيوب" أعلاه
            </div>
            <a href="${videoUrl}" target="_blank" class="btn">📺 فتح في يوتيوب</a>
        </div>
        
        <div class="footer">
            تم التحليل بواسطة <strong>MadarTech</strong>
        </div>
    </div>
</body>
</html>
  `;
}

// ============================================
// 🚀 Cloudflare Worker الرئيسي
// ============================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // ===== OPTIONS (CORS) =====
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
          { quality: 'audio', bitrate: '128', format: 'MP3', type: 'audio', size: 'Auto' },
        ],
      });
    }
    
    // ===== /api/watch ===== (صفحة الفيديو)
    if (path === '/api/watch' && request.method === 'GET') {
      const videoUrl = url.searchParams.get('url');
      
      if (!videoUrl) {
        return new Response('URL parameter required', { status: 400 });
      }
      
      const videoId = getYoutubeId(videoUrl);
      if (!videoId) {
        return new Response('Invalid YouTube URL', { status: 400 });
      }
      
      const metadata = await getYoutubeMetadata(videoUrl);
      const html = videoPage(videoUrl, videoId, metadata.title);
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...CORS_HEADERS,
        },
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
      
      const videoId = getYoutubeId(videoUrl);
      if (!videoId) {
        return jsonResponse({
          success: false,
          error: 'Invalid YouTube URL',
        }, 400);
      }
      
      const metadata = await getYoutubeMetadata(videoUrl);
      
      return jsonResponse({
        success: true,
        downloadUrl: `/api/watch?url=${encodeURIComponent(videoUrl)}`,
        filename: `${metadata.title || 'video'}.mp4`,
        format: format,
        quality: quality,
        platform: 'youtube',
        title: metadata.title || 'فيديو',
        _action: 'OPEN_IN_NEW_TAB',
        message: 'افتح الرابط في تبويب جديد، ثم اضغط كليك يمين على الفيديو واختر حفظ',
      });
    }
    
    // ===== SPA: تقديم تطبيق React =====
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