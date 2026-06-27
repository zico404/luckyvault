package com.luckyvault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.luckyvault.ui.screens.splash.SplashScreen
import com.luckyvault.ui.theme.LuckyVaultTheme
import com.luckyvault.ui.navigation.LuckyVaultNavGraph
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        var showSplash by remember { mutableStateOf(true) }

        splashScreen.setKeepOnScreenCondition { showSplash }

        setContent {
            LuckyVaultTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AnimatedContent(
                        targetState = showSplash,
                        transitionSpec = {
                            fadeIn(animationSpec = tween(300)) togetherWith
                                fadeOut(animationSpec = tween(300))
                        },
                        label = "splash_transition"
                    ) { isSplash ->
                        if (isSplash) {
                            SplashScreen(onSplashComplete = { showSplash = false })
                        } else {
                            LuckyVaultNavGraph()
                        }
                    }
                }
            }
        }
    }
}
