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
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.DrawDto
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.components.ShimmerCard
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
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
    var refreshing by remember { mutableStateOf(false) }
    val pullRefreshState = rememberPullRefreshState(refreshing, { refreshing = true })

    Scaffold(
        topBar = {
            LuckyVaultTopBar(
                title = "Lucky Vault",
                actions = {
                    IconButton(onClick = onNavigateToNotifications) {
                        Icon(Icons.Default.Notifications, "Notifications", tint = Gold)
                    }
                    IconButton(onClick = onNavigateToProfile) {
                        Icon(Icons.Default.Person, "Profile", tint = MaterialTheme.colorScheme.onSurface)
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
                .nestedScroll(pullRefreshState.nestedScrollConnection)
        ) {
            if (uiState.isLoading) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(4) {
                        ShimmerCard()
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Spacer(Modifier.height(8.dp))
                        PremiumBalanceCard(
                            balance = uiState.wallet?.balance ?: 0.0,
                            onTopUp = onNavigateToWallet
                        )
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            QuickAction(
                                icon = Icons.Default.ConfirmationNumber,
                                label = if (uiState.activeDraws.isNotEmpty()) "Buy Ticket" else "No Draws",
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
                                icon = Icons.Default.List,
                                label = "My Tickets",
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToTickets
                            )
                        }
                    }

                    item {
                        Text(
                            "Active Draws",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    if (uiState.activeDraws.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Box(
                                    modifier = Modifier.padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        "No active draws available",
                                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                                    )
                                }
                            }
                        }
                    } else {
                        items(uiState.activeDraws) { draw ->
                            PremiumDrawCard(
                                draw = draw,
                                onBuyTicket = { onBuyTicket(draw.id) },
                                onDetails = { onDrawDetail(draw.id) }
                            )
                        }
                    }

                    item { Spacer(Modifier.height(16.dp)) }
                }
            }

            if (refreshing) {
                LaunchedEffect(true) {
                    viewModel.loadData()
                    refreshing = false
                }
            }
        }
    }
}

@Composable
fun PremiumBalanceCard(balance: Double, onTopUp: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Primary.copy(alpha = 0.4f),
                            MaterialTheme.colorScheme.surface
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Text(
                    "Total Balance",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                )
                Text(
                    "$${String.format("%.2f", balance)}",
                    color = Gold,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = onTopUp,
                    colors = ButtonDefaults.buttonColors(containerColor = Gold),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp), tint = Background)
                    Spacer(Modifier.width(8.dp))
                    Text("Top Up Wallet", color = Background, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
fun QuickAction(icon: ImageVector, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, null, tint = Gold, modifier = Modifier.size(28.dp))
            Spacer(Modifier.height(8.dp))
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
fun PremiumDrawCard(draw: DrawDto, onBuyTicket: () -> Unit, onDetails: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(draw.title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
                PremiumStatusBadge(draw.status)
            }

            Spacer(Modifier.height(16.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                InfoColumn("Prize Pool", "$${String.format("%.2f", draw.prizePool)}")
                InfoColumn("Ticket Price", "$${String.format("%.2f", draw.ticketPrice)}")
                InfoColumn("Tickets", "${draw.soldTickets}/${draw.maxTickets}")
            }

            Spacer(Modifier.height(16.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onBuyTicket,
                    modifier = Modifier.weight(1f),
                    enabled = draw.status == "OPEN" && draw.soldTickets < draw.maxTickets,
                    colors = ButtonDefaults.buttonColors(containerColor = Gold),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Buy Ticket", color = Background, fontWeight = FontWeight.SemiBold)
                }
                OutlinedButton(
                    onClick = onDetails,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurface)
                ) {
                    Text("Details")
                }
            }
        }
    }
}

@Composable
fun PremiumStatusBadge(status: String) {
    val (color, text) = when (status) {
        "OPEN" -> Success to "Open"
        "UPCOMING" -> Gold to "Upcoming"
        "COMPLETED" -> PrimaryLight to "Completed"
        else -> MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f) to status
    }
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = color.copy(alpha = 0.15f)
    ) {
        Text(
            text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            color = color,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun InfoColumn(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
    }
}
