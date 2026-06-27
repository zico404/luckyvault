package com.luckyvault.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

// ═══════════════════════════════════════════════════════════════
// LUCKY VAULT — Spacing System (8pt grid)
// ═══════════════════════════════════════════════════════════════
object VaultSpacing {
    val xxs: Dp = 2.dp
    val xs: Dp = 4.dp
    val sm: Dp = 8.dp
    val md: Dp = 12.dp
    val lg: Dp = 16.dp
    val xl: Dp = 20.dp
    val xxl: Dp = 24.dp
    val xxxl: Dp = 32.dp
    val huge: Dp = 40.dp
    val massive: Dp = 48.dp
    val giant: Dp = 64.dp
}

// ═══════════════════════════════════════════════════════════════
// LUCKY VAULT — Elevation / Depth
// ═══════════════════════════════════════════════════════════════
object VaultElevation {
    val none: Dp = 0.dp
    val xs: Dp = 1.dp
    val sm: Dp = 2.dp
    val md: Dp = 4.dp
    val lg: Dp = 8.dp
    val xl: Dp = 16.dp
}

// ═══════════════════════════════════════════════════════════════
// LUCKY VAULT — Corner Radius
// ═══════════════════════════════════════════════════════════════
object VaultRadius {
    val xs: Dp = 4.dp
    val sm: Dp = 8.dp
    val md: Dp = 12.dp
    val lg: Dp = 16.dp
    val xl: Dp = 20.dp
    val xxl: Dp = 24.dp
    val full: Dp = 9999.dp
}

// ═══════════════════════════════════════════════════════════════
// Material3 Color Scheme — Dark Luxury
// ═══════════════════════════════════════════════════════════════
private val DarkColorScheme = darkColorScheme(
    primary = Champagne,
    onPrimary = VaultBlack,
    primaryContainer = ChampagneMuted,
    onPrimaryContainer = TextPrimary,
    secondary = Platinum,
    onSecondary = VaultBlack,
    secondaryContainer = VaultCharcoal,
    onSecondaryContainer = TextPrimary,
    tertiary = Emerald,
    onTertiary = TextPrimary,
    background = VaultBlack,
    onBackground = TextPrimary,
    surface = VaultGraphite,
    onSurface = TextPrimary,
    surfaceVariant = VaultCharcoal,
    onSurfaceVariant = TextSecondary,
    surfaceTint = Champagne,
    inverseSurface = TextPrimary,
    inverseOnSurface = VaultBlack,
    error = Crimson,
    onError = TextPrimary,
    errorContainer = CrimsonMuted,
    onErrorContainer = Crimson,
    outline = VaultSubtle,
    outlineVariant = VaultSubtle,
    scrim = Color.Black,
)

private val LightColorScheme = lightColorScheme(
    primary = ChampagneMuted,
    onPrimary = TextPrimary,
    primaryContainer = ChampagneLight,
    onPrimaryContainer = VaultBlack,
    secondary = Platinum,
    onSecondary = VaultBlack,
    background = Color(0xFFFAFAFA),
    onBackground = VaultBlack,
    surface = Color.White,
    surfaceVariant = Color(0xFFF4F4F5),
    onSurfaceVariant = TextMuted,
    error = Crimson,
    onError = TextPrimary,
    outline = VaultSubtle,
)

@Immutable
data class VaultColors(
    val success: Color = Emerald,
    val successMuted: Color = EmeraldMuted,
    val warning: Color = Amber,
    val warningMuted: Color = AmberMuted,
    val champagne: Color = Champagne,
    val champagneSubtle: Color = ChampagneSubtle,
    val champagneMuted: Color = ChampagneMuted,
    val platinum: Color = Platinum,
    val vaultBlack: Color = VaultBlack,
    val vaultGraphite: Color = VaultGraphite,
    val vaultCharcoal: Color = VaultCharcoal,
    val vaultElevated: Color = VaultElevated,
    val vaultSubtle: Color = VaultSubtle,
)

val LocalVaultColors = androidx.compose.runtime.staticCompositionLocalOf { VaultColors() }

@Composable
fun LuckyVaultTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                WindowCompat.setDecorFitsSystemWindows(window, false)
            }
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    androidx.compose.runtime.CompositionLocalProvider(LocalVaultColors provides VaultColors()) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
