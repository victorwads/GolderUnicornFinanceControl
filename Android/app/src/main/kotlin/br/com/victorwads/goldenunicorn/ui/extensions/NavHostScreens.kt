package br.com.victorwads.goldenunicorn.ui.extensions

import androidx.compose.animation.AnimatedContentScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.navDeepLink
import br.com.victorwads.goldenunicorn.features.Screens

@Composable
fun NavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController,
    startDestination: Screens,
    builder: NavGraphBuilder.() -> Unit
) = androidx.navigation.compose.NavHost(
    modifier = modifier,
    navController = navController,
    startDestination = startDestination.route,
    builder = builder
)

fun NavGraphBuilder.composable(
    screen: Screens,
    content: @Composable() (AnimatedContentScope.(NavBackStackEntry) -> Unit)
) = composable(
    route = screen.route,
    deepLinks = listOf(navDeepLink { uriPattern = screen.deepLink }),
    content = content
)
