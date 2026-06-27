package com.luckyvault.ui.screens.draws

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.screens.home.StatusChip
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DrawDetailScreen(
    drawId: String,
    onBack: () -> Unit,
    onBuyTicket: (String) -> Unit,
    viewModel: DrawDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Draw details", onBack = onBack) },
        containerColor = VaultBlack
    ) { padding ->
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Champagne, modifier = Modifier.size(32.dp), strokeWidth = 2.dp)
            }
        } else if (uiState.draw != null) {
            val draw = uiState.draw!!
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Header
                item {
                    Spacer(Modifier.height(4.dp))
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        color = VaultGraphite
                    ) {
                        Column(modifier = Modifier.padding(24.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(draw.title, style = MaterialTheme.typography.headlineMedium, color = TextPrimary)
                                StatusChip(draw.status)
                            }
                            Spacer(Modifier.height(20.dp))
                            // Prize pool - large number
                            Text("Prize pool", style = MaterialTheme.typography.bodyMedium, color = TextMuted)
                            Text(
                                "$${String.format("%.2f", draw.prizePool)}",
                                fontSize = 36.sp,
                                fontWeight = FontWeight.Light,
                                color = TextPrimary
                            )
                        }
                    }
                }

                // Details card
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = VaultGraphite
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            DetailRow("Draw time", draw.scheduledAt)
                            Spacer(Modifier.height(12.dp))
                            DetailRow("Ticket price", "$${String.format("%.2f", draw.ticketPrice)}")
                            Spacer(Modifier.height(12.dp))
                            DetailRow("Total tickets", "${draw.soldTickets}/${draw.maxTickets}")
                            Spacer(Modifier.height(12.dp))
                            DetailRow("Winner count", "${draw.winnerCount}")
                        }
                    }
                }

                // Buy button
                if (draw.status == "OPEN") {
                    item {
                        Spacer(Modifier.height(4.dp))
                        Button(
                            onClick = { onBuyTicket(draw.id) },
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Champagne, contentColor = VaultBlack),
                            shape = RoundedCornerShape(14.dp),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
                        ) {
                            Text("Buy ticket", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                        }
                    }
                }

                item { Spacer(Modifier.height(8.dp)) }
            }
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = TextMuted)
        Text(value, fontWeight = FontWeight.Medium, color = TextPrimary)
    }
}
