package com.luckyvault.ui.screens.wallet

import androidx.compose.animation.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.data.remote.TransactionDto
import com.luckyvault.ui.components.ErrorRetryView
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.components.ShimmerCard
import com.luckyvault.ui.theme.*
import com.luckyvault.ui.util.safeDateShort

data class TopUpOption(val label: String, val amount: Double)

private val topUpOptions = listOf(
    TopUpOption("$10", 10.0),
    TopUpOption("$25", 25.0),
    TopUpOption("$50", 50.0),
    TopUpOption("$100", 100.0),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    onBack: () -> Unit,
    viewModel: WalletViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showTopUp by remember { mutableStateOf(false) }
    val pullToRefreshState = rememberPullToRefreshState()

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Wallet", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .nestedScroll(pullToRefreshState.nestedScrollConnection)
        ) {
            if (uiState.isLoading && uiState.transactions.isEmpty()) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(vertical = 16.dp)
                ) {
                    items(4) { ShimmerCard() }
                }
            } else if (uiState.error != null && uiState.transactions.isEmpty()) {
                ErrorRetryView(
                    message = uiState.error,
                    onRetry = { viewModel.loadData() }
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(vertical = 16.dp)
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
                                        Brush.horizontalGradient(
                                            listOf(Primary.copy(alpha = 0.3f), MaterialTheme.colorScheme.surface)
                                        )
                                    )
                                    .padding(24.dp)
                            ) {
                                Column {
                                    Text(
                                        "Available Balance",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                                    )
                                    Text(
                                        "$${String.format("%.2f", uiState.wallet?.balance ?: 0.0)}",
                                        fontSize = 36.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Gold
                                    )
                                    Spacer(Modifier.height(16.dp))
                                    Button(
                                        onClick = { showTopUp = true },
                                        colors = ButtonDefaults.buttonColors(containerColor = Gold),
                                        shape = RoundedCornerShape(12.dp)
                                    ) {
                                        Icon(Icons.Default.Add, null, tint = Background, modifier = Modifier.size(18.dp))
                                        Spacer(Modifier.width(8.dp))
                                        Text("Top Up", color = Background, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "Transactions",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }

                    if (uiState.transactions.isEmpty()) {
                        item {
                            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                                Text(
                                    "No transactions yet",
                                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                                )
                            }
                        }
                    } else {
                        itemsIndexed(uiState.transactions) { index, tx ->
                            PremiumTransactionItem(tx)
                            if (index == uiState.transactions.lastIndex && uiState.page < uiState.totalPages) {
                                viewModel.loadMore()
                            }
                        }
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

    if (showTopUp) {
        TopUpDialog(
            onDismiss = { showTopUp = false },
            onTopUp = { amount ->
                viewModel.topUp(amount)
                showTopUp = false
            }
        )
    }
}

@Composable
fun TopUpDialog(onDismiss: () -> Unit, onTopUp: (Double) -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Top Up Wallet", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "Select amount to deposit:",
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    topUpOptions.take(2).forEach { option ->
                        Button(
                            onClick = { onTopUp(option.amount) },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Gold),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(option.label, color = Background, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    topUpOptions.drop(2).forEach { option ->
                        Button(
                            onClick = { onTopUp(option.amount) },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Gold),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(option.label, color = Background, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = MaterialTheme.colorScheme.error)
            }
        },
        containerColor = MaterialTheme.colorScheme.surface
    )
}

@Composable
fun PremiumTransactionItem(tx: TransactionDto) {
    val (icon, color) = when (tx.type) {
        "DEPOSIT" -> Icons.Default.AddCircle to Success
        "PURCHASE" -> Icons.Default.RemoveCircle to MaterialTheme.colorScheme.error
        "WINNING" -> Icons.Default.EmojiEvents to Gold
        "REFUND" -> Icons.Default.Replay to MaterialTheme.colorScheme.secondary
        else -> Icons.Default.Circle to MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
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
            Icon(icon, null, tint = color, modifier = Modifier.size(36.dp))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(tx.type.replaceFirstChar { it.titlecase() }, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurface)
                Text(tx.description ?: "", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${if (tx.type in listOf("WINNING", "DEPOSIT", "REFUND")) "+" else "-"}$${String.format("%.2f", tx.amount)}",
                    fontWeight = FontWeight.SemiBold,
                    color = color
                )
                Text(tx.createdAt.safeDateShort(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f))
            }
        }
    }
}
