package com.example.safezonetracker.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.*
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.example.safezonetracker.data.repository.AppRepository
import com.example.safezonetracker.ui.screens.dashboard.DashboardScreen
import com.example.safezonetracker.ui.screens.details.DetailsScreen
import com.example.safezonetracker.ui.screens.history.HistoryScreen
import com.example.safezonetracker.ui.screens.login.LoginScreen
import com.example.safezonetracker.ui.screens.login.LoginViewModel
import com.example.safezonetracker.ui.screens.profile.ProfileScreen
import kotlinx.coroutines.flow.collectLatest


object Graph {
    const val AUTH = "auth_graph"
    const val MAIN = "main_graph"
    const val LOGIN = "login"
    const val DETAILS = "details/{threatId}"
}

sealed class BottomBarScreen(val route: String, val label: String, val icon: ImageVector) {
    object Dashboard : BottomBarScreen("dashboard", "Головна", Icons.Default.Home)
    object History : BottomBarScreen("history", "Історія", Icons.Default.History)
    object Profile : BottomBarScreen("profile", "Профіль", Icons.Default.Person)
}

private val bottomNavItems = listOf(
    BottomBarScreen.Dashboard,
    BottomBarScreen.History,
    BottomBarScreen.Profile,
)

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentRoute = navBackStackEntry?.destination?.route
            if (bottomNavItems.any { it.route == currentRoute }) {
                AppBottomBar(navController = navController)
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Graph.AUTH,
            modifier = Modifier.padding(innerPadding)
        ) {
            // Граф для неавторизованого користувача
            navigation(startDestination = Graph.LOGIN, route = Graph.AUTH) {
                composable(Graph.LOGIN) {
                    val appRepository: AppRepository = hiltViewModel<LoginViewModel>().repository // Отримуємо доступ до репозиторію


                    val authToken by appRepository.authToken.collectAsState(initial = null)

                    LaunchedEffect(authToken) {
                        if (authToken != null) {
                            navController.navigateToMainGraph()
                        }
                    }

                    if (authToken == null) {
                        LoginScreen(onLoginSuccess = { navController.navigateToMainGraph() })
                    }
                }
            }

            // Граф для авторизованого користувача
            navigation(startDestination = BottomBarScreen.Dashboard.route, route = Graph.MAIN) {
                composable(BottomBarScreen.Dashboard.route) {
                    DashboardScreen(
                        onThreatClick = { threatId ->
                            navController.navigate("details/$threatId")
                        },
                        onLogout = {
                            navController.navigateToAuthGraph()
                        }
                    )
                }
                composable(BottomBarScreen.History.route) {
                    HistoryScreen(
                        onThreatClick = { threatId ->
                            navController.navigate("details/$threatId")
                        }
                    )
                }
                composable(BottomBarScreen.Profile.route) {
                    ProfileScreen(
                        onLogout = {
                            navController.navigateToAuthGraph()
                        }
                    )
                }
                composable(
                    route = Graph.DETAILS,
                    arguments = listOf(navArgument("threatId") { type = NavType.IntType })
                ) {
                    DetailsScreen(onBack = { navController.popBackStack() })
                }
            }
        }
    }
}

@Composable
private fun AppBottomBar(navController: NavHostController) {
    NavigationBar {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentDestination = navBackStackEntry?.destination

        bottomNavItems.forEach { screen ->
            NavigationBarItem(
                icon = { Icon(screen.icon, contentDescription = screen.label) },
                label = { Text(screen.label) },
                selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                onClick = {
                    navController.navigate(screen.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}

// Функції-розширення для чистої навігації
fun NavController.navigateToMainGraph() {
    this.navigate(Graph.MAIN) {
        popUpTo(Graph.AUTH) { inclusive = true }
    }
}

fun NavController.navigateToAuthGraph() {
    this.navigate(Graph.AUTH) {
        popUpTo(Graph.MAIN) { inclusive = true }
    }
}