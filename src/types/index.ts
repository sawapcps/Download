// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS - السماح لجميع المواقع بالاتصال
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// 📡 نقاط النهاية
// ============================================

// 1. نقطة نهاية الصحة
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platforms: ['YouTube', 'TikTok', 'Facebook', 'Instagram', 'Twitter', 'Vimeo', 'Dailymotion', 'Pinterest', 'Reddit', 'Twitch']
  });
});

// 2. نقطة نهاية التحليل
app.get('/api/analyze', async (c) => {
  const url = c.req.query('url');
  if (!url) {
    return c.json({ error: 'URL is required' }, 400);
  }

  // هنا يمكنك إضافة كود تحليل الفيديو الحقيقي
  return c.json({
    platform: 'youtube',
    title: 'Sample Video',
    thumbnail: '',
    author: 'Unknown',
    duration: '0:00',
    videoFormats: [
      { quality: '360p', format: 'MP4', size: '~15 MB' },
      { quality: '720p', format: 'MP4', size: '~30 MB' },
      { quality: '1080p', format: 'MP4', size: '~50 MB' },
    ],
    audioFormats: [
      { quality: 'MP3 High', bitrate: '320', format: 'MP3', size: '~8 MB' },
      { quality: 'MP3 Medium', bitrate: '192', format: 'MP3', size: '~5 MB' },
    ],
  });
});

// 3. نقطة نهاية التحميل
app.get('/api/download', async (c) => {
  const url = c.req.query('url');
  if (!url) {
    return c.json({ error: 'URL is required' }, 400);
  }

  return c.json({
    success: true,
    downloadUrl: 'https://example.com/video.mp4',
    filename: 'video.mp4',
    strategy: 'Cloudflare Worker'
  });
});

// 4. نقطة نهاية الاستعلامات (الاتصال بـ MadarTech)
app.post('/api/query', async (c) => {
  const body = await c.req.json();
  const { sql, params = [] } = body;

  if (!sql) {
    return c.json({ error: 'SQL query is required' }, 400);
  }

  const API_KEY = c.env.VITE_API_KEY;
  const API_URL = c.env.VITE_API_URL || 'https://cloud.madartech.uk';

  try {
    const response = await fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ sql, params }),
    });

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. نقطة نهاية افتراضية
app.get('*', (c) => {
  return c.json({
    message: 'App X Download API is running on Cloudflare Workers',
    endpoints: {
      health: '/api/health',
      analyze: '/api/analyze?url=VIDEO_URL',
      download: '/api/download?url=VIDEO_URL&format=video&quality=720',
      query: '/api/query (POST)',
    },
  });
});

export default app;