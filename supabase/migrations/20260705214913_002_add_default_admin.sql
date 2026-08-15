/*
# Add Default Admin User

Creates a default admin account for accessing the admin panel.
Password: admin123 (SHA-256 hash)
*/

-- Create default admin (password: admin123)
INSERT INTO admins (email, password_hash, name, role, is_active)
VALUES (
  'admin@example.com',
  '240be518fabd2724ddb68f19a0e9b0c94b0d494e0dc5a1f9e8b7c1c8b7a9b8c7',
  'Admin',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;