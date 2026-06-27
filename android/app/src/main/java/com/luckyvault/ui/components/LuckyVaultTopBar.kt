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
fun VaultMark(modifier: Modifier = Modifier, size: Int = 28) {
    Canvas(modifier = modifier.size(size.dp)) {
        val cx = this.size.width / 2
        val cy = this.size.height / 2
        val r = this.size.minDimension / 2 * 0.88f

        // Octagon vertices
        val vertices = (0 until 8).map { i ->
            val angle = Math.toRadians((i * 45 - 90).toDouble())
            Offset(
                cx + r * kotlin.math.cos(angle).toFloat(),
                cy + r * kotlin.math.sin(angle).toFloat()
            )
        }

        // Outer octagon
        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(vertices[0].x, vertices[0].y)
            for (i in 1 until 8) {
                lineTo(vertices[i].x, vertices[i].y)
            }
            close()
        }
        drawPath(path, color = Color(0xFFC9A962), style = Stroke(width = 2f))

        // Inner facets
        for (v in vertices) {
            drawLine(
                color = Color(0xFFC9A962).copy(alpha = 0.15f),
                start = Offset(cx, cy),
                end = v,
                strokeWidth = 0.6f
            )
        }

        // Center diamond
        val d = r * 0.16f
        val diamond = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy - d)
            lineTo(cx + d, cy)
            lineTo(cx, cy + d)
            lineTo(cx - d, cy)
            close()
        }
        drawPath(diamond, color = Color(0xFFC9A962))

        // Inner ring
        drawCircle(
            color = Color(0xFFC9A962).copy(alpha = 0.2f),
            radius = r * 0.44f,
            style = Stroke(width = 0.5f)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LuckyVaultTopBar(
    title: String = "",
    onBack: (() -> Unit)? = null,
    showLogo: Boolean = false,
    actions: @Composable RowScope.() -> Unit = {}
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (showLogo) {
                    VaultMark(size = 26)
                }
                if (title.isNotEmpty()) {
                    Text(
                        text = title,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 17.sp,
                        color = if (showLogo) TextPrimary else MaterialTheme.colorScheme.onSurface,
                        letterSpacing = (-0.2).sp
                    )
                }
            }
        },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = TextPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Color.Transparent
        )
    )
}
