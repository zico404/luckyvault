package com.luckyvault.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.luckyvault.ui.theme.*

@Composable
fun ShimmerCard() {
    val shimmerTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerX by shimmerTransition.animateFloat(
        initialValue = -300f,
        targetValue = 300f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_x"
    )

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = VaultGraphite
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Title shimmer
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(16.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(VaultCharcoal, VaultElevated, VaultCharcoal),
                            start = Offset(shimmerX, 0f),
                            end = Offset(shimmerX + 150f, 0f)
                        )
                    )
            )
            Spacer(Modifier.height(12.dp))
            // Content shimmer
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.4f)
                    .height(12.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(VaultCharcoal, VaultElevated, VaultCharcoal),
                            start = Offset(shimmerX, 0f),
                            end = Offset(shimmerX + 100f, 0f)
                        )
                    )
            )
            Spacer(Modifier.height(16.dp))
            // Button shimmer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(VaultCharcoal, VaultElevated, VaultCharcoal),
                            start = Offset(shimmerX, 0f),
                            end = Offset(shimmerX + 300f, 0f)
                        )
                    )
            )
        }
    }
}
