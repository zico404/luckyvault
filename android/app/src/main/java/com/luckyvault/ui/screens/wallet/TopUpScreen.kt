package com.luckyvault.ui.screens.wallet

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.theme.*

private val AMOUNTS = listOf(5.0, 10.0, 25.0, 50.0, 100.0, 250.0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopUpScreen(
    onBack: () -> Unit,
    onNavigateToWallet: () -> Unit,
    viewModel: TopUpViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedAmount by remember { mutableStateOf<Double?>(null) }
    var customAmount by remember { mutableStateOf("") }
    var selectedMethod by remember { mutableStateOf("card") }

    val finalAmount = selectedAmount ?: customAmount.toDoubleOrNull() ?: 0.0

    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    if (uiState.success) {
        Scaffold(containerColor = VaultBlack) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Emerald,
                        modifier = Modifier.size(64.dp)
                    )
                    Text("Top-up request submitted", fontSize = 22.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                    Text(
                        "Your $$finalAmount top-up is pending admin approval. You will be notified once it's processed.",
                        color = TextSecondary,
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = onNavigateToWallet,
                        colors = ButtonDefaults.buttonColors(containerColor = Champagne, contentColor = VaultBlack),
                        shape = RoundedCornerShape(12.dp)
                    ) { Text("View wallet", fontWeight = FontWeight.SemiBold) }
                    TextButton(onClick = { onNavigateToWallet() }) {
                        Text("Go back", color = TextMuted)
                    }
                }
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Top up wallet") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = VaultBlack,
                    titleContentColor = TextPrimary,
                    navigationIconContentColor = TextMuted
                )
            )
        },
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    shape = RoundedCornerShape(12.dp),
                    containerColor = VaultElevated,
                    contentColor = TextPrimary,
                    actionColor = Champagne,
                    modifier = Modifier.padding(16.dp)
                )
            }
        },
        containerColor = VaultBlack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(Modifier.height(4.dp))

            // Amount selection
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = VaultGraphite
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Select amount", fontSize = 12.sp, color = TextMuted, letterSpacing = 0.5.sp)
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AMOUNTS.take(3).forEach { amount ->
                            AmountChip(
                                amount = amount,
                                selected = selectedAmount == amount,
                                onClick = { selectedAmount = amount; customAmount = "" },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AMOUNTS.drop(3).forEach { amount ->
                            AmountChip(
                                amount = amount,
                                selected = selectedAmount == amount,
                                onClick = { selectedAmount = amount; customAmount = "" },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(
                        value = customAmount,
                        onValueChange = { customAmount = it; selectedAmount = null },
                        label = { Text("Custom amount") },
                        leadingIcon = { Text("$", color = TextMuted, fontSize = 16.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Champagne.copy(alpha = 0.4f),
                            unfocusedBorderColor = VaultSubtle,
                            focusedContainerColor = VaultCharcoal.copy(alpha = 0.5f),
                            unfocusedContainerColor = VaultCharcoal.copy(alpha = 0.3f),
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            cursorColor = Champagne,
                            focusedLabelColor = Champagne.copy(alpha = 0.7f),
                            unfocusedLabelColor = TextMuted
                        )
                    )
                }
            }

            // Payment method
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = VaultGraphite
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Payment method", fontSize = 12.sp, color = TextMuted, letterSpacing = 0.5.sp)
                    Spacer(Modifier.height(12.dp))
                    listOf("card" to "Credit / Debit Card", "apple_pay" to "Apple Pay", "google_pay" to "Google Pay").forEach { (id, label) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selectedMethod == id) Champagne.copy(alpha = 0.08f) else VaultCharcoal)
                                .clickable { selectedMethod = id }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = VaultElevated,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        when (id) {
                                            "card" -> Icons.Default.CreditCard
                                            "apple_pay" -> Icons.Default.PhoneIphone
                                            else -> Icons.Default.PhoneAndroid
                                        },
                                        null,
                                        tint = if (selectedMethod == id) Champagne else TextMuted,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                            Spacer(Modifier.width(12.dp))
                            Text(label, color = TextPrimary, fontSize = 14.sp, modifier = Modifier.weight(1f))
                            if (selectedMethod == id) {
                                Surface(shape = RoundedCornerShape(50), color = Champagne, modifier = Modifier.size(8.dp)) {}
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                }
            }

            // Submit button
            Button(
                onClick = { viewModel.topUp(finalAmount, selectedMethod) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = !uiState.isLoading && finalAmount > 0 && finalAmount <= 10000,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Champagne,
                    disabledContainerColor = VaultCharcoal,
                    contentColor = VaultBlack,
                    disabledContentColor = TextDisabled
                )
            ) {
                if (uiState.isLoading) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), color = VaultBlack, strokeWidth = 2.dp)
                        Spacer(Modifier.width(8.dp))
                        Text("Processing...", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                    }
                } else {
                    Text(
                        "Top up $${if (finalAmount > 0) String.format("%.2f", finalAmount) else "0.00"}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 15.sp
                    )
                }
            }

            Text(
                "Top-up is instant. Maximum single top-up is $10,000.",
                color = TextDisabled,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun AmountChip(amount: Double, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier
            .height(44.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(10.dp),
        color = if (selected) Champagne else VaultCharcoal,
        border = BorderStroke(1.dp, Brush.linearGradient(listOf(
            if (selected) Champagne else VaultSubtle,
            if (selected) Champagne else VaultSubtle
        )))
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                "$${amount.toInt()}",
                fontWeight = FontWeight.Medium,
                fontSize = 14.sp,
                color = if (selected) VaultBlack else TextSecondary
            )
        }
    }
}
