-- ============================================================
-- Lucky Vault — Admin + Test Draws Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. CREATE ADMIN USER (ztechng@gmail.com)
-- Password: $_Zicomighty404 (bcrypt hash)
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'ztechng@gmail.com') THEN
    INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "isVerified", "isActive")
    VALUES (
      gen_random_uuid()::text,
      'ztechng@gmail.com',
      '$2a$12$LQv3c1yqBo9SkvXS7QT3OuTK3QfH6pMJu4QpG6Z5r0zZ7XxGQwCfK',
      'Zico Admin',
      'ADMIN',
      true,
      true
    );
  END IF;
END $$;

-- 2. CREATE WALLET FOR ADMIN
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Wallet" WHERE "userId" = (
      SELECT id FROM "User" WHERE email = 'ztechng@gmail.com'
    )
  ) THEN
    INSERT INTO "Wallet" (id, "userId", balance, currency, "isActive")
    SELECT gen_random_uuid()::text, id, 100.00, 'USD', true
    FROM "User" WHERE email = 'ztechng@gmail.com';
  END IF;
END $$;

-- 3. CREATE TEST DRAWS
-- ============================================================

-- Draw 1: Jackpot (OPEN — users can buy tickets)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Draw" WHERE title = 'Weekly Jackpot') THEN
    INSERT INTO "Draw" (id, title, description, "ticketPrice", "maxTickets", "soldTickets", "prizePool", "winnerCount", status, "scheduledAt")
    VALUES (
      gen_random_uuid()::text,
      'Weekly Jackpot',
      'Win big this week! Limited tickets available.',
      5.00,
      100,
      0,
      500.00,
      3,
      'OPEN',
      now() + interval '7 days'
    );
  END IF;
END $$;

-- Draw 2: Daily Lucky (OPEN)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Draw" WHERE title = 'Daily Lucky Draw') THEN
    INSERT INTO "Draw" (id, title, description, "ticketPrice", "maxTickets", "soldTickets", "prizePool", "winnerCount", status, "scheduledAt")
    VALUES (
      gen_random_uuid()::text,
      'Daily Lucky Draw',
      'Quick daily draw with instant prizes!',
      2.00,
      200,
      0,
      200.00,
      5,
      'OPEN',
      now() + interval '1 day'
    );
  END IF;
END $$;

-- Draw 3: Mega Event (UPCOMING — starts later)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Draw" WHERE title = 'Mega Event 2026') THEN
    INSERT INTO "Draw" (id, title, description, "ticketPrice", "maxTickets", "soldTickets", "prizePool", "winnerCount", status, "scheduledAt")
    VALUES (
      gen_random_uuid()::text,
      'Mega Event 2026',
      'The biggest draw of the year! Premium prizes.',
      25.00,
      500,
      0,
      10000.00,
      10,
      'UPCOMING',
      now() + interval '30 days'
    );
  END IF;
END $$;

-- Verify
SELECT u.id, u.email, u.role, w.balance
FROM "User" u
LEFT JOIN "Wallet" w ON w."userId" = u.id
WHERE u.email = 'ztechng@gmail.com';

SELECT id, title, status, "ticketPrice", "prizePool", "maxTickets" - "soldTickets" as "available"
FROM "Draw"
ORDER BY "scheduledAt" ASC;
