/*
# Add Sample Data

Adds sample ads and links for demonstration.
*/

-- Sample Ads
INSERT INTO ads (title, title_ar, description, description_ar, image_url, link_url, button_text, button_text_ar, button_color, placement_slot, ad_type, is_active, sort_order) VALUES
('Try Our Premium App', 'جرب تطبيقنا المميز', 'Download our premium app for the best experience', 'حمّل تطبيقنا المميز لأفضل تجربة', 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://example.com', 'Download Now', 'حمّل الآن', '#3b82f6', 'homepage_top', 'banner', true, 1),
('Special Offer', 'عرض خاص', 'Get 50% off on premium features', 'احصل على خصم 50% على الميزات المميزة', 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://example.com', 'Get Offer', 'احصل على العرض', '#f59e0b', 'after_results', 'banner', true, 2);

-- Sample Links
INSERT INTO links (title, title_ar, description, description_ar, link_url, button_color, is_active, sort_order) VALUES
('My YouTube Channel', 'قناتي على يوتيوب', 'Check out my YouTube channel for tutorials', 'تفقد قناتي على يوتيوب للدروس', 'https://youtube.com', '#ff0000', true, 1),
('Follow on Twitter', 'تابعني على تويتر', 'Follow me for updates and news', 'تابعني للحصول على التحديثات والأخبار', 'https://twitter.com', '#1da1f2', true, 2);

-- Add link placements
INSERT INTO link_placements (link_id, placement)
SELECT id, 'homepage' FROM links WHERE title = 'My YouTube Channel';
INSERT INTO link_placements (link_id, placement)
SELECT id, 'footer' FROM links WHERE title = 'My YouTube Channel';
INSERT INTO link_placements (link_id, placement)
SELECT id, 'homepage' FROM links WHERE title = 'Follow on Twitter';
INSERT INTO link_placements (link_id, placement)
SELECT id, 'results' FROM links WHERE title = 'Follow on Twitter';

-- Add sample pages
INSERT INTO pages (slug, title, title_ar, content, content_ar, is_published, show_in_menu) VALUES
('privacy', 'Privacy Policy', 'سياسة الخصوصية', '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>', '<h1>سياسة الخصوصية</h1><p>خصوصيتك مهمة بالنسبة لنا...</p>', true, true),
('terms', 'Terms of Use', 'شروط الاستخدام', '<h1>Terms of Use</h1><p>By using this service...</p>', '<h1>شروط الاستخدام</h1><p>باستخدام هذه الخدمة...</p>', true, true),
('contact', 'Contact Us', 'اتصل بنا', '<h1>Contact Us</h1><p>Email: contact@example.com</p>', '<h1>اتصل بنا</h1><p>البريد الإلكتروني: contact@example.com</p>', true, true);

-- Add sample categories
INSERT INTO categories (slug, name, name_ar, description, description_ar) VALUES
('tutorials', 'Tutorials', 'دروس تعليمية', 'Video tutorials and guides', 'دروس فيديو تعليمية ومرشدة'),
('news', 'News', 'أخبار', 'Latest news and updates', 'آخر الأخبار والتحديثات');