package com.luckyvault.ui.screens.auth

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
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
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.luckyvault.ui.components.VaultMark
import com.luckyvault.ui.theme.*

@Composable
fun AuthScreen(
    onNavigateToHome: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var isLoginMode by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var displayName by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current

    // Subtle logo entrance animation
    val infiniteTransition = rememberInfiniteTransition(label = "entrance")
    val logoAlpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = EaseOutCubic),
            repeatMode = RepeatMode.Once
        ),
        label = "logo_alpha"
    )
    val logoScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = EaseOutCubic),
            repeatMode = RepeatMode.Once
        ),
        label = "logo_scale"
    )

    LaunchedEffect(uiState.isRegistered) {
        if (uiState.isRegistered) onNavigateToHome()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(0.dp))

            // Top spacer for vertical centering feel
            Spacer(Modifier.weight(0.3f))

            // Logo mark
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .graphicsLayer {
                        alpha = logoAlpha
                        scaleX = logoScale
                        scaleY = logoScale
                    },
                contentAlignment = Alignment.Center
            ) {
                VaultMark(size = 72)
            }

            Spacer(Modifier.height(24.dp))

            // Brand name
            Text(
                text = "LUCKY VAULT",
                fontSize = 22.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 4.sp,
                color = TextPrimary
            )

            Spacer(Modifier.height(8.dp))

            // Tagline
            Text(
                text = if (isLoginMode) "Welcome back" else "Create your account",
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted,
                letterSpacing = 0.5.sp
            )

            Spacer(Modifier.height(48.dp))

            // ── Form Card ──
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = VaultGraphite.copy(alpha = 0.8f),
                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Champagne.copy(alpha = 0.08f),
                            Color.Transparent,
                            Champagne.copy(alpha = 0.04f)
                        )
                    )
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Email
                    VaultTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = "Email",
                        icon = Icons.Default.MailOutline,
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next,
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )

                    // Display name (signup only)
                    AnimatedVisibility(
                        visible = !isLoginMode,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        VaultTextField(
                            value = displayName,
                            onValueChange = { displayName = it },
                            label = "Display name",
                            icon = Icons.Default.PersonOutline,
                            imeAction = ImeAction.Next,
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        )
                    }

                    // Password
                    VaultTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = "Password",
                        icon = Icons.Default.LockOutline,
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done,
                        isPassword = true,
                        passwordVisible = passwordVisible,
                        onTogglePassword = { passwordVisible = !passwordVisible },
                        onDone = {
                            focusManager.clearFocus()
                            if (isLoginMode) viewModel.login(email, password)
                            else viewModel.register(email, password, displayName.ifBlank { null })
                        }
                    )
                }
            }

            // Error
            AnimatedVisibility(visible = uiState.error != null) {
                Text(
                    text = uiState.error ?: "",
                    color = Crimson,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 12.dp),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(Modifier.height(24.dp))

            // ── Primary Button ──
            Button(
                onClick = {
                    if (isLoginMode) viewModel.login(email, password)
                    else viewModel.register(email, password, displayName.ifBlank { null })
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = !uiState.isLoading && email.isNotBlank() && password.length >= 8,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Champagne,
                    disabledContainerColor = VaultCharcoal,
                    contentColor = VaultBlack,
                    disabledContentColor = TextDisabled
                ),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 0.dp,
                    pressedElevation = 0.dp
                )
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = if (email.isNotBlank() && password.length >= 8) VaultBlack else TextDisabled,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = if (isLoginMode) "Sign in" else "Create account",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 15.sp,
                        letterSpacing = 0.3.sp
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            // Toggle
            Text(
                text = buildString {
                    append(if (isLoginMode) "New here? " else "Already have an account? ")
                    append(if (isLoginMode) "Create an account" else "Sign in")
                },
                color = TextMuted,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.clickable {
                    isLoginMode = !isLoginMode
                    viewModel.clearError()
                }
            )

            // Bottom spacer
            Spacer(Modifier.weight(0.5f))
        }
    }
}

@Composable
private fun VaultTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: ImageVector,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Next,
    onNext: (() -> Unit)? = null,
    onDone: (() -> Unit)? = null,
    isPassword: Boolean = false,
    passwordVisible: Boolean = false,
    onTogglePassword: (() -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = {
            Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
        },
        trailingIcon = if (isPassword) {
            {
                IconButton(onClick = { onTogglePassword?.invoke() }, modifier = Modifier.size(20.dp)) {
                    Icon(
                        if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "Toggle password",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        } else null,
        visualTransformation = if (isPassword && !passwordVisible) PasswordVisualTransformation() else VisualTransformation.None,
        modifier = Modifier.fillMaxWidth(),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
        keyboardActions = KeyboardActions(onNext = { onNext?.invoke() }, onDone = { onDone?.invoke() }),
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Champagne.copy(alpha = 0.4f),
            unfocusedBorderColor = VaultSubtle,
            focusedContainerColor = VaultCharcoal.copy(alpha = 0.5f),
            unfocusedContainerColor = VaultCharcoal.copy(alpha = 0.3f),
            focusedTextColor = TextPrimary,
            unfocusedTextColor = TextPrimary,
            cursorColor = Champagne,
            focusedLeadingIconColor = Champagne.copy(alpha = 0.7f),
            unfocusedLeadingIconColor = TextMuted,
            focusedLabelColor = Champagne.copy(alpha = 0.7f),
            unfocusedLabelColor = TextMuted
        )
    )
}
