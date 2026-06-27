package com.luckyvault.ui.screens.tickets

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.TicketDto
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*
import com.luckyvault.ui.util.generateQrBitmap
import com.luckyvault.ui.util.safeDateShort

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyTicketsScreen(
    onBack: () -> Unit,
    viewModel: MyTicketsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTicket by remember { mutableStateOf<TicketDto?>(null) }
    val pullToRefreshState = rememberPullToRefreshState()

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "My Tickets", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .nestedScroll(pullToRefreshState.nestedScrollConnection)
        ) {
            if (uiState.isLoading && uiState.tickets.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold)
                }
            } else if (uiState.tickets.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.ConfirmationNumber, null, tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f), modifier = Modifier.size(64.dp))
                        Spacer(Modifier.height(16.dp))
                        Text("No tickets yet", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                        Text("Buy a ticket to get started", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f), style = MaterialTheme.typography.bodySmall)
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(vertical = 16.dp)
                ) {
                    itemsIndexed(uiState.tickets) { index, ticket ->
                        PremiumTicketCard(
                            ticket = ticket,
                            onQrClick = { selectedTicket = ticket }
                        )
                        if (index == uiState.tickets.lastIndex && uiState.page < uiState.totalPages) {
                            viewModel.loadMore()
                        }
                    }
                }
            }

            if (pullToRefreshState.isRefreshing) {
                LaunchedEffect(true) {
                    viewModel.loadTickets()
                    pullToRefreshState.endRefresh()
                }
            }
        }
    }

    selectedTicket?.let { ticket ->
        QrCodeDialog(
            ticket = ticket,
            onDismiss = { selectedTicket = null }
        )
    }
}

@Composable
fun PremiumTicketCard(ticket: TicketDto, onQrClick: () -> Unit) {
    val (statusColor, statusText) = when (ticket.status) {
        "WON" -> Success to "Won"
        "LOST" -> MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f) to "Lost"
        "ACTIVE" -> Gold to "Active"
        else -> MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f) to ticket.status
    }

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
                Text(ticket.draw?.title ?: "Draw", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = statusColor.copy(alpha = 0.15f)
                ) {
                    Text(
                        statusText,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        color = statusColor,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Code", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f))
                    Text(ticket.ticketCode, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium, color = Gold, letterSpacing = 1.sp)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Price", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f))
                    Text("$${String.format("%.2f", ticket.purchasePrice)}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                }
            }

            Spacer(Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "Purchased: ${ticket.createdAt.safeDateShort()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                )
                IconButton(onClick = onQrClick) {
                    Icon(Icons.Default.QrCodeScanner, "Show QR", tint = Gold)
                }
            }
        }
    }
}

@Composable
fun QrCodeDialog(ticket: TicketDto, onDismiss: () -> Unit) {
    val qrBitmap = remember(ticket.ticketCode) { generateQrBitmap(ticket.ticketCode, 512) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(ticket.draw?.title ?: "Ticket", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (qrBitmap != null) {
                    Image(
                        bitmap = qrBitmap.asImageBitmap(),
                        contentDescription = "QR Code",
                        modifier = Modifier.size(250.dp)
                    )
                }
                Text(
                    ticket.ticketCode,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Gold,
                    letterSpacing = 2.sp,
                    textAlign = TextAlign.Center
                )
                Text(
                    "Status: ${ticket.status}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = Gold)
            }
        },
        containerColor = MaterialTheme.colorScheme.surface
    )
}
