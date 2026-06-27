package com.luckyvault.ui.screens.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.ApiService
import com.luckyvault.data.remote.TopUpRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TopUpUiState(
    val isLoading: Boolean = false,
    val success: Boolean = false,
    val pendingAmount: Double? = null,
    val error: String? = null
)

@HiltViewModel
class TopUpViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(TopUpUiState())
    val uiState: StateFlow<TopUpUiState> = _uiState.asStateFlow()

    fun topUp(amount: Double, paymentMethod: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.topUp(TopUpRequest(amount, paymentMethod))
                if (response.isSuccessful && response.body()?.success == true) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        success = true,
                        pendingAmount = amount
                    )
                } else {
                    val msg = response.body()?.message ?: "Top-up failed"
                    _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Top-up failed. Please try again."
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
