package com.luckyvault.ui.screens.home

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.DrawDto
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.components.ShimmerCard
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onBuyTicket: (String) -> Unit,
    onNavigateToWallet: () -> Unit,
    onNavigateToTickets: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onDrawDetail: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    Scaffold(
        topBar = {
            LuckyVaultTopBar(
                showLogo = true,
                actions = {
                    IconButton(onClick = onNavigateToNotifications) {
                        Icon(Icons.Default.Notifications, "Notifications", tint = TextSecondary, modifier = Modifier.size(22.dp))
                    }
                    IconButton(onClick = onNavigateToProfile) {
                        Icon(Icons.Default.PersonOutline, "Profile", tint = TextSecondary, modifier = Modifier.size(22.dp))
                    }
                }
            )
        },
        containerColor = VaultBlack
    ) { padding ->
        if (uiState.isLoading) {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(4) { ShimmerCard() }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Balance card
                item {
                    Spacer(Modifier.height(4.dp))
                    BalanceCard(
                        balance = uiState.wallet?.balance ?: 0.0,
                        onTopUp = onNavigateToWallet
                    )
                }

                // Quick actions
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        QuickAction(
                            icon = Icons.Default.ConfirmationNumber,
                            label = "Buy Ticket",
                            modifier = Modifier.weight(1f),
                            onClick = { uiState.activeDraws.firstOrNull()?.let { onBuyTicket(it.id) } }
                        )
                        QuickAction(
                            icon = Icons.Default.AccountBalanceWallet,
                            label = "Wallet",
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToWallet
                        )
                        QuickAction(
                            icon = Icons.Default.Receipt,
                            label = "My Tickets",
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToTickets
                        )
                    }
                }

                // Active draws header
                item {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Active draws",
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary
                    )
                }

                // Draw cards or empty state
                if (uiState.activeDraws.isEmpty()) {
                    item { EmptyState("No active draws", "Check back soon for new opportunities") }
                } else {
                    items(uiState.activeDraws) { draw ->
                        DrawCard(
                            draw = draw,
                            onBuy = { onBuyTicket(draw.id) },
                            onDetails = { onDrawDetail(draw.id) }
                        )
                    }
                }

                item { Spacer(Modifier.height(8.dp)) }
            }
        }
    }
}

@Composable
private fun BalanceCard(balance: Double, onTopUp: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = VaultGraphite
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .drawBehind {
                    // Subtle gradient overlay
                    drawRect(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                Champagne.copy(alpha = 0.06f),
                                Color.Transparent
                            ),
                            start = Offset(0f, 0f),
                            end = Offset(size.width, size.height)
                        )
                    )
                }
                .padding(24.dp)
        ) {
            Column {
                Text(
                    "Total balance",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextMuted
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "$${String.format("%.2f", balance)}",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Light,
                    color = TextPrimary,
                    letterSpacing = (-0.5).sp
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = onTopUp,
                    colors = ButtonDefaults.buttonColors(containerColor = Champagne, contentColor = VaultBlack),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
                ) {
                    Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Top up", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun QuickAction(icon: ImageVector, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Surface(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = VaultGraphite
    ) {
        Column(
            modifier = Modifier.padding(vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, null, tint = Champagne, modifier = Modifier.size(22.dp))
            Spacer(Modifier.height(8.dp))
            Text(label, style = MaterialTheme.typography.labelMedium, color = TextSecondary)
        }
    }
}

@Composable
private fun DrawCard(draw: DrawDto, onBuy: () -> Unit, onDetails: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = VaultGraphite
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(draw.title, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                StatusChip(draw.status)
            }

            Spacer(Modifier.height(16.dp))

            // Stats row
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                DrawStat("Prize pool", "$${String.format("%.0f", draw.prizePool)}")
                DrawStat("Ticket", "$${String.format("%.2f", draw.ticketPrice)}")
                DrawStat("Tickets", "${draw.soldTickets}/${draw.maxTickets}")
            }

            Spacer(Modifier.height(16.dp))

            // Actions
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onBuy,
                    modifier = Modifier.weight(1f),
                    enabled = draw.status == "OPEN" && draw.soldTickets < draw.maxTickets,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Champagne,
                        disabledContainerColor = VaultCharcoal,
                        contentColor = VaultBlack,
                        disabledContentColor = TextDisabled
                    ),
                    shape = RoundedCornerShape(10.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
                ) {
                    Text("Buy ticket", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                }
                OutlinedButton(
                    onClick = onDetails,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary),
                    border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                        brush = Brush.linearGradient(listOf(VaultSubtle, VaultSubtle))
                    )
                ) {
                    Text("Details", fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun DrawStat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = TextPrimary)
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
    }
}

@Composable
fun StatusChip(status: String) {
    val (color, text) = when (status) {
        "OPEN" -> Emerald to "Open"
        "UPCOMING" -> Amber to "Upcoming"
        "COMPLETED" -> TextMuted to "Completed"
        else -> TextMuted to status
    }
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            color = color,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun EmptyState(title: String, subtitle: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = VaultGraphite
    ) {
        Column(
            modifier = Modifier.padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Default.Mail,
                null,
                tint = TextDisabled,
                modifier = Modifier.size(40.dp)
            )
            Spacer(Modifier.height(12.dp))
            Text(title, color = TextSecondary, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
            Text(subtitle, color = TextMuted, style = MaterialTheme.typography.bodySmall)
        }
    }
}
