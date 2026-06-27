package com.luckyvault.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.luckyvault.ui.screens.auth.AuthScreen
import com.luckyvault.ui.screens.home.HomeScreen
import com.luckyvault.ui.screens.tickets.BuyTicketScreen
import com.luckyvault.ui.screens.tickets.MyTicketsScreen
import com.luckyvault.ui.screens.wallet.WalletScreen
import com.luckyvault.ui.screens.wallet.TopUpScreen
import com.luckyvault.ui.screens.profile.ProfileScreen
import com.luckyvault.ui.screens.notifications.NotificationsScreen
import com.luckyvault.ui.screens.draws.DrawDetailScreen

object Routes {
    const val AUTH = "auth"
    const val HOME = "home"
    const val BUY_TICKET = "buy_ticket/{drawId}"
    const val MY_TICKETS = "my_tickets"
    const val WALLET = "wallet"
    const val TOP_UP = "topup"
    const val PROFILE = "profile"
    const val NOTIFICATIONS = "notifications"
    const val DRAW_DETAIL = "draw_detail/{drawId}"

    fun buyTicket(drawId: String) = "buy_ticket/$drawId"
    fun drawDetail(drawId: String) = "draw_detail/$drawId"
}

@Composable
fun LuckyVaultNavGraph() {
    val navController = rememberNavController()

    val enterTransition: (AnimatedContentTransitionScope<*>.() -> EnterTransition) = {
        fadeIn(animationSpec = tween(300)) + slideInHorizontally(
            initialOffsetX = { it / 4 },
            animationSpec = tween(300)
        )
    }

    val exitTransition: (AnimatedContentTransitionScope<*>.() -> ExitTransition) = {
        fadeOut(animationSpec = tween(300))
    }

    NavHost(
        navController = navController,
        startDestination = Routes.AUTH,
        enterTransition = enterTransition,
        exitTransition = exitTransition
    ) {
        composable(Routes.AUTH) {
            AuthScreen(
                onNavigateToHome = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.AUTH) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.HOME) {
            HomeScreen(
                onBuyTicket = { drawId -> navController.navigate(Routes.buyTicket(drawId)) },
                onNavigateToWallet = { navController.navigate(Routes.WALLET) },
                onNavigateToTickets = { navController.navigate(Routes.MY_TICKETS) },
                onNavigateToProfile = { navController.navigate(Routes.PROFILE) },
                onNavigateToNotifications = { navController.navigate(Routes.NOTIFICATIONS) },
                onDrawDetail = { drawId -> navController.navigate(Routes.drawDetail(drawId)) }
            )
        }

        composable(
            Routes.BUY_TICKET,
            arguments = listOf(navArgument("drawId") { type = NavType.StringType })
        ) {
            BuyTicketScreen(
                onBack = { navController.popBackStack() },
                onTicketPurchased = {
                    navController.navigate(Routes.MY_TICKETS) {
                        popUpTo(Routes.HOME)
                    }
                }
            )
        }

        composable(Routes.MY_TICKETS) {
            MyTicketsScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.WALLET) {
            WalletScreen(
                onBack = { navController.popBackStack() },
                onNavigateToTopUp = { navController.navigate(Routes.TOP_UP) }
            )
        }

        composable(Routes.TOP_UP) {
            TopUpScreen(
                onBack = { navController.popBackStack() },
                onNavigateToWallet = { navController.navigate(Routes.WALLET) { popUpTo(Routes.WALLET) { inclusive = true } } }
            )
        }

        composable(Routes.PROFILE) {
            ProfileScreen(
                onBack = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Routes.AUTH) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.NOTIFICATIONS) {
            NotificationsScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            Routes.DRAW_DETAIL,
            arguments = listOf(navArgument("drawId") { type = NavType.StringType })
        ) { backStackEntry ->
            val drawId = backStackEntry.arguments?.getString("drawId") ?: return@composable
            DrawDetailScreen(
                drawId = drawId,
                onBack = { navController.popBackStack() },
                onBuyTicket = { id -> navController.navigate(Routes.buyTicket(id)) }
            )
        }
    }
}
