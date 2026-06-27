package com.luckyvault.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = Background,
    primaryContainer = GoldDark,
    onPrimaryContainer = OnSurface,
    secondary = GoldLight,
    onSecondary = Background,
    secondaryContainer = GoldMuted,
    onSecondaryContainer = OnSurface,
    background = Background,
    onBackground = OnBackground,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceElevated,
    onSurfaceVariant = OnBackgroundMuted,
    error = Error,
    onError = OnPrimary,
    outline = Gold.copy(alpha = 0.2f),
    surfaceTint = Gold,
    inverseSurface = OnSurface,
    inverseOnSurface = Background,
)

private val LightColorScheme = lightColorScheme(
    primary = GoldDark,
    onPrimary = OnPrimary,
    primaryContainer = Gold,
    onPrimaryContainer = Background,
    secondary = Primary,
    onSecondary = OnPrimary,
    secondaryContainer = PrimaryLight,
    onSecondaryContainer = Background,
    background = Color(0xFFF5F5F0),
    onBackground = Color(0xFF1A1A1A),
    surface = Color.White,
    onSurface = Color(0xFF1A1A1A),
    surfaceVariant = Color(0xFFF0EDE8),
    onSurfaceVariant = Color(0xFF666666),
    error = ErrorLight,
    onError = OnPrimary,
    outline = Color(0xFFCCCCCC),
    surfaceTint = GoldDark,
)

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

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
