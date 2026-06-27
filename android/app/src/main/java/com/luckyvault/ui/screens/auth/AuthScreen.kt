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
import androidx.compose.ui.draw.blur
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
import com.luckyvault.ui.theme.*

@Composable
fun VaultLogo(
    modifier: Modifier = Modifier,
    size: Int = 80
) {
    Box(
        modifier = modifier.size(size.dp),
        contentAlignment = Alignment.Center
    ) {
        // Outer glow
        Box(
            modifier = Modifier
                .size((size * 1.6).dp)
                .drawBehind {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Gold.copy(alpha = 0.25f),
                                Color.Transparent
                            ),
                            radius = this.size.minDimension / 2
                        )
                    )
                }
        )

        // Vault dial SVG rendered as Compose Canvas
        androidx.compose.foundation.Canvas(
            modifier = Modifier.size(size.dp)
        ) {
            val cx = this.size.width / 2
            val cy = this.size.height / 2
            val outerRadius = this.size.minDimension / 2 * 0.95f
            val ringWidth = outerRadius * 0.08f

            // Dark base
            drawCircle(
                color = Color(0xFF0A120B),
                radius = outerRadius
            )

            // Gold ring
            drawCircle(
                color = Gold,
                radius = outerRadius,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = ringWidth)
            )

            // Inner ring
            drawCircle(
                color = Gold.copy(alpha = 0.3f),
                radius = outerRadius * 0.88f,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1f)
            )

            // Tick marks
            for (i in 0 until 12) {
                val angle = Math.toRadians((i * 30 - 90).toDouble())
                val isCardinal = i % 3 == 0
                val innerR = if (isCardinal) outerRadius * 0.72f else outerRadius * 0.78f
                val outerR = outerRadius * 0.88f

                drawLine(
                    color = if (isCardinal) GoldBright else Gold.copy(alpha = 0.6f),
                    start = Offset(
                        cx + innerR * kotlin.math.cos(angle).toFloat(),
                        cy + innerR * kotlin.math.sin(angle).toFloat()
                    ),
                    end = Offset(
                        cx + outerR * kotlin.math.cos(angle).toFloat(),
                        cy + outerR * kotlin.math.sin(angle).toFloat()
                    ),
                    strokeWidth = if (isCardinal) 3f else 1.5f,
                    cap = androidx.compose.ui.graphics.StrokeCap.Round
                )
            }

            // Center knob ring
            drawCircle(
                color = GoldDark,
                radius = outerRadius * 0.28f,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2f)
            )

            // Center knob
            drawCircle(
                color = Gold,
                radius = outerRadius * 0.24f
            )

            // Knob inner ring
            drawCircle(
                color = GoldDark.copy(alpha = 0.5f),
                radius = outerRadius * 0.17f,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1f)
            )

            // Center dot
            drawCircle(
                color = Color(0xFF0D1B0E),
                radius = outerRadius * 0.07f
            )

            // Handle bar
            drawLine(
                color = GoldBright,
                start = Offset(cx, cy - outerRadius * 0.28f),
                end = Offset(cx, cy + outerRadius * 0.28f),
                strokeWidth = 4f,
                cap = androidx.compose.ui.graphics.StrokeCap.Round
            )

            // Handle endpoints
            drawCircle(
                color = GoldBright,
                radius = 3f,
                center = Offset(cx, cy - outerRadius * 0.28f)
            )
            drawCircle(
                color = GoldBright,
                radius = 3f,
                center = Offset(cx, cy + outerRadius * 0.28f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
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

    // Logo float animation
    val infiniteTransition = rememberInfiniteTransition(label = "logo_float")
    val logoOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = EaseInOutSine),
            repeatMode = RepeatMode.Reverse
        ),
        label = "logo_offset"
    )

    LaunchedEffect(uiState.isRegistered) {
        if (uiState.isRegistered) onNavigateToHome()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        // Ambient glow effects
        Box(
            modifier = Modifier
                .size(400.dp)
                .offset(x = (-100).dp, y = (-150).dp)
                .blur(120.dp)
                .drawBehind {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(Gold.copy(alpha = 0.12f), Color.Transparent)
                        )
                    )
                }
        )
        Box(
            modifier = Modifier
                .size(350.dp)
                .offset(x = 200.dp, y = 600.dp)
                .blur(100.dp)
                .drawBehind {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(Primary.copy(alpha = 0.15f), Color.Transparent)
                        )
                    )
                }
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Glassmorphic card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .drawBehind {
                        // Card background with glass effect
                        drawRect(
                            color = Color(0x1A162418)
                        )
                        // Subtle gold border glow
                        drawRect(
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    Gold.copy(alpha = 0.15f),
                                    Color.Transparent,
                                    Gold.copy(alpha = 0.1f)
                                )
                            ),
                            style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1f)
                        )
                    }
                    .clip(RoundedCornerShape(28.dp))
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Floating vault logo
                    Box(
                        modifier = Modifier
                            .offset(y = logoOffset.dp)
                    ) {
                        VaultLogo(size = 88)
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // App name with gradient
                    Text(
                        text = "LUCKY VAULT",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 4.sp,
                        brush = Brush.linearGradient(
                            colors = listOf(GoldBright, Gold, GoldDark)
                        )
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = if (isLoginMode) "Welcome back" else "Create your account",
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnBackgroundMuted,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(36.dp))

                    // Email field
                    GlassTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = "Email",
                        icon = Icons.Default.Email,
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next,
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Display Name (signup only)
                    AnimatedVisibility(
                        visible = !isLoginMode,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Column {
                            GlassTextField(
                                value = displayName,
                                onValueChange = { displayName = it },
                                label = "Display Name",
                                icon = Icons.Default.Person,
                                imeAction = ImeAction.Next,
                                onNext = { focusManager.moveFocus(FocusDirection.Down) }
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                        }
                    }

                    // Password field
                    GlassTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = "Password",
                        icon = Icons.Default.Lock,
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

                    // Error message
                    AnimatedVisibility(visible = uiState.error != null) {
                        Text(
                            text = uiState.error ?: "",
                            color = Error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(top = 12.dp),
                            textAlign = TextAlign.Center
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    // Sign In / Create Account button
                    Button(
                        onClick = {
                            if (isLoginMode) viewModel.login(email, password)
                            else viewModel.register(email, password, displayName.ifBlank { null })
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = !uiState.isLoading && email.isNotBlank() && password.length >= 8,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent
                        ),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = if (uiState.isLoading || email.isBlank() || password.length < 8)
                                            listOf(GoldDark.copy(alpha = 0.4f), GoldMuted.copy(alpha = 0.4f))
                                        else listOf(GoldLight, Gold, GoldDark)
                                    ),
                                    shape = RoundedCornerShape(16.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (uiState.isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Background,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    text = if (isLoginMode) "SIGN IN" else "CREATE ACCOUNT",
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 2.sp,
                                    color = Background
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Divider
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Gold.copy(alpha = 0.2f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Toggle login/signup
                    Text(
                        text = if (isLoginMode) "Don't have an account? Sign up" else "Already have an account? Sign in",
                        color = Gold.copy(alpha = 0.6f),
                        modifier = Modifier.clickable {
                            isLoginMode = !isLoginMode
                            viewModel.clearError()
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}

@Composable
fun GlassTextField(
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
        label = { Text(label, color = OnBackgroundMuted) },
        leadingIcon = {
            Icon(
                icon,
                contentDescription = null,
                tint = Gold.copy(alpha = 0.5f),
                modifier = Modifier.size(20.dp)
            )
        },
        trailingIcon = if (isPassword) {
            {
                IconButton(onClick = { onTogglePassword?.invoke() }) {
                    Icon(
                        if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = "Toggle password",
                        tint = Gold.copy(alpha = 0.4f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        } else null,
        visualTransformation = if (isPassword && !passwordVisible) PasswordVisualTransformation() else VisualTransformation.None,
        modifier = Modifier.fillMaxWidth(),
        keyboardOptions = KeyboardOptions(
            keyboardType = keyboardType,
            imeAction = imeAction
        ),
        keyboardActions = KeyboardActions(
            onNext = { onNext?.invoke() },
            onDone = { onDone?.invoke() }
        ),
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Gold.copy(alpha = 0.5f),
            unfocusedBorderColor = Gold.copy(alpha = 0.12f),
            focusedContainerColor = Background.copy(alpha = 0.6f),
            unfocusedContainerColor = Background.copy(alpha = 0.4f),
            focusedTextColor = OnSurface,
            unfocusedTextColor = OnSurface,
            cursorColor = Gold,
            focusedLeadingIconColor = Gold.copy(alpha = 0.7f),
            unfocusedLeadingIconColor = Gold.copy(alpha = 0.35f)
        )
    )
}
