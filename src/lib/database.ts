// src/lib/database.ts
/// <reference types="vite/client" />

// ============================================
// اعدادات الاتصال بالخادم
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY || 'mt_live_8TIEkEtdPRREAPGZEDuDHvmeMvLQ5poA3PPEQxEK';
// ============================================
// دالة مساعدة للاستعلامات
// ============================================

export async function query(sql: string, params?: any[]) {
  try {
    console.log('Sending query to:', `${API_URL}/api/query`);
    console.log('SQL:', sql);
    console.log('Params:', params);

    const response = await fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ sql, params: params || [] }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Database query failed');
    }

    const data = await response.json();
    console.log('Query result:', data);
    return data;
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

export async function queryOne(sql: string, params?: any[]) {
  const results = await query(sql, params) as any[];
  return results[0] || null;
}

// ============================================
// ادارة المديرين (Admins)
// ============================================

export async function getAdminByEmail(email: string) {
  return queryOne(
    'SELECT id, email, name, role, is_active, last_login, created_at, password_hash FROM admins WHERE email = ? AND is_active = 1',
    [email]
  );
}

export async function getAdminById(id: string) {
  return queryOne(
    'SELECT id, email, name, role, is_active, last_login, created_at FROM admins WHERE id = ? AND is_active = 1',
    [id]
  );
}

export async function updateAdminLastLogin(id: string) {
  return query(
    'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );
}

export async function logAdminActivity(adminId: string, action: string, details?: any) {
  return query(
    `INSERT INTO activity_logs (id, admin_id, action, details, created_at) 
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [adminId || 'system', action, JSON.stringify(details || {})]
  );
}

export async function getAllAdmins() {
  return query(
    'SELECT id, email, name, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
  );
}

export async function createAdmin(email: string, passwordHash: string, name: string, role: string = 'admin') {
  return query(
    `INSERT INTO admins (id, email, password_hash, name, role, is_active, created_at) 
     VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
    [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), email, passwordHash, name, role]
  );
}

export async function updateAdmin(id: string, data: any) {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.email) { updates.push('email = ?'); values.push(data.email); }
  if (data.name) { updates.push('name = ?'); values.push(data.name); }
  if (data.role) { updates.push('role = ?'); values.push(data.role); }
  if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
  if (data.password_hash) { updates.push('password_hash = ?'); values.push(data.password_hash); }

  if (updates.length === 0) return null;

  values.push(id);
  return query(
    `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteAdmin(id: string) {
  return query('DELETE FROM admins WHERE id = ?', [id]);
}

// ============================================
// ادارة الاعلانات (Ads)
// ============================================

export async function getAds(placement?: string) {
  let sql = 'SELECT * FROM ads WHERE is_active = 1';
  const params: any[] = [];

  if (placement) {
    sql += ' AND placement_slot = ?';
    params.push(placement);
  }

  sql += ' ORDER BY sort_order ASC';

  return query(sql, params);
}

export async function getAdById(id: string) {
  return queryOne('SELECT * FROM ads WHERE id = ?', [id]);
}

export async function createAd(data: any) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '');
  const placeholders = fields.map(() => '?');
  const values = fields.map(k => data[k]);

  return query(
    `INSERT INTO ads (id, ${fields.join(', ')}, created_at) 
     VALUES (?, ${placeholders.join(', ')}, CURRENT_TIMESTAMP)`,
    [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), ...values]
  );
}

export async function updateAd(id: string, data: any) {
  const updates: string[] = [];
  const values: any[] = [];

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  });

  if (updates.length === 0) return null;

  values.push(id);
  return query(
    `UPDATE ads SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteAd(id: string) {
  return query('DELETE FROM ads WHERE id = ?', [id]);
}

// ============================================
// ادارة الروابط (Links)
// ============================================

export async function getLinks(placement?: string) {
  let sql = 'SELECT * FROM links WHERE is_active = 1';
  const params: any[] = [];

  if (placement) {
    sql += ' AND id IN (SELECT link_id FROM link_placements WHERE placement = ?)';
    params.push(placement);
  }

  sql += ' ORDER BY sort_order ASC';

  return query(sql, params);
}

export async function getLinkById(id: string) {
  return queryOne('SELECT * FROM links WHERE id = ?', [id]);
}

export async function createLink(data: any) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '');
  const placeholders = fields.map(() => '?');
  const values = fields.map(k => data[k]);

  return query(
    `INSERT INTO links (id, ${fields.join(', ')}, created_at) 
     VALUES (?, ${placeholders.join(', ')}, CURRENT_TIMESTAMP)`,
    [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), ...values]
  );
}

export async function updateLink(id: string, data: any) {
  const updates: string[] = [];
  const values: any[] = [];

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  });

  if (updates.length === 0) return null;

  values.push(id);
  return query(
    `UPDATE links SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteLink(id: string) {
  return query('DELETE FROM links WHERE id = ?', [id]);
}

export async function getLinkPlacements(linkId: string) {
  return query('SELECT placement FROM link_placements WHERE link_id = ?', [linkId]);
}

export async function saveLinkPlacements(linkId: string, placements: string[]) {
  await query('DELETE FROM link_placements WHERE link_id = ?', [linkId]);

  if (placements.length > 0) {
    const values = placements.map(p => [linkId, p]);
    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flattened = values.flat();
    return query(
      `INSERT INTO link_placements (id, link_id, placement) VALUES ${placeholders}`,
      [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), ...flattened]
    );
  }
  return null;
}

// ============================================
// التحليلات والاحصائيات
// ============================================

export async function logAnalytics(pageUrl: string, referrer: string, userAgent: string) {
  return query(
    `INSERT INTO analytics (id, page_url, referrer, user_agent, created_at) 
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), pageUrl, referrer, userAgent]
  );
}

export async function getAnalyticsStats() {
  const total = await queryOne('SELECT COUNT(*) as count FROM analytics');
  const today = await queryOne(
    "SELECT COUNT(*) as count FROM analytics WHERE DATE(created_at) = DATE('now')"
  );
  
  return {
    totalViews: total?.count || 0,
    todayViews: today?.count || 0,
  };
}

export async function updatePlatformStats(platform: string, isAnalysis: boolean, isDownload: boolean) {
  const existing = await queryOne(
    'SELECT * FROM platform_stats WHERE platform = ? AND date = DATE("now")',
    [platform]
  );

  if (existing) {
    return query(
      `UPDATE platform_stats 
       SET analyzed_count = analyzed_count + ?, 
           download_count = download_count + ? 
       WHERE id = ?`,
      [isAnalysis ? 1 : 0, isDownload ? 1 : 0, existing.id]
    );
  } else {
    return query(
      `INSERT INTO platform_stats (id, platform, analyzed_count, download_count, date) 
       VALUES (?, ?, ?, ?, DATE("now"))`,
      [Date.now().toString(36) + Math.random().toString(36).substr(2, 5), platform, isAnalysis ? 1 : 0, isDownload ? 1 : 0]
    );
  }
}

export async function getPlatformStats() {
  return query(
    'SELECT platform, SUM(analyzed_count) as analyzed_count, SUM(download_count) as download_count FROM platform_stats GROUP BY platform ORDER BY analyzed_count DESC'
  );
}

// ============================================
// اعدادات الموقع (Site Settings)
// ============================================

export async function getSiteSettings() {
  return queryOne('SELECT * FROM site_settings LIMIT 1');
}

export async function updateSiteSettings(data: any) {
  const updates: string[] = [];
  const values: any[] = [];

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  });

  if (updates.length === 0) return null;

  return query(
    `UPDATE site_settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM site_settings LIMIT 1)`,
    values
  );
}

// ============================================
// دوال خاصة بتحميل الفيديو (استخدام API الخادم)
// ============================================

export async function analyzeVideo(url: string) {
  try {
    const response = await fetch(`${API_URL}/api/analyze?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to analyze video');
    }

    return await response.json();
  } catch (error) {
    console.error('Analyze error:', error);
    return null;
  }
}

export async function downloadVideo(url: string, format: string = 'video', quality: string = '720') {
  try {
    const response = await fetch(
      `${API_URL}/api/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get download link');
    }

    return await response.json();
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
}

// ============================================
// التحقق من صحة الخادم
// ============================================

export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Server is not healthy');
    }

    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    return null;
  }
}

// ============================================
// تصدير جميع الدوال
// ============================================

export default {
  query,
  queryOne,
  getAdminByEmail,
  getAdminById,
  updateAdminLastLogin,
  logAdminActivity,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  getLinkPlacements,
  saveLinkPlacements,
  logAnalytics,
  getAnalyticsStats,
  updatePlatformStats,
  getPlatformStats,
  getSiteSettings,
  updateSiteSettings,
  analyzeVideo,
  downloadVideo,
  checkServerHealth,
};