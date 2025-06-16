package com.example.safezonetracker.ui.screens.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.safezonetracker.data.model.Threat
import com.example.safezonetracker.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface HistoryUiState {
    object Loading : HistoryUiState
    data class Success(val threats: List<Threat>) : HistoryUiState
    data class Error(val message: String) : HistoryUiState
}

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val repository: AppRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<HistoryUiState>(HistoryUiState.Loading)
    val uiState: StateFlow<HistoryUiState> = _uiState.asStateFlow()

    init {
        loadHistory()
    }

    private fun loadHistory() {
        viewModelScope.launch {
            _uiState.value = HistoryUiState.Loading
            try {
                val allThreats = repository.getAllThreats()
                _uiState.value = HistoryUiState.Success(allThreats)
            } catch (e: Exception) {
                _uiState.value = HistoryUiState.Error("Не вдалося завантажити історію")
            }
        }
    }
}