package com.example.safezonetracker.ui.screens.details

import androidx.lifecycle.SavedStateHandle
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

sealed interface DetailsUiState {
    object Loading : DetailsUiState
    data class Success(val threat: Threat) : DetailsUiState
    data class Error(val message: String) : DetailsUiState
}

@HiltViewModel
class DetailsViewModel @Inject constructor(
    private val repository: AppRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow<DetailsUiState>(DetailsUiState.Loading)
    val uiState: StateFlow<DetailsUiState> = _uiState.asStateFlow()

    private val threatId: Int = checkNotNull(savedStateHandle["threatId"])

    init {
        loadThreatDetails()
    }

    private fun loadThreatDetails() {
        viewModelScope.launch {
            _uiState.value = DetailsUiState.Loading
            try {
                val allThreats = repository.getAllThreats()
                val threat = allThreats.find { it.id == threatId }
                if (threat != null) {
                    _uiState.value = DetailsUiState.Success(threat)
                } else {
                    _uiState.value = DetailsUiState.Error("Загрозу не знайдено")
                }
            } catch (e: Exception) {
                _uiState.value = DetailsUiState.Error("Помилка завантаження деталей")
            }
        }
    }
}