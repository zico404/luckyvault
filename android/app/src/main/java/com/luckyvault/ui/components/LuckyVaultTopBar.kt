package com.luckyvault.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luckyvault.ui.theme.*

@Composable
fun VaultLogoSmall(modifier: Modifier = Modifier, size: Int = 28) {
    Canvas(modifier = modifier.size(size.dp)) {
        val cx = this.size.width / 2
        val cy = this.size.height / 2
        val r = this.size.minDimension / 2 * 0.9f

        drawCircle(color = Color(0xFF0A120B), radius = r)
        drawCircle(color = Gold, radius = r, style = Stroke(width = r * 0.1f))
        drawCircle(color = Gold.copy(alpha = 0.3f), radius = r * 0.85f, style = Stroke(width = 0.8f))

        for (i in 0 until 12) {
            val angle = Math.toRadians((i * 30 - 90).toDouble())
            val isCardinal = i % 3 == 0
            val innerR = if (isCardinal) r * 0.7f else r * 0.76f
            val outerR = r * 0.85f
            drawLine(
                color = if (isCardinal) GoldBright else Gold.copy(alpha = 0.5f),
                start = Offset(cx + innerR * kotlin.math.cos(angle).toFloat(), cy + innerR * kotlin.math.sin(angle).toFloat()),
                end = Offset(cx + outerR * kotlin.math.cos(angle).toFloat(), cy + outerR * kotlin.math.sin(angle).toFloat()),
                strokeWidth = if (isCardinal) 2f else 1f,
                cap = androidx.compose.ui.graphics.StrokeCap.Round
            )
        }

        drawCircle(color = Gold, radius = r * 0.22f)
        drawCircle(color = Color(0xFF0D1B0E), radius = r * 0.06f)
        drawLine(
            color = GoldBright,
            start = Offset(cx, cy - r * 0.22f),
            end = Offset(cx, cy + r * 0.22f),
            strokeWidth = 2.5f,
            cap = androidx.compose.ui.graphics.StrokeCap.Round
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LuckyVaultTopBar(
    title: String = "Lucky Vault",
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                VaultLogoSmall(size = if (onBack == null) 30 else 24)
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = if (onBack == null) 18.sp else 16.sp,
                    color = if (onBack == null) Gold else MaterialTheme.colorScheme.onSurface,
                    letterSpacing = 1.sp
                )
            }
        },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background
        )
    )
}
