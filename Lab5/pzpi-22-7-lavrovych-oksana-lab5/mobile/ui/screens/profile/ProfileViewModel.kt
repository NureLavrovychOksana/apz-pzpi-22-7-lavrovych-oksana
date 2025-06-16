package com.example.safezonetracker.ui.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.safezonetracker.data.model.NotificationPreferences
import com.example.safezonetracker.data.model.User
import com.example.safezonetracker.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface ProfileDataUiState {
    object Loading : ProfileDataUiState
    data class Success(val user: User) : ProfileDataUiState
    data class Error(val message: String) : ProfileDataUiState
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
     val repository: AppRepository
) : ViewModel() {

    // 1. Стан для даних профілю (ім'я, email і т.д.)
    private val _profileUiState = MutableStateFlow<ProfileDataUiState>(ProfileDataUiState.Loading)
    val profileUiState: StateFlow<ProfileDataUiState> = _profileUiState.asStateFlow()

    // 2. Стан для налаштувань сповіщень (зберігається локально)
    val notificationPreferences: StateFlow<NotificationPreferences> =
        repository.notificationPreferences.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = NotificationPreferences(true, true, true) // Початкове значення
        )

    init {
        loadUserProfile()
    }

    private fun loadUserProfile() {
        viewModelScope.launch {
            _profileUiState.value = ProfileDataUiState.Loading
            try {
                val user = repository.getMyProfile()
                _profileUiState.value = ProfileDataUiState.Success(user)
            } catch (e: Exception) {
                _profileUiState.value = ProfileDataUiState.Error(e.message ?: "Не вдалося завантажити профіль")
            }
        }
    }

    /**
     * Оновлює налаштування сповіщень, зберігаючи їх локально.
     */
    fun updateNotificationPreference(newPrefs: NotificationPreferences) {
        viewModelScope.launch {
            repository.saveNotificationPreferences(newPrefs)
        }
    }

    /**
     * Виконує вихід з системи.
     */
    fun logout() {
        viewModelScope.launch {
            repository.logout()
        }
    }
}