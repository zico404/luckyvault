package com.luckyvault.ui.screens.notifications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.NotificationDto
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onBack: () -> Unit,
    viewModel: NotificationsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    Scaffold(
        topBar = {
            LuckyVaultTopBar(
                title = "Notifications",
                onBack = onBack,
                actions = {
                    if (uiState.unreadCount > 0) {
                        TextButton(onClick = { viewModel.markAllAsRead() }) {
                            Text("Mark all read", color = Champagne, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            )
        },
        containerColor = VaultBlack
    ) { padding ->
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Champagne, modifier = Modifier.size(32.dp), strokeWidth = 2.dp)
            }
        } else if (uiState.notifications.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.NotificationsOff, null, tint = TextDisabled, modifier = Modifier.size(48.dp))
                    Spacer(Modifier.height(12.dp))
                    Text("No notifications", color = TextSecondary, style = MaterialTheme.typography.titleMedium)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(uiState.notifications) { notif ->
                    NotificationItem(
                        notification = notif,
                        onClick = { viewModel.markAsRead(notif.id) }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NotificationItem(notification: NotificationDto, onClick: () -> Unit) {
    val icon = when (notification.type) {
        "WINNER" -> Icons.Default.EmojiEvents
        "TICKET_PURCHASED" -> Icons.Default.ConfirmationNumber
        "DRAW_STARTED" -> Icons.Default.PlayArrow
        "DRAW_COMPLETED" -> Icons.Default.CheckCircle
        else -> Icons.Default.Notifications
    }
    val iconColor = when (notification.type) {
        "WINNER" -> Emerald
        "TICKET_PURCHASED" -> Champagne
        "DRAW_STARTED" -> Amber
        "DRAW_COMPLETED" -> TextMuted
        else -> TextMuted
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = if (notification.isRead) VaultGraphite else VaultCharcoal
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = iconColor.copy(alpha = 0.1f),
                modifier = Modifier.size(36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = iconColor, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(notification.title, fontWeight = FontWeight.Medium, color = TextPrimary, fontSize = 14.sp)
                Spacer(Modifier.height(4.dp))
                Text(notification.body, style = MaterialTheme.typography.bodySmall, color = TextMuted, maxLines = 2)
            }
            if (!notification.isRead) {
                Surface(
                    modifier = Modifier.padding(start = 8.dp, top = 4.dp).size(8.dp),
                    shape = RoundedCornerShape(4.dp),
                    color = Champagne
                ) {}
            }
        }
    }
}
