-- ============================================================
-- Lucky Vault — Full Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('ACTIVE', 'WON', 'LOST', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'TOP_UP', 'PURCHASE', 'WINNING', 'REFUND', 'WITHDRAWAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DrawStatus" AS ENUM ('UPCOMING', 'OPEN', 'LOCKED', 'DRAWING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'USER_REGISTER', 'TICKET_PURCHASE', 'DRAW_CREATE', 'DRAW_LOCK', 'DRAW_EXECUTE', 'DRAW_COMPLETE', 'WALLET_CREDIT', 'WALLET_DEBIT', 'ADMIN_ACTION', 'SYSTEM_EVENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "User" (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email         TEXT UNIQUE,
    phone         TEXT UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl"   TEXT,
    role          "UserRole" NOT NULL DEFAULT 'USER',
    "isVerified"  BOOLEAN NOT NULL DEFAULT false,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Wallet" (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"  TEXT NOT NULL UNIQUE,
    balance   DECIMAL(18,2) NOT NULL DEFAULT 0,
    currency  TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "walletId"    TEXT NOT NULL,
    type          "TransactionType" NOT NULL,
    amount        DECIMAL(18,2) NOT NULL,
    "balanceAfter" DECIMAL(18,2) NOT NULL,
    status        "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "referenceId" TEXT,
    description   TEXT,
    metadata      JSONB,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Draw" (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title         TEXT NOT NULL,
    description   TEXT,
    "ticketPrice" DECIMAL(18,2) NOT NULL,
    "maxTickets"  INTEGER NOT NULL,
    "soldTickets" INTEGER NOT NULL DEFAULT 0,
    "prizePool"   DECIMAL(18,2) NOT NULL DEFAULT 0,
    "winnerCount" INTEGER NOT NULL DEFAULT 1,
    status        "DrawStatus" NOT NULL DEFAULT 'UPCOMING',
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "startedAt"   TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "resultHash"  TEXT,
    "resultSalt"  TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Ticket" (
    id             TEXT PRIMARY KEY,
    "userId"       TEXT NOT NULL,
    "drawId"       TEXT NOT NULL,
    "ticketCode"   TEXT NOT NULL UNIQUE,
    status         "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCodeUrl"    TEXT,
    "purchasePrice" DECIMAL(18,2) NOT NULL,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT "Ticket_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Winner" (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawId"      TEXT NOT NULL,
    "ticketId"    TEXT NOT NULL UNIQUE,
    "userId"      TEXT NOT NULL,
    "prizeAmount" DECIMAL(18,2) NOT NULL,
    rank          INTEGER NOT NULL DEFAULT 1,
    "isPaid"      BOOLEAN NOT NULL DEFAULT false,
    "paidAt"      TIMESTAMPTZ,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Winner_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"(id) ON DELETE CASCADE,
    CONSTRAINT "Winner_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"   TEXT,
    action     "AuditAction" NOT NULL,
    entity     TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    metadata   JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Notification" (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"    TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    type        TEXT NOT NULL,
    data        JSONB,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"    TEXT NOT NULL,
    token       TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"(phone);
CREATE INDEX IF NOT EXISTS "Wallet_userId_idx" ON "Wallet"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_walletId_idx" ON "Transaction"("walletId");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"(type);
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX IF NOT EXISTS "Ticket_userId_idx" ON "Ticket"("userId");
CREATE INDEX IF NOT EXISTS "Ticket_drawId_idx" ON "Ticket"("drawId");
CREATE INDEX IF NOT EXISTS "Ticket_status_idx" ON "Ticket"(status);
CREATE INDEX IF NOT EXISTS "Ticket_ticketCode_idx" ON "Ticket"("ticketCode");
CREATE INDEX IF NOT EXISTS "Draw_status_idx" ON "Draw"(status);
CREATE INDEX IF NOT EXISTS "Draw_scheduledAt_idx" ON "Draw"("scheduledAt");
CREATE INDEX IF NOT EXISTS "Winner_drawId_idx" ON "Winner"("drawId");
CREATE INDEX IF NOT EXISTS "Winner_userId_idx" ON "Winner"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"(action);
CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"(entity);
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"(token);

-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Draw" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Winner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Admins can view all users" ON "User";
DROP POLICY IF EXISTS "Users can view own refresh tokens" ON "RefreshToken";
DROP POLICY IF EXISTS "Users can delete own refresh tokens" ON "RefreshToken";
DROP POLICY IF EXISTS "Users can view own wallet" ON "Wallet";
DROP POLICY IF EXISTS "Users cannot modify wallet directly" ON "Wallet";
DROP POLICY IF EXISTS "Users can view own transactions" ON "Transaction";
DROP POLICY IF EXISTS "Users cannot create transactions directly" ON "Transaction";
DROP POLICY IF EXISTS "Anyone can view open draws" ON "Draw";
DROP POLICY IF EXISTS "Only admins can modify draws" ON "Draw";
DROP POLICY IF EXISTS "Users can view own tickets" ON "Ticket";
DROP POLICY IF EXISTS "Users cannot create tickets directly" ON "Ticket";
DROP POLICY IF EXISTS "Users cannot delete tickets" ON "Ticket";
DROP POLICY IF EXISTS "Anyone can view winners" ON "Winner";
DROP POLICY IF EXISTS "Only system can create winners" ON "Winner";
DROP POLICY IF EXISTS "Users can view own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can mark own notifications as read" ON "Notification";
DROP POLICY IF EXISTS "Only system can create notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can delete own notifications" ON "Notification";
DROP POLICY IF EXISTS "Only admins can view audit logs" ON "AuditLog";
DROP POLICY IF EXISTS "Only system can create audit logs" ON "AuditLog";

-- User policies
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON "User"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')
    );

-- RefreshToken policies
CREATE POLICY "Users can view own refresh tokens" ON "RefreshToken"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own refresh tokens" ON "RefreshToken"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Wallet policies
CREATE POLICY "Users can view own wallet" ON "Wallet"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users cannot modify wallet directly" ON "Wallet"
    FOR ALL USING (false);

-- Transaction policies (join through Wallet — Transaction has no userId)
CREATE POLICY "Users can view own transactions" ON "Transaction"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "Wallet" WHERE id = "walletId" AND "userId" = auth.uid()::text)
    );

CREATE POLICY "Users cannot create transactions directly" ON "Transaction"
    FOR INSERT WITH CHECK (false);

-- Draw policies (public read for active/completed/locked draws)
CREATE POLICY "Anyone can view open draws" ON "Draw"
    FOR SELECT USING (status IN ('OPEN', 'COMPLETED', 'LOCKED'));

CREATE POLICY "Only admins can modify draws" ON "Draw"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')
    );

-- Ticket policies
CREATE POLICY "Users can view own tickets" ON "Ticket"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users cannot create tickets directly" ON "Ticket"
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Users cannot delete tickets" ON "Ticket"
    FOR DELETE USING (false);

-- Winner policies (public read)
CREATE POLICY "Anyone can view winners" ON "Winner"
    FOR SELECT USING (true);

CREATE POLICY "Only system can create winners" ON "Winner"
    FOR INSERT WITH CHECK (false);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON "Notification"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can mark own notifications as read" ON "Notification"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Only system can create notifications" ON "Notification"
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Users can delete own notifications" ON "Notification"
    FOR DELETE USING (auth.uid()::text = "userId");

-- AuditLog policies (admin only)
CREATE POLICY "Only admins can view audit logs" ON "AuditLog"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')
    );

CREATE POLICY "Only system can create audit logs" ON "AuditLog"
    FOR INSERT WITH CHECK (false);

-- ============================================================
-- Service role key bypasses RLS — backend operations unaffected
-- ============================================================

-- 5. SEED ADMIN USER
-- ============================================================
-- Password: $_Zicomighty404 (bcrypt hash)
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
    -- Create wallet for admin
    INSERT INTO "Wallet" (id, "userId", balance, currency, "isActive")
    SELECT gen_random_uuid()::text, id, 0, 'USD', true
    FROM "User" WHERE email = 'zicomighty@gmail.com'
    AND NOT EXISTS (SELECT 1 FROM "Wallet" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'zicomighty@gmail.com'));
  END IF;
END $$;
