package com.luckyvault.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.components.LuckyVaultTopBar
import com.luckyvault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    onLogout: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showLogoutConfirm by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { LuckyVaultTopBar(title = "Profile", onBack = onBack) },
        containerColor = VaultBlack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))

            // Avatar
            Surface(
                modifier = Modifier.size(72.dp),
                shape = CircleShape,
                color = VaultCharcoal
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        (uiState.user?.displayName ?: uiState.user?.email ?: "?").first().uppercase(),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Champagne
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
            Text(uiState.user?.displayName ?: "User", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold, color = TextPrimary)
            Spacer(Modifier.height(4.dp))
            Text(uiState.user?.email ?: "", style = MaterialTheme.typography.bodyMedium, color = TextMuted)

            Spacer(Modifier.height(32.dp))

            // Info card
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = VaultGraphite
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    ProfileInfoRow(Icons.Default.PersonOutline, "Name", uiState.user?.displayName ?: "Not set")
                    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp).height(1.dp).background(VaultSubtle))
                    ProfileInfoRow(Icons.Default.MailOutline, "Email", uiState.user?.email ?: "Not set")
                    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp).height(1.dp).background(VaultSubtle))
                    ProfileInfoRow(Icons.Default.AccountBalanceWallet, "Balance", "$${String.format("%.2f", uiState.wallet?.balance ?: 0.0)}")
                    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp).height(1.dp).background(VaultSubtle))
                    ProfileInfoRow(Icons.Default.Badge, "Role", uiState.user?.role ?: "USER")
                }
            }

            Spacer(Modifier.weight(1f))

            // Sign out
            OutlinedButton(
                onClick = { showLogoutConfirm = true },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Crimson),
                border = BorderStroke(1.dp, Crimson.copy(alpha = 0.3f))
            ) {
                Icon(Icons.Default.Logout, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Sign out", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            }

            Spacer(Modifier.height(16.dp))
        }
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Sign out", fontWeight = FontWeight.SemiBold) },
            text = { Text("Are you sure you want to sign out?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutConfirm = false
                        viewModel.logout()
                        onLogout()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Crimson, contentColor = TextPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) { Text("Sign out") }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
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
private fun ProfileInfoRow(icon: ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = TextMuted, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(12.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
            Spacer(Modifier.height(2.dp))
            Text(value, color = TextPrimary, fontWeight = FontWeight.Medium, fontSize = 14.sp)
        }
    }
}
