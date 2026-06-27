package com.luckyvault.ui.screens.draws

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*
import com.luckyvault.ui.util.safeDateTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DrawDetailScreen(
    drawId: String,
    onBack: () -> Unit,
    onBuyTicket: (String) -> Unit,
    viewModel: DrawDetailViewModel = hiltViewModel()
) {
    LaunchedEffect(drawId) { viewModel.loadDraw(drawId) }
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Draw Details", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when {
            uiState.isLoading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold)
                }
            }
            uiState.draw != null -> {
                val draw = uiState.draw!!
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(24.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        Brush.verticalGradient(
                                            listOf(Primary.copy(alpha = 0.2f), MaterialTheme.colorScheme.surface)
                                        )
                                    )
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(draw.title, style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onSurface)
                                    Spacer(Modifier.height(16.dp))
                                    if (draw.description != null) {
                                        Text(
                                            draw.description,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                                        )
                                        Spacer(Modifier.height(16.dp))
                                    }
                                    Text("PRIZE POOL", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                                    Text(
                                        "$${String.format("%.2f", draw.prizePool)}",
                                        fontSize = 40.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Gold
                                    )
                                }
                            }
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            StatCard("Price", "$${String.format("%.2f", draw.ticketPrice)}", Modifier.weight(1f))
                            StatCard("Winners", "${draw.winnerCount}", Modifier.weight(1f))
                            StatCard("Status", draw.status, Modifier.weight(1f))
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            StatCard("Sold", "${draw.soldTickets}", Modifier.weight(1f))
                            StatCard("Max", "${draw.maxTickets}", Modifier.weight(1f))
                            StatCard("Remaining", "${draw.maxTickets - draw.soldTickets}", Modifier.weight(1f))
                        }
                    }

                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Schedule, null, tint = Gold)
                                Spacer(Modifier.width(12.dp))
                                Column {
                                    Text("Draw Time", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                                    Text(draw.scheduledAt.safeDateTime(), color = MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                    }

                    if (draw.status == "COMPLETED" && uiState.winners.isNotEmpty()) {
                        item {
                            Text(
                                "Winners",
                                style = MaterialTheme.typography.titleLarge,
                                color = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(top = 8.dp)
                            )
                        }

                        items(uiState.winners) { winner ->
                            WinnerCard(rank = winner.rank, prize = winner.prize, ticketCode = winner.ticketCode)
                        }
                    }

                    if (draw.status == "OPEN") {
                        item {
                            Spacer(Modifier.height(8.dp))
                            Button(
                                onClick = { onBuyTicket(draw.id) },
                                modifier = Modifier.fillMaxWidth().height(56.dp),
                                enabled = draw.soldTickets < draw.maxTickets,
                                colors = ButtonDefaults.buttonColors(containerColor = Gold),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Icon(Icons.Default.ConfirmationNumber, null, tint = Background)
                                Spacer(Modifier.width(8.dp))
                                Text("Buy Ticket", color = Background, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleMedium)
                            }
                        }
                    }

                    item { Spacer(Modifier.height(16.dp)) }
                }
            }
        }
    }
}

@Composable
fun WinnerCard(rank: Int, prize: Double, ticketCode: String?) {
    val rankIcon = when (rank) {
        1 -> Icons.Default.EmojiEvents
        2 -> Icons.Default.WorkspacePremium
        3 -> Icons.Default.MilitaryTech
        else -> Icons.Default.Star
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(rankIcon, null, tint = Gold, modifier = Modifier.size(36.dp))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("#$rank Winner", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                if (ticketCode != null) {
                    Text(ticketCode, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                }
            }
            Text(
                "+$${String.format("%.2f", prize)}",
                fontWeight = FontWeight.Bold,
                color = Success,
                fontSize = 18.sp
            )
        }
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface, style = MaterialTheme.typography.titleMedium)
            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
        }
    }
}
