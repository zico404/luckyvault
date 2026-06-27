package com.luckyvault.ui.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luckyvault.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onSplashComplete: () -> Unit) {
    var phase by remember { mutableIntStateOf(0) }

    val logoScale = remember { Animatable(0.5f) }
    val logoAlpha = remember { Animatable(0f) }
    val textAlpha = remember { Animatable(0f) }
    val textOffsetY = remember { Animatable(20f) }
    val taglineAlpha = remember { Animatable(0f) }
    val ringProgress = remember { Animatable(0f) }
    val glowAlpha = remember { Animatable(0f) }
    val exitAlpha = remember { Animatable(1f) }

    val infiniteTransition = rememberInfiniteTransition(label = "glow")
    val glowPulse by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowPulse"
    )

    LaunchedEffect(Unit) {
        // Phase 1: Logo appears (0-600ms)
        delay(200)
        logoScale.animateTo(
            targetValue = 1f,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
        logoAlpha.animateTo(1f, animationSpec = tween(400))

        // Phase 2: Ring draws in (400-1000ms)
        delay(100)
        ringProgress.animateTo(1f, animationSpec = tween(800, easing = FastOutSlowInEasing))
        glowAlpha.animateTo(1f, animationSpec = tween(600))

        // Phase 3: Text appears (800-1400ms)
        delay(200)
        textAlpha.animateTo(1f, animationSpec = tween(500))
        textOffsetY.animateTo(0f, animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ))

        // Phase 4: Tagline (1200-1800ms)
        delay(300)
        taglineAlpha.animateTo(1f, animationSpec = tween(500))

        // Hold
        delay(1200)

        // Exit
        exitAlpha.animateTo(0f, animationSpec = tween(400))
        delay(100)
        onSplashComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
            .alpha(exitAlpha.value),
        contentAlignment = Alignment.Center
    ) {
        // Background radial glow
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .alpha(glowAlpha.value * glowPulse)
        ) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Champagne.copy(alpha = 0.08f),
                        Champagne.copy(alpha = 0.02f),
                        Color.Transparent
                    ),
                    center = Offset(size.width / 2, size.height / 2 - 60),
                    radius = size.width * 0.5f
                ),
                radius = size.width * 0.5f,
                center = Offset(size.width / 2, size.height / 2 - 60)
            )
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.offset(y = (-40).dp)
        ) {
            // Logo
            Box(
                modifier = Modifier
                    .size(140.dp)
                    .graphicsLayer {
                        scaleX = logoScale.value
                        scaleY = logoScale.value
                        alpha = logoAlpha.value
                    },
                contentAlignment = Alignment.Center
            ) {
                // Glow behind logo
                Canvas(modifier = Modifier.size(140.dp)) {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Champagne.copy(alpha = 0.15f * glowPulse),
                                Color.Transparent
                            ),
                            radius = size.width * 0.6f
                        ),
                        radius = size.width * 0.6f
                    )
                }

                // Octagon logo
                Canvas(modifier = Modifier.size(120.dp)) {
                    val cx = size.width / 2
                    val cy = size.height / 2
                    val r = size.width * 0.46f
                    val strokeW = 3.dp.toPx()

                    // Octagon vertices
                    val vertices = (0 until 8).map { i ->
                        val angle = Math.toRadians((i * 45.0) - 90.0)
                        Offset(
                            cx + r * kotlin.math.cos(angle).toFloat(),
                            cy + r * kotlin.math.sin(angle).toFloat()
                        )
                    }

                    // Outer octagon
                    drawPath(
                        path = androidx.compose.ui.graphics.Path().apply {
                            moveTo(vertices[0].x, vertices[0].y)
                            for (i in 1 until 8) lineTo(vertices[i].x, vertices[i].y)
                            close()
                        },
                        style = Stroke(width = strokeW, cap = StrokeCap.Round, join = androidx.compose.ui.graphics.StrokeJoin.Round),
                        color = Champagne
                    )

                    // Inner facet lines (drawn by ring progress)
                    if (ringProgress.value > 0f) {
                        val lineAlpha = (ringProgress.value * 0.2f).coerceIn(0f, 1f)
                        for (i in 0 until 8) {
                            val start = Offset(cx, cy)
                            val end = vertices[i]
                            val drawTo = Offset(
                                start.x + (end.x - start.x) * ringProgress.value,
                                start.y + (end.y - start.y) * ringProgress.value
                            )
                            drawLine(
                                color = Champagne.copy(alpha = lineAlpha),
                                start = start,
                                end = drawTo,
                                strokeWidth = 0.8.dp.toPx()
                            )
                        }
                    }

                    // Center diamond
                    if (ringProgress.value > 0.3f) {
                        val diamondAlpha = ((ringProgress.value - 0.3f) / 0.7f).coerceIn(0f, 1f)
                        val ds = 10.dp.toPx() * diamondAlpha
                        drawPath(
                            path = androidx.compose.ui.graphics.Path().apply {
                                moveTo(cx, cy - ds)
                                lineTo(cx + ds, cy)
                                lineTo(cx, cy + ds)
                                lineTo(cx - ds, cy)
                                close()
                            },
                            color = Champagne.copy(alpha = diamondAlpha)
                        )
                    }

                    // Inner ring
                    if (ringProgress.value > 0.5f) {
                        val ringAlpha = ((ringProgress.value - 0.5f) / 0.5f).coerceIn(0f, 1f) * 0.25f
                        drawCircle(
                            color = Champagne.copy(alpha = ringAlpha),
                            radius = r * 0.5f,
                            center = Offset(cx, cy),
                            style = Stroke(width = 0.8.dp.toPx())
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // App name
            androidx.compose.material3.Text(
                text = "LUCKY VAULT",
                fontSize = 22.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 6.sp,
                color = TextPrimary,
                modifier = Modifier
                    .graphicsLayer {
                        alpha = textAlpha.value
                        translationY = textOffsetY.value
                    }
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Tagline
            androidx.compose.material3.Text(
                text = "Your vault. Your fortune.",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                letterSpacing = 1.sp,
                color = TextMuted,
                modifier = Modifier.alpha(taglineAlpha.value)
            )
        }
    }
}
