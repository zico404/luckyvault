package com.luckyvault.ui.screens.tickets

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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
fun BuyTicketScreen(
    onBack: () -> Unit,
    onTicketPurchased: () -> Unit,
    viewModel: BuyTicketViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.success) {
        if (uiState.success) onTicketPurchased()
    }

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Buy ticket", onBack = onBack) },
        containerColor = VaultBlack
    ) { padding ->
        if (uiState.isLoading && uiState.draw == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Champagne, modifier = Modifier.size(32.dp), strokeWidth = 2.dp)
            }
        } else if (uiState.draw != null) {
            val draw = uiState.draw!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 20.dp),
            ) {
                Spacer(Modifier.height(8.dp))

                // Draw summary card
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = VaultGraphite
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(draw.title, style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                            StatusChip(draw.status)
                        }
                        Spacer(Modifier.height(20.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            StatItem("Prize pool", "$${String.format("%.0f", draw.prizePool)}")
                            StatItem("Ticket price", "$${String.format("%.2f", draw.ticketPrice)}")
                            StatItem("Remaining", "${draw.maxTickets - draw.soldTickets}")
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Balance check
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = VaultGraphite
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Your balance", style = MaterialTheme.typography.bodyMedium, color = TextMuted)
                        Spacer(Modifier.weight(1f))
                        Text(
                            "$${String.format("%.2f", uiState.balance)}",
                            fontWeight = FontWeight.Medium,
                            color = if (uiState.balance >= draw.ticketPrice) TextPrimary else Crimson
                        )
                    }
                }

                if (uiState.balance < draw.ticketPrice) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Insufficient balance. Please top up your wallet.",
                        color = Crimson,
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                // Error
                if (uiState.error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(uiState.error!!, color = Crimson, style = MaterialTheme.typography.bodySmall)
                }

                Spacer(Modifier.weight(1f))

                // Purchase button
                Button(
                    onClick = { viewModel.purchaseTicket() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    enabled = !uiState.isLoading && uiState.balance >= draw.ticketPrice && draw.status == "OPEN",
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Champagne,
                        disabledContainerColor = VaultCharcoal,
                        contentColor = VaultBlack,
                        disabledContentColor = TextDisabled
                    ),
                    shape = RoundedCornerShape(14.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = VaultBlack, strokeWidth = 2.dp)
                    } else {
                        Text("Purchase ticket for $${String.format("%.2f", draw.ticketPrice)}", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                    }
                }

                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.Medium, color = TextPrimary)
        Spacer(Modifier.height(2.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
    }
}
