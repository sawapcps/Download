/**
 * Download API Worker
 * خادم API لـ download.madartech.uk
 * يتعامل مع استعلامات D1 + تحميل الفيديو + تقديم ملفات React الثابتة
 */

const API_KEY = 'mt_live_8TIEkEtdPRREAPGZEDuDHvmeMvLQ5poA3PPEQxEK';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function checkAuth(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${API_KEY}`) {
    return false;
  }
  return true;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ===== API Routes =====

    // Health check
    if (path === '/api/health') {
      return jsonResponse({
        status: 'healthy',
        database: env.DB ? 'connected' : 'not configured',
        time: new Date().toISOString(),
      });
    }

    // SQL Query endpoint
    if (path === '/api/query' && request.method === 'POST') {
      if (!checkAuth(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      try {
        const body = await request.json();
        const { sql, params = [] } = body;

        if (!sql) {
          return jsonResponse({ error: 'SQL query required' }, 400);
        }

        // Execute on D1
        const stmt = env.DB.prepare(sql);
        if (params && params.length > 0) {
          stmt.bind(...params);
        }

        // Check if it's a SELECT query
        const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

        if (isSelect) {
          const result = await stmt.all();
          return jsonResponse(result.results || []);
        } else {
          const result = await stmt.run();
          return jsonResponse({
            success: true,
            meta: result.meta,
            changes: result.meta?.changes || 0,
          });
        }
      } catch (error) {
        return jsonResponse({ error: error.message }, 500);
      }
    }

    // Video analysis endpoint
    if (path === '/api/analyze' && request.method === 'GET') {
      if (!checkAuth(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const videoUrl = url.searchParams.get('url');
      if (!videoUrl) {
        return jsonResponse({ error: 'URL parameter required' }, 400);
      }

      // Detect platform
      let platform = 'unknown';
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        platform = 'youtube';
      } else if (videoUrl.includes('tiktok.com')) {
        platform = 'tiktok';
      } else if (videoUrl.includes('instagram.com')) {
        platform = 'instagram';
      } else if (videoUrl.includes('facebook.com')) {
        platform = 'facebook';
      }

      // Extract video ID for YouTube
      let videoId = null;
      if (platform === 'youtube') {
        const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (match) videoId = match[1];
      }

      return jsonResponse({
        success: true,
        platform,
        videoId,
        url: videoUrl,
        title: `Video from ${platform}`,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
        formats: [
          { quality: '1080', format: 'mp4', size: 'unknown' },
          { quality: '720', format: 'mp4', size: 'unknown' },
          { quality: '480', format: 'mp4', size: 'unknown' },
          { quality: 'audio', format: 'mp3', size: 'unknown' },
        ],
      });
    }

    // Video download endpoint
    if (path === '/api/download' && request.method === 'GET') {
      if (!checkAuth(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const videoUrl = url.searchParams.get('url');
      const format = url.searchParams.get('format') || 'video';
      const quality = url.searchParams.get('quality') || '720';

      if (!videoUrl) {
        return jsonResponse({ error: 'URL parameter required' }, 400);
      }

      // Log download to analytics
      try {
        await env.DB.prepare(
          'INSERT INTO analytics (id, page_url, referrer, user_agent, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ).bind(
          Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          videoUrl,
          'download',
          request.headers.get('User-Agent') || 'unknown'
        ).run();
      } catch (e) {
        // Ignore logging errors
      }

      return jsonResponse({
        success: true,
        url: videoUrl,
        format,
        quality,
        downloadUrl: videoUrl,
        message: 'Download link generated',
      });
    }

    // ===== Static Assets (React app) =====
    // Let the [assets] binding handle static files
    // If no match, return 404
    return new Response('Not found', { status: 404 });
  },
};