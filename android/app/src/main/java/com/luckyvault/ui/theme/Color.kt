package com.luckyvault.ui.theme

import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════════
// LUCKY VAULT — Premium Design System
// A sophisticated dark luxury fintech palette.
// Inspired by Apple, Linear, Stripe, Revolut, Coinbase.
// ═══════════════════════════════════════════════════════════════

// ── Backgrounds ──────────────────────────────────────────────
val VaultBlack = Color(0xFF09090B)        // Primary background — rich midnight
val VaultGraphite = Color(0xFF18181B)     // Secondary background — graphite
val VaultCharcoal = Color(0xFF27272A)     // Surface — deep charcoal
val VaultElevated = Color(0xFF2E2E32)     // Elevated surface — subtle lift
val VaultSubtle = Color(0xFF3F3F46)       // Borders, dividers — zinc-700

// ── Accent — Champagne Gold ──────────────────────────────────
val Champagne = Color(0xFFC9A962)         // Primary accent — champagne gold
val ChampagneLight = Color(0xFFD4B872)    // Lighter champagne
val ChampagneMuted = Color(0xFFA08940)    // Muted champagne
val ChampagneSubtle = Color(0x1AC9A962)   // Champagne at 10% opacity

// ── Secondary — Soft Platinum ────────────────────────────────
val Platinum = Color(0xFFA1A1AA)          // Secondary accent — zinc-400
val PlatinumLight = Color(0xFFD4D4D8)     // Lighter platinum — zinc-200

// ── Status ───────────────────────────────────────────────────
val Emerald = Color(0xFF059669)           // Success — emerald-600
val EmeraldMuted = Color(0x1A059669)      // Success at 10%
val Amber = Color(0xFFD97706)             // Warning — amber-600
val AmberMuted = Color(0x1AD97706)        // Warning at 10%
val Crimson = Color(0xFFDC2626)           // Error — red-600
val CrimsonMuted = Color(0x1ADC2626)      // Error at 10%

// ── Text ─────────────────────────────────────────────────────
val TextPrimary = Color(0xFFFAFAFA)       // Pure white — headings
val TextSecondary = Color(0xFFA1A1AA)     // Soft white — body
val TextMuted = Color(0xFF71717A)         // Muted gray — captions
val TextDisabled = Color(0xFF52525B)      // Disabled text — zinc-600

// ── Semantic aliases ─────────────────────────────────────────
val Primary = Champagne
val OnPrimary = VaultBlack
val Secondary = Platinum
val OnSecondary = VaultBlack
val Background = VaultBlack
val OnBackground = TextPrimary
val Surface = VaultGraphite
val OnSurface = TextPrimary
val SurfaceVariant = VaultCharcoal
val OnSurfaceVariant = TextSecondary
val Error = Crimson
val OnError = TextPrimary
val Success = Emerald
val Warning = Amber

// ── Legacy compat (remove after migration) ──────────────────
val Gold = Champagne
val GoldLight = ChampagneLight
val GoldDark = ChampagneMuted
val GoldBright = ChampagneLight
val GoldMuted = ChampagneMuted
val GoldSubtle = ChampagneSubtle
val OnBackgroundMuted = TextMuted
val SurfaceGlass = VaultCharcoal
val SurfaceGlassBorder = VaultSubtle
val BackgroundDeep = VaultBlack
val SurfaceElevated = VaultElevated
val PrimaryVariant = ChampagneMuted
val PrimaryLight = Emerald
val OnPrimary2 = TextPrimary
val ErrorLight = Crimson
val Success2 = Emerald
val Warning2 = Amber
