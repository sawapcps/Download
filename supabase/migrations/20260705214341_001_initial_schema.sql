/*
# Media Downloader - Database Schema

## Overview
Complete schema for professional media downloader website.

## Tables Order (fixed for foreign key dependencies)
1. site_settings - Global configuration
2. admins - Admin users
3. categories - Content categories (before articles)
4. ads - Advertisement management
5. links - Promotional links
6. link_placements - Where links appear
7. analytics - Visitor statistics
8. platform_stats - Download statistics per platform
9. activity_logs - Admin activity tracking
10. pages - Static pages
11. articles - Blog/articles

## Security
- RLS enabled on all tables
- Public read for active/published content
- Admin write access for authenticated users
*/

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'App X Download',
  site_name_ar text DEFAULT 'تحميل تطبيق X',
  logo_url text,
  favicon_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#1e40af',
  accent_color text DEFAULT '#f59e0b',
  dark_mode_default boolean DEFAULT true,
  default_language text DEFAULT 'ar',
  meta_title text,
  meta_description text,
  meta_keywords text,
  google_analytics_id text,
  custom_header_code text,
  custom_footer_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories Table (before articles due to FK)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  image_url text,
  link_url text NOT NULL,
  button_text text DEFAULT 'Learn More',
  button_text_ar text DEFAULT 'اعرف المزيد',
  button_color text DEFAULT '#3b82f6',
  icon text,
  sort_order int DEFAULT 0,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  open_in_new_tab boolean DEFAULT true,
  ad_type text DEFAULT 'banner',
  placement_slot text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Links Table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  image_url text,
  link_url text NOT NULL,
  button_color text DEFAULT '#3b82f6',
  icon text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  open_in_new_tab boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link Placements
CREATE TABLE IF NOT EXISTS link_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  placement text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  ip_address text,
  user_agent text,
  page_url text,
  referrer text,
  country text,
  device_type text,
  browser text,
  os text,
  created_at timestamptz DEFAULT now()
);

-- Platform Stats Table
CREATE TABLE IF NOT EXISTS platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  analyzed_count int DEFAULT 0,
  download_count int DEFAULT 0,
  video_downloads int DEFAULT 0,
  audio_downloads int DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform, date)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id),
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_ar text,
  content text,
  content_ar text,
  meta_title text,
  meta_title_ar text,
  meta_description text,
  meta_description_ar text,
  is_published boolean DEFAULT true,
  show_in_menu boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_ar text,
  content text,
  content_ar text,
  excerpt text,
  excerpt_ar text,
  featured_image text,
  category_id uuid REFERENCES categories(id),
  meta_title text,
  meta_title_ar text,
  meta_description text,
  meta_description_ar text,
  author_id uuid REFERENCES admins(id),
  is_published boolean DEFAULT true,
  published_at timestamptz,
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO site_settings (site_name, site_name_ar, meta_title, meta_description)
VALUES ('App X Download', 'تحميل تطبيق X', 'Download Videos & Audio from Any Platform', 'Free online video and audio downloader supporting YouTube, Facebook, Instagram, TikTok and more.')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Site Settings Policies
DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_settings" ON site_settings;
CREATE POLICY "admin_write_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admins Policies
DROP POLICY IF EXISTS "admin_all_admins" ON admins;
CREATE POLICY "admin_all_admins" ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ads Policies
DROP POLICY IF EXISTS "public_read_active_ads" ON ads;
CREATE POLICY "public_read_active_ads" ON ads FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_write_ads" ON ads;
CREATE POLICY "admin_write_ads" ON ads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Links Policies
DROP POLICY IF EXISTS "public_read_active_links" ON links;
CREATE POLICY "public_read_active_links" ON links FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_write_links" ON links;
CREATE POLICY "admin_write_links" ON links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Link Placements Policies
DROP POLICY IF EXISTS "public_read_link_placements" ON link_placements;
CREATE POLICY "public_read_link_placements" ON link_placements FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_link_placements" ON link_placements;
CREATE POLICY "admin_write_link_placements" ON link_placements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Analytics Policies
DROP POLICY IF EXISTS "public_insert_analytics" ON analytics;
CREATE POLICY "public_insert_analytics" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_analytics" ON analytics;
CREATE POLICY "admin_read_analytics" ON analytics FOR SELECT TO authenticated USING (true);

-- Platform Stats Policies
DROP POLICY IF EXISTS "public_write_platform_stats" ON platform_stats;
CREATE POLICY "public_write_platform_stats" ON platform_stats FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Activity Logs Policies
DROP POLICY IF EXISTS "admin_all_activity_logs" ON activity_logs;
CREATE POLICY "admin_all_activity_logs" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pages Policies
DROP POLICY IF EXISTS "public_read_published_pages" ON pages;
CREATE POLICY "public_read_published_pages" ON pages FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_write_pages" ON pages;
CREATE POLICY "admin_write_pages" ON pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Articles Policies
DROP POLICY IF EXISTS "public_read_published_articles" ON articles;
CREATE POLICY "public_read_published_articles" ON articles FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_write_articles" ON articles;
CREATE POLICY "admin_write_articles" ON articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories Policies
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement_slot);
CREATE INDEX IF NOT EXISTS idx_links_active ON links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON platform_stats(date);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published) WHERE is_published = true;