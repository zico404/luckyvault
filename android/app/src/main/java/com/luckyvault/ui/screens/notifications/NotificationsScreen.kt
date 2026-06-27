package com.luckyvault.ui.screens.notifications

import androidx.compose.foundation.background
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
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.NotificationDto
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*
import com.luckyvault.ui.util.safeDateTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onBack: () -> Unit,
    viewModel: NotificationsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val pullToRefreshState = rememberPullToRefreshState()

    Scaffold(
        topBar = {
            LuckyVaultTopBar(
                title = "Notifications",
                onBack = onBack,
                actions = {
                    if (uiState.unreadCount > 0) {
                        TextButton(onClick = { viewModel.markAllAsRead() }) {
                            Text("Mark all read", color = Gold, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .nestedScroll(pullToRefreshState.nestedScrollConnection)
        ) {
            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold)
                }
            } else if (uiState.notifications.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.NotificationsOff,
                            null,
                            tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(Modifier.height(16.dp))
                        Text("No notifications", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(vertical = 16.dp)
                ) {
                    items(uiState.notifications) { notif ->
                        PremiumNotificationItem(
                            notification = notif,
                            onClick = { viewModel.markAsRead(notif.id) }
                        )
                    }
                }
            }

            if (pullToRefreshState.isRefreshing) {
                LaunchedEffect(true) {
                    viewModel.loadData()
                    pullToRefreshState.endRefresh()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumNotificationItem(notification: NotificationDto, onClick: () -> Unit) {
    val icon = when (notification.type) {
        "WINNER" -> Icons.Default.EmojiEvents
        "TICKET_PURCHASED" -> Icons.Default.ConfirmationNumber
        "DRAW_STARTED" -> Icons.Default.PlayArrow
        "DRAW_COMPLETED" -> Icons.Default.CheckCircle
        else -> Icons.Default.Notifications
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) MaterialTheme.colorScheme.surface
            else Primary.copy(alpha = 0.1f)
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(icon, null, tint = Gold, modifier = Modifier.size(28.dp))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    notification.title,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    notification.body,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    notification.createdAt.safeDateTime(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f)
                )
            }
            if (!notification.isRead) {
                Box(
                    modifier = Modifier
                    .size(8.dp)
                    .padding(top = 4.dp)
                    .background(Gold, RoundedCornerShape(4.dp))
                )
            }
        }
    }
}
