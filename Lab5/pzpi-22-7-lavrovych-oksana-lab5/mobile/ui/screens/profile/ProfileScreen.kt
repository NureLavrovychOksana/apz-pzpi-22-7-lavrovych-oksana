package com.example.safezonetracker.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.safezonetracker.data.model.User

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onLogout: () -> Unit
) {
    val profileState by viewModel.profileUiState.collectAsState()
    val notificationPrefs by viewModel.notificationPreferences.collectAsState()

    val authToken by viewModel.repository.authToken.collectAsState(initial = "initial")
    if (authToken == null) {
        onLogout()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        // --- Секція даних профілю ---
        when (val state = profileState) {
            is ProfileDataUiState.Loading -> {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is ProfileDataUiState.Error -> {
                Text(
                    text = state.message,
                    color = MaterialTheme.colorScheme.error
                )
            }
            is ProfileDataUiState.Success -> {
                ProfileInfoSection(user = state.user)
            }
        }

        Divider(modifier = Modifier.padding(vertical = 24.dp))

        // --- Секція налаштувань сповіщень ---
        NotificationSettingsSection(
            prefs = notificationPrefs,
            onPreferenceChange = { viewModel.updateNotificationPreference(it) }
        )

        Spacer(modifier = Modifier.weight(1f)) // Займає вільний простір

        // --- Кнопка виходу ---
        Button(
            onClick = { viewModel.logout() },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
        ) {
            Text("Вийти з акаунту")
        }
    }
}

@Composable
fun ProfileInfoSection(user: User) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Профіль користувача", style = MaterialTheme.typography.titleLarge)
        Text(user.name, style = MaterialTheme.typography.headlineSmall)
        Text(user.email, style = MaterialTheme.typography.bodyMedium)
        Text("Роль: ${user.role}", style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun NotificationSettingsSection(
    prefs: com.example.safezonetracker.data.model.NotificationPreferences,
    onPreferenceChange: (com.example.safezonetracker.data.model.NotificationPreferences) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Налаштування сповіщень", style = MaterialTheme.typography.titleLarge)

        PreferenceSwitch(
            title = "Сповіщення про пожежу",
            checked = prefs.receiveFireAlerts,
            onCheckedChange = { onPreferenceChange(prefs.copy(receiveFireAlerts = it)) }
        )
        PreferenceSwitch(
            title = "Сповіщення про витік газу",
            checked = prefs.receiveGasAlerts,
            onCheckedChange = { onPreferenceChange(prefs.copy(receiveGasAlerts = it)) }
        )
        PreferenceSwitch(
            title = "Сповіщення про перегрів",
            checked = prefs.receiveOverheatAlerts,
            onCheckedChange = { onPreferenceChange(prefs.copy(receiveOverheatAlerts = it)) }
        )
    }
}

@Composable
fun PreferenceSwitch(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(title, style = MaterialTheme.typography.bodyLarge)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}