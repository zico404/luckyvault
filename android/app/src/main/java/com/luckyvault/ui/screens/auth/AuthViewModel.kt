package com.luckyvault.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.UserDto
import com.luckyvault.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: UserDto? = null,
    val error: String? = null,
    val snackbarMessage: String? = null,
    val isRegistered: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        checkLoginStatus()
    }

    private fun checkLoginStatus() {
        viewModelScope.launch {
            if (authRepository.isLoggedIn()) {
                _uiState.value = _uiState.value.copy(isRegistered = true)
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.login(email, password)
            result.fold(
                onSuccess = { user ->
                    _uiState.value = _uiState.value.copy(isLoading = false, user = user, isRegistered = true)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message, snackbarMessage = e.message)
                }
            )
        }
    }

    fun register(email: String, password: String, displayName: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.register(email, password, displayName)
            result.fold(
                onSuccess = { user ->
                    _uiState.value = _uiState.value.copy(isLoading = false, user = user, isRegistered = true)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message, snackbarMessage = e.message)
                }
            )
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState()
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearSnackbar() {
        _uiState.value = _uiState.value.copy(snackbarMessage = null)
    }
}
