-- ============================================
-- ‚«Ÿœ… »Í«Ê«  «‰ÂË‚Ÿ - App X Download
-- ============================================
-- Â‰·: database.sql
-- Â„«ÊÁ: Ã–— «‰Â‘—ËŸ (ÂÃ‰œ «‰Â‘—ËŸ «‰—∆Í”Í)
-- ============================================

-- ≈Ê‘«¡ ÃœË‰ «‰ÂœÍ—ÍÊ
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ ”Ã‰ «‰Ê‘«◊« 
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ≈Ê‘«¡ ÃœË‰ «‰’·Õ« 
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  content TEXT,
  content_ar TEXT,
  meta_title VARCHAR(255),
  meta_title_ar VARCHAR(255),
  meta_description TEXT,
  meta_description_ar TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  show_in_menu BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ «‰Â‚«‰« 
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  content TEXT,
  content_ar TEXT,
  excerpt TEXT,
  excerpt_ar TEXT,
  featured_image VARCHAR(500),
  category_id INT,
  meta_title VARCHAR(255),
  meta_title_ar VARCHAR(255),
  meta_description TEXT,
  meta_description_ar TEXT,
  author_id INT,
  is_published BOOLEAN DEFAULT TRUE,
  published_at DATETIME,
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admins(id)
);

-- ≈Ê‘«¡ ÃœË‰ «‰ ’ÊÍ·« 
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ «‰≈Ÿ‰«Ê« 
CREATE TABLE IF NOT EXISTS ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(100) DEFAULT 'Learn More',
  button_text_ar VARCHAR(100) DEFAULT '«Ÿ—· «‰Â“Íœ',
  button_color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  ad_type ENUM('banner', 'popup', 'floating', 'inline') DEFAULT 'banner',
  placement_slot VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ «‰—Ë«»◊
CREATE TABLE IF NOT EXISTS links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500) NOT NULL,
  button_color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ √Â«„Ê «‰—Ë«»◊
CREATE TABLE IF NOT EXISTS link_placements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  link_id INT NOT NULL,
  placement VARCHAR(50) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  UNIQUE KEY unique_link_placement (link_id, placement)
);

-- ≈Ê‘«¡ ÃœË‰ ≈Õ’«∆Í«  «‰ÂÊ’« 
CREATE TABLE IF NOT EXISTS platform_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  analyzed_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  video_downloads INT DEFAULT 0,
  audio_downloads INT DEFAULT 0,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_platform_date (platform, date)
);

-- ≈Ê‘«¡ ÃœË‰ «‰ Õ‰Í‰« 
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ≈Ê‘«¡ ÃœË‰ ≈Ÿœ«œ«  «‰ÂË‚Ÿ
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'App X Download',
  site_name_ar VARCHAR(255) DEFAULT ' ÕÂÍ‰  ◊»Í‚ X',
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  primary_color VARCHAR(20) DEFAULT '#3b82f6',
  secondary_color VARCHAR(20) DEFAULT '#1e40af',
  accent_color VARCHAR(20) DEFAULT '#f59e0b',
  dark_mode_default BOOLEAN DEFAULT TRUE,
  default_language ENUM('ar', 'en') DEFAULT 'ar',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  google_analytics_id VARCHAR(50),
  custom_header_code TEXT,
  custom_footer_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- ≈œŒ«‰ «‰»Í«Ê«  «‰√Ë‰Í…
-- ============================================

-- ≈œŒ«‰ ÂœÍ— √Ë‰Í („‰Â… «‰Â—Ë—: Admin@123)
INSERT INTO admins (email, password_hash, name, role, is_active) 
VALUES (
  'admin@example.com',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'ÂœÍ— «‰Êÿ«Â',
  'super_admin',
  1
) ON DUPLICATE KEY UPDATE email=email;

-- ≈œŒ«‰ ≈Ÿœ«œ«  «‰ÂË‚Ÿ «‰«· —«÷Í…
INSERT INTO site_settings (site_name, site_name_ar, primary_color, secondary_color, accent_color, dark_mode_default, default_language)
VALUES (
  'App X Download',
  ' ÕÂÍ‰  ◊»Í‚ X',
  '#3b82f6',
  '#1e40af',
  '#f59e0b',
  1,
  'ar'
) ON DUPLICATE KEY UPDATE site_name=site_name;

-- ============================================
-- ÊÁ«Í… «‰Â‰·
-- ============================================