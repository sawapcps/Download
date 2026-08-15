// server.js - نسخة نهائية تعمل مع sqlite3 فقط
import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🔧 إعدادات CORS
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 🗄️ اتصال SQLite
// ============================================
let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database('./database.sqlite');
    console.log('✅ SQLite database connected');
  }
  return db;
}

// ============================================
// 🔑 API Key
// ============================================
const API_KEY = process.env.VITE_API_KEY || 'mt_live_8TIEkEtdPRREAPGZEDuDHvmeMvLQ5poA3PPEQxEK';

// ============================================
// ============================================
// 📡 API: استعلامات قاعدة البيانات
// ============================================
app.post('/api/query', (req, res) => {
  const { sql, params = [] } = req.body;
  
  // التحقق من وجود استعلام
  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // التحقق من مفتاح API
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const upperSql = sql.toUpperCase();

  // السماح بـ SELECT, INSERT, UPDATE, DELETE
  const allowed = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  const isAllowed = allowed.some(op => upperSql.includes(op));

  if (!isAllowed) {
    return res.status(403).json({ error: 'Operation not allowed' });
  }

  // منع العمليات الخطيرة فقط
  const dangerous = ['DROP', 'ALTER', 'CREATE', 'TRUNCATE'];
  const isDangerous = dangerous.some(d => {
    const regex = new RegExp(`\\b${d}\\b`, 'i');
    return regex.test(upperSql);
  });

  if (isDangerous) {
    return res.status(403).json({ error: 'Dangerous operation not allowed' });
  }

  try {
    const database = getDb();
    console.log('📡 Executing query:', sql);
    console.log('📦 Params:', params);
    
    // تنفيذ الاستعلام
    database.all(sql, params || [], (err, rows) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('✅ Query result:', rows);
      res.json(rows);
    });
  } catch (error) {
    console.error('❌ Query error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
// ============================================
// 📋 User Agents
// ============================================
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('dailymotion.com')) return 'dailymotion';
  if (url.includes('pinterest.com')) return 'pinterest';
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('twitch.tv')) return 'twitch';
  return 'unknown';
}

function getCookiePath() {
  const cookiePath = path.join(process.cwd(), 'cookies.txt');
  return fs.existsSync(cookiePath) ? cookiePath : null;
}

async function getDirectLink(url, quality, isAudio) {
  const platform = detectPlatform(url);
  const cookiePath = getCookiePath();
  console.log(`📱 Platform: ${platform}`);
  console.log(`🍪 Cookies: ${cookiePath ? '✅ Found' : '❌ Not found'}`);

  const strategies = [];

  if (platform === 'youtube' || platform === 'unknown') {
    strategies.push({
      name: 'YouTube - Android (Video+Audio)',
      args: [
        '--no-warnings', '--no-playlist', '-g',
        '--user-agent', USER_AGENTS[3],
        '--extractor-args', 'youtube:player-client=android',
        '--geo-bypass', '--geo-bypass-country', 'US',
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      ]
    });
    strategies.push({
      name: 'YouTube - Web (Video+Audio)',
      args: [
        '--no-warnings', '--no-playlist', '-g',
        '--user-agent', USER_AGENTS[0],
        '--extractor-args', 'youtube:player-client=web',
        '--geo-bypass', '--geo-bypass-country', 'US',
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      ]
    });
  }

  if (platform === 'tiktok' || platform === 'unknown') {
    const tiktokArgs = [
      '--no-warnings', '--no-playlist', '-g',
      '--user-agent', USER_AGENTS[0],
      '--geo-bypass',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    ];
    if (cookiePath) tiktokArgs.push('--cookies', cookiePath);
    
    strategies.push({
      name: 'TikTok - Web (Video+Audio)',
      args: tiktokArgs
    });
  }

  if (platform === 'facebook' || platform === 'unknown') {
    const fbArgs = [
      '--no-warnings', '--no-playlist', '-g',
      '--user-agent', USER_AGENTS[0],
      '--geo-bypass',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    ];
    if (cookiePath) fbArgs.push('--cookies', cookiePath);
    
    strategies.push({
      name: 'Facebook - Web (Video+Audio)',
      args: fbArgs
    });
  }

  if (platform === 'instagram' || platform === 'unknown') {
    const igArgs = [
      '--no-warnings', '--no-playlist', '-g',
      '--user-agent', USER_AGENTS[0],
      '--geo-bypass',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    ];
    if (cookiePath) igArgs.push('--cookies', cookiePath);
    
    strategies.push({
      name: 'Instagram - Web (Video+Audio)',
      args: igArgs
    });
  }

  strategies.push({
    name: 'Generic - Best Quality (Video+Audio)',
    args: [
      '--no-warnings', '--no-playlist', '-g',
      '--user-agent', USER_AGENTS[0],
      '--geo-bypass',
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      ...(cookiePath ? ['--cookies', cookiePath] : [])
    ]
  });

  let finalFormatArg;
  if (isAudio) {
    finalFormatArg = '-f bestaudio[ext=m4a]/bestaudio/best';
  } else {
    const q = parseInt(quality) || 720;
    finalFormatArg = `-f bestvideo[height<=${q}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${q}][ext=mp4]/best`;
  }

  for (const strategy of strategies) {
    try {
      console.log(`🔄 Trying: ${strategy.name}`);
      
      let args = [...strategy.args];
      const formatIndex = args.findIndex(arg => arg === '-f');
      if (formatIndex !== -1) {
        args[formatIndex + 1] = finalFormatArg.replace('-f ', '');
      } else {
        args = [...args, finalFormatArg];
      }
      
      args.push(url);
      
      const { stdout } = await execFileAsync('yt-dlp', args);
      const links = stdout.trim().split('\n');
      
      if (links[0] && links[0].startsWith('http')) {
        console.log(`✅ Success with: ${strategy.name}`);
        return {
          url: links[0],
          filename: `video_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`,
          strategy: strategy.name,
        };
      }
    } catch (error) {
      console.log(`❌ ${strategy.name} failed: ${error.message.substring(0, 80)}`);
    }
  }

  console.log('❌ All strategies failed');
  return null;
}

// ============================================
// 📡 API: تحليل الرابط
// ============================================
app.get('/api/analyze', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`📊 Analyzing: ${url}`);
    const platform = detectPlatform(url);
    const cookiePath = getCookiePath();

    let args = [
      '-j',
      '--no-warnings',
      '--no-playlist',
      '--user-agent', USER_AGENTS[0],
    ];

    if (platform === 'youtube') {
      args.push('--extractor-args', 'youtube:player-client=android');
    } else if (platform === 'tiktok') {
      args.push('--extractor-args', 'tiktok:api_hostname=www.tiktok.com');
      if (cookiePath) args.push('--cookies', cookiePath);
    } else if (platform === 'facebook') {
      if (cookiePath) args.push('--cookies', cookiePath);
    } else if (platform === 'instagram') {
      if (cookiePath) args.push('--cookies', cookiePath);
    }

    args.push('--geo-bypass');
    args.push('--geo-bypass-country', 'US');
    args.push(url);

    const { stdout } = await execFileAsync('yt-dlp', args);
    const data = JSON.parse(stdout);

    const response = {
      platform: platform,
      title: data.title || 'Media File',
      thumbnail: data.thumbnail || '',
      author: data.uploader || 'Unknown',
      duration: data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')}` : '0:00',
      videoFormats: [
        { quality: '360p', format: 'MP4', size: '~15 MB' },
        { quality: '720p', format: 'MP4', size: '~30 MB' },
        { quality: '1080p', format: 'MP4', size: '~50 MB' },
      ],
      audioFormats: [
        { quality: 'MP3 High', bitrate: '320', format: 'MP3', size: '~8 MB' },
        { quality: 'MP3 Medium', bitrate: '192', format: 'MP3', size: '~5 MB' },
      ],
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    res.json({
      platform: 'unknown',
      title: 'Media Link',
      thumbnail: '',
      author: 'Unknown',
      duration: '0:00',
      videoFormats: [{ quality: '720p', format: 'MP4', size: '~30 MB' }],
      audioFormats: [{ quality: 'MP3 High', format: 'MP3', size: '~8 MB' }]
    });
  }
});

// ============================================
// 📡 API: جلب رابط التحميل
// ============================================
app.get('/api/download', async (req, res) => {
  try {
    const { url, format, quality } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const isAudio = format === 'audio';
    const qualityValue = quality?.replace('p', '').replace('HD', '').trim() || '720';

    console.log(`\n📥 Download request:`);
    console.log(`   URL: ${url}`);
    console.log(`   Quality: ${qualityValue}`);
    console.log(`   Format: ${isAudio ? 'Audio' : 'Video'}`);

    const result = await getDirectLink(url, qualityValue, isAudio);

    if (result?.url) {
      console.log(`✅ Success! Strategy: ${result.strategy}`);
      res.json({
        success: true,
        downloadUrl: result.url,
        filename: result.filename,
        strategy: result.strategy,
      });
    } else {
      console.log('❌ Failed to get direct link');
      res.status(503).json({ 
        error: 'Unable to get direct link',
        hint: 'Make sure cookies.txt exists for TikTok/Instagram/Facebook'
      });
    }
  } catch (error) {
    console.error('❌ Download error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// 📡 مسار التحقق من الصحة
// ============================================
app.get('/api/health', (req, res) => {
  const cookiePath = getCookiePath();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cookies: cookiePath ? '✅ Found' : '❌ Not found',
    platforms: ['YouTube', 'TikTok', 'Facebook', 'Instagram', 'Twitter', 'Vimeo', 'Dailymotion', 'Pinterest', 'Reddit', 'Twitch']
  });
});

// ============================================
// 🚀 تشغيل السيرفر وتهيئة قاعدة البيانات
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  const cookiePath = getCookiePath();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /api/query - SQL queries (with API key)`);
  console.log(`   GET  /api/analyze?url=URL - Analyze video`);
  console.log(`   GET  /api/download?url=URL&format=video&quality=720 - Download`);
  console.log(`   GET  /api/health - Server status`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n🍪 Cookies: ${cookiePath ? '✅ Found' : '❌ Not found'}`);
  console.log(`📱 Supported Platforms:`);
  console.log(`   ✅ YouTube (with audio)`);
  console.log(`   ✅ TikTok (with audio) - REQUIRES cookies.txt`);
  console.log(`   ✅ Facebook (with audio)`);
  console.log(`   ✅ Instagram Reels (with audio)`);
  console.log(`   ✅ Twitter/X (with audio)`);
  console.log(`   ✅ Vimeo (with audio)`);
  console.log(`   ✅ Dailymotion (with audio)`);
  console.log(`   ✅ Pinterest (with audio)`);
  console.log(`   ✅ Reddit (with audio)`);
  console.log(`   ✅ Twitch (with audio)`);
  console.log(`\n🔊 Audio is ALWAYS included with video!`);
  console.log(`📝 For TikTok/Instagram/Facebook, cookies.txt is REQUIRED\n`);
  
  try {
    const database = getDb();
    
    // إنشاء الجداول
    database.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_name TEXT DEFAULT 'App X Download',
        site_name_ar TEXT DEFAULT 'تحميل تطبيق X',
        logo_url TEXT,
        favicon_url TEXT,
        primary_color TEXT DEFAULT '#3b82f6',
        secondary_color TEXT DEFAULT '#1e40af',
        accent_color TEXT DEFAULT '#f59e0b',
        dark_mode_default INTEGER DEFAULT 1,
        default_language TEXT DEFAULT 'ar',
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        google_analytics_id TEXT,
        custom_header_code TEXT,
        custom_footer_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "site_settings" ready');
    
    database.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        is_active INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "admins" ready');
    
    database.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        title TEXT,
        title_ar TEXT,
        description TEXT,
        description_ar TEXT,
        image_url TEXT,
        link_url TEXT NOT NULL,
        button_color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        open_in_new_tab INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "links" ready');
    
    database.exec(`
      CREATE TABLE IF NOT EXISTS link_placements (
        id TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        placement TEXT NOT NULL,
        FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
        UNIQUE(link_id, placement)
      )
    `);
    console.log('✅ Table "link_placements" ready');
    
    database.exec(`
      CREATE TABLE IF NOT EXISTS ads (
        id TEXT PRIMARY KEY,
        title TEXT,
        title_ar TEXT,
        description TEXT,
        description_ar TEXT,
        image_url TEXT,
        link_url TEXT,
        button_text TEXT DEFAULT 'Learn More',
        button_text_ar TEXT DEFAULT 'اعرف المزيد',
        button_color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        open_in_new_tab INTEGER DEFAULT 1,
        ad_type TEXT DEFAULT 'banner',
        placement_slot TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "ads" ready');
    
    database.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table "activity_logs" ready');
    
    // إضافة حساب المدير
    database.run(`
      INSERT OR IGNORE INTO admins (id, email, password_hash, name, role, is_active)
      VALUES (
        'admin-001',
        'sawamadar1@gmail.com',
        'a03a39cfa6608514a534b78f74efa35eb539b8c48e88db289a253ca807fad9b4',
        'مدير الموقع',
        'super_admin',
        1
      )
    `);
    console.log('✅ Admin account created');
    
    // إضافة إعدادات افتراضية
    database.run(`
      INSERT OR IGNORE INTO site_settings (
        site_name, site_name_ar, primary_color, secondary_color, 
        accent_color, dark_mode_default, default_language,
        meta_title, meta_description, meta_keywords
      ) VALUES (
        'App X Download',
        'تحميل تطبيق X',
        '#3b82f6',
        '#1e40af',
        '#f59e0b',
        1,
        'ar',
        'App X Download - تحميل الفيديوهات والصوتيات',
        'أداة مجانية وسريعة لتحميل الفيديوهات والصوتيات من جميع المنصات',
        'تحميل, فيديو, يوتيوب, تيك توك, انستقرام, فيسبوك'
      )
    `);
    console.log('✅ Default site settings created');
    
    console.log('\n🎉 All database tables are ready!');
    
  } catch (error) {
    console.error('❌ Database init error:', error.message);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});