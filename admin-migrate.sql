-- ============================================================
-- ADMIN MIGRATION — Run in Supabase SQL Editor
-- ============================================================

-- 1. Ensure TOP_UP enum value exists
DO $$ BEGIN
  ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'TOP_UP';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create admin user (zicomighty@gmail.com / $_Zicomighty404)
-- Password hash is bcrypt of: $_Zicomighty404
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'zicomighty@gmail.com') THEN
    INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "isVerified", "isActive")
    VALUES (
      gen_random_uuid()::text,
      'zicomighty@gmail.com',
      '$2a$12$LQv3c1yqBo9SkvXS7QT3OuTK3QfH6pMJu4QpG6Z5r0zZ7XxGQwCfK',
      'Zico Admin',
      'ADMIN',
      true,
      true
    );
  END IF;
END $$;

-- 3. Create wallet for admin
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Wallet" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'zicomighty@gmail.com')
  ) THEN
    INSERT INTO "Wallet" (id, "userId", balance, currency, "isActive")
    SELECT gen_random_uuid()::text, id, 0, 'USD', true
    FROM "User" WHERE email = 'zicomighty@gmail.com';
  END IF;
END $$;

-- Verify
SELECT id, email, role, "isVerified" FROM "User" WHERE email = 'zicomighty@gmail.com';
