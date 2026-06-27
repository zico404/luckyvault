package com.luckyvault.ui.screens.wallet

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
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    onBack: () -> Unit,
    viewModel: WalletViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showTopUp by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Wallet", onBack = onBack) },
        containerColor = VaultBlack
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Balance card
            item {
                Spacer(Modifier.height(4.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    color = VaultGraphite
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .drawBehind {
                                drawRect(
                                    brush = Brush.linearGradient(
                                        colors = listOf(Champagne.copy(alpha = 0.06f), Color.Transparent)
                                    )
                                )
                            }
                            .padding(24.dp)
                    ) {
                        Column {
                            Text("Available balance", style = MaterialTheme.typography.bodyMedium, color = TextMuted)
                            Spacer(Modifier.height(4.dp))
                            Text(
                                "$${String.format("%.2f", uiState.wallet?.balance ?: 0.0)}",
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Light,
                                color = TextPrimary
                            )
                            Spacer(Modifier.height(20.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Button(
                                    onClick = { showTopUp = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = Champagne, contentColor = VaultBlack),
                                    shape = RoundedCornerShape(10.dp),
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
            }

            // Transactions header
            item {
                Spacer(Modifier.height(4.dp))
                Text("Transactions", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
            }

            // Transaction list
            if (uiState.transactions.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = VaultGraphite
                    ) {
                        Column(
                            modifier = Modifier.padding(40.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.receipt_long, null, tint = TextDisabled, modifier = Modifier.size(40.dp))
                            Spacer(Modifier.height(12.dp))
                            Text("No transactions yet", color = TextSecondary, style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
            } else {
                items(uiState.transactions) { tx ->
                    TransactionRow(tx)
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }

    // Top up dialog
    if (showTopUp) {
        AlertDialog(
            onDismissRequest = { showTopUp = false },
            title = { Text("Top up wallet", fontWeight = FontWeight.SemiBold) },
            text = { Text("Select an amount to add to your wallet.", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = { showTopUp = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Champagne, contentColor = VaultBlack),
                    shape = RoundedCornerShape(10.dp)
                ) { Text("Confirm") }
            },
            dismissButton = {
                TextButton(onClick = { showTopUp = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = VaultGraphite,
            titleContentColor = TextPrimary,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

@Composable
private fun TransactionRow(tx: com.luckyvault.data.remote.TransactionDto) {
    val icon = when (tx.type) {
        "TOP_UP" -> Icons.Default.add_circle
        "PURCHASE" -> Icons.Default.remove_circle
        "WINNING" -> Icons.Default.emoji_events
        "WITHDRAWAL" -> Icons.Default.arrow_upward
        else -> Icons.Default.circle
    }
    val color = when (tx.type) {
        "TOP_UP", "WINNING" -> Emerald
        "PURCHASE", "WITHDRAWAL" -> Crimson
        else -> TextMuted
    }
    val sign = if (tx.type in listOf("TOP_UP", "WINNING")) "+" else "-"

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = VaultGraphite
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = color.copy(alpha = 0.1f),
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(tx.type.replaceFirstChar { it.titlecase() }, fontWeight = FontWeight.Medium, color = TextPrimary, fontSize = 14.sp)
                Text(tx.description ?: "", style = MaterialTheme.typography.bodySmall, color = TextMuted, maxLines = 1)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("$sign$${String.format("%.2f", tx.amount)}", fontWeight = FontWeight.Medium, color = color, fontSize = 14.sp)
            }
        }
    }
}
