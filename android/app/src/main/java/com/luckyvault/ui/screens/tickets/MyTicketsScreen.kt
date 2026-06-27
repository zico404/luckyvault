package com.luckyvault.ui.screens.tickets

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.screens.home.StatusChip
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyTicketsScreen(
    onBack: () -> Unit,
    viewModel: MyTicketsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "My tickets", onBack = onBack) },
        containerColor = VaultBlack
    ) { padding ->
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Champagne, modifier = Modifier.size(32.dp), strokeWidth = 2.dp)
            }
        } else if (uiState.tickets.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.ticket, null, tint = TextDisabled, modifier = Modifier.size(48.dp))
                    Spacer(Modifier.height(12.dp))
                    Text("No tickets yet", color = TextSecondary, style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(4.dp))
                    Text("Purchase a ticket to enter a draw", color = TextMuted, style = MaterialTheme.typography.bodySmall)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item { Spacer(Modifier.height(4.dp)) }
                items(uiState.tickets) { ticket ->
                    TicketCard(ticket)
                }
                item { Spacer(Modifier.height(8.dp)) }
            }
        }
    }
}

@Composable
private fun TicketCard(ticket: com.luckyvault.data.remote.TicketDto) {
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
                Text(ticket.draw?.title ?: "Draw", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                StatusChip(ticket.status)
            }
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("Code", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text(ticket.ticketCode, fontWeight = FontWeight.Medium, color = TextPrimary, fontSize = 14.sp)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Price", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text("$${String.format("%.2f", ticket.purchasePrice)}", fontWeight = FontWeight.Medium, color = TextPrimary, fontSize = 14.sp)
                }
            }
        }
    }
}
