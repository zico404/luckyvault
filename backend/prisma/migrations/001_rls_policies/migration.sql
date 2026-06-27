-- Lucky Vault RLS Policies
-- Run this after initial schema migration

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Draw" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Winner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON "User"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RefreshToken policies
CREATE POLICY "Users can view own refresh tokens" ON "RefreshToken"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own refresh tokens" ON "RefreshToken"
    FOR DELETE USING (auth.uid() = "userId");

-- Wallet policies
CREATE POLICY "Users can view own wallet" ON "Wallet"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users cannot modify wallet directly" ON "Wallet"
    FOR ALL USING (false);

-- Transaction policies (Transaction has walletId, not userId — join through Wallet)
CREATE POLICY "Users can view own transactions" ON "Transaction"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "Wallet" WHERE id = "walletId" AND "userId" = auth.uid())
    );

CREATE POLICY "Users cannot create transactions directly" ON "Transaction"
    FOR INSERT WITH CHECK (false);

-- Draw policies (public read for active/completed draws)
CREATE POLICY "Anyone can view open draws" ON "Draw"
    FOR SELECT USING (status IN ('OPEN', 'COMPLETED', 'LOCKED'));

CREATE POLICY "Only admins can modify draws" ON "Draw"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Ticket policies
CREATE POLICY "Users can view own tickets" ON "Ticket"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users cannot create tickets directly" ON "Ticket"
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Users cannot delete tickets" ON "Ticket"
    FOR DELETE USING (false);

-- Winner policies (public read for completed draws)
CREATE POLICY "Anyone can view winners" ON "Winner"
    FOR SELECT USING (true);

CREATE POLICY "Only system can create winners" ON "Winner"
    FOR INSERT WITH CHECK (false);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON "Notification"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can mark own notifications as read" ON "Notification"
    FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Only system can create notifications" ON "Notification"
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Users can delete own notifications" ON "Notification"
    FOR DELETE USING (auth.uid() = "userId");

-- AuditLog policies (admin only)
CREATE POLICY "Only admins can view audit logs" ON "AuditLog"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
    );

CREATE POLICY "Only system can create audit logs" ON "AuditLog"
    FOR INSERT WITH CHECK (false);

-- Service role bypass (backend uses service role key)
-- The service role key bypasses RLS, so backend operations are unaffected
